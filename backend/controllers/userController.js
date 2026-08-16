const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { MongoClient, ObjectId } = require("mongodb");
const dotenv = require("dotenv");

 


dotenv.config();
const mongoURI = process.env.MONGODB_URL;
console.log("DEBUG mongoURI:", mongoURI);

let client;

 

async function connectClient() {
    if (!client) {
        client = new MongoClient(mongoURI);
        await client.connect();
    }
}


const signup = async (req, res) => {
    const { username, password, email } = req.body;
    try {
        await connectClient();
        const db = client.db("githubclone");
        const usersCollection = db.collection("users");

        const user = await usersCollection.findOne({ username });
        if (user) {
            return res.status(400).json({ message: "User already exists!" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = {
                username,
                password: hashedPassword,
                email,
                repositories: [],
                followedUsers: [],
                starRepos: [],
            };

        const result = await usersCollection.insertOne(newUser);

        const token = jwt.sign({ id: result.insertedId, username }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        res.status(201).json({ message: "User registered successfully!", token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        await connectClient();
        const db = client.db("githubclone");
        const usersCollection = db.collection("users");

        const user = await usersCollection.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.status(200).json({ message: "Login successful!", token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

const getAllUsers = async (req, res) => {
    try {
        await connectClient();
        const db = client.db("githubclone");
        const usersCollection = db.collection("users");

        const users = await usersCollection.find({}).toArray();
        res.status(200).json(users);
    } catch (err) {
        console.error("Error during fetching : ", err.message);
        res.status(500).send("Server error!");
    }
};

async function getUserProfile(req, res) {
    const { id } = req.params;
    try {
        await connectClient();
        const db = client.db("githubclone");
        const usersCollection = db.collection("users");

        const user = await usersCollection.findOne({ _id: new ObjectId(id) });
        if (!user) {
            return res.status(400).json({ message: "User not found!" });
        }

        const { password, ...userProfile } = user;
        res.status(200).json({ user: userProfile, message: "Profile fetched!" });
    } catch (err) {
        console.error("Error during fetching : ", err.message);
        res.status(500).send("Server error!");
    }
}


async function updateUserProfile(req, res) {
    const currentID = req.params.id;
    const { password, ...updateData } = req.body;

    try {
        await connectClient();
        const db = client.db("githubclone");
        const usersCollection = db.collection("users");

        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        const result = await usersCollection.findOneAndUpdate(
            { _id: new ObjectId(currentID) },
            { $set: updateData },
            { returnDocument: "after" }
        );

        if (!result) {
            return res.status(404).json({ message: "User not found!" });
        }

        const { password: _, ...updatedUserProfile } = result;
        res.status(200).json({ user: updatedUserProfile, message: "Profile updated successfully!" });
    } catch (err) {
        console.error("Error during updating : ", err.message);
        res.status(500).send("Server error!");
    }
}

async function deleteUserProfile(req, res) {
    const { id } = req.params;
    try {
        await connectClient();
        const db = client.db("githubclone");
        const usersCollection = db.collection("users");

        const result = await usersCollection.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "User not found!" });
        }

        res.status(200).json({ message: "User profile deleted successfully!" });
    } catch (err) {
        console.error("Error during deleting user profile:", err.message);
        res.status(500).send("Server error!");
    }
}

module.exports = {
    getAllUsers,
    signup,
    login,
    getUserProfile,
    updateUserProfile,
    deleteUserProfile,
};