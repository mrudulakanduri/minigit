const mongoose = require("mongoose");
const Repository = require("../models/repoModel");
const User = require("../models/userModel");
const Issue = require("../models/issueModel");

async function createRepository(req, res) {
    const { owner, name, issues, content, description, visibility } = req.body;

    try {
        if (!name) {
            return res.status(400).json({ error: "Repository name is required!" });
        }

        if (!mongoose.Types.ObjectId.isValid(owner)) {
            return res.status(400).json({ error: "Invalid Owner ID!" });
        }

        const newRepository = new Repository({
            name,
            description,
            visibility,
            owner,
            content,
            issues,
        });

        const result = await newRepository.save();

        res.status(201).json({
            message: "Repository created successfully!",
            repositoryID: result._id,
        });
    } catch (err) {
        console.error("Error during repository creation : ", err.message);
        res.status(500).send("Server error!");
    }
}

async function getAllRepositories(req, res) {
    try {
        const repositories = await Repository.find({})
            .populate("owner")
            .populate("issues");
        res.status(200).json(repositories);
    } catch (err) {
        console.error("Error during fetching repositories : ", err.message);
        res.status(500).send("Server error!");
    }
}

async function fetchRepositoryById(req, res) {
    const { id } = req.params;
    try {
        const repository = await Repository.findById(id)
            .populate("owner")
            .populate("issues");
        
        if (!repository) {
            return res.status(404).json({ error: "Repository not found!" });
        }

        res.status(200).json(repository);
    } catch (err) {
        console.error("Error during fetching repository : ", err.message);
        res.status(500).send("Server error!");
    }
}

async function fetchRepositoryByName(req, res) {
    const { name } = req.params;
    try {
        const repository = await Repository.findOne({ name })
            .populate("owner")
            .populate("issues");

        if (!repository) {
            return res.status(404).json({ error: "Repository not found!" });
        }

        res.status(200).json(repository);
    } catch (err) {
        console.error("Error during fetching repository : ", err.message);
        res.status(500).send("Server error!");
    }
}

async function fetchRepositoriesForCurrentUser(req, res) {
    const { userID } = req.params;
    try {
        const repositories = await Repository.find({ owner: userID });
        if (!repositories || repositories.length === 0) {
            return res.status(404).json({ error: "No repositories found for this user!" });
        }
        res.status(200).json(repositories);
    } catch (err) {
        console.error("Error during fetching user repositories : ", err.message);
        res.status(500).send("Server error!");
    }
}

async function updateRepositoryById(req, res) {
    const { id } = req.params;
    const { content, description } = req.body;
    try {
        const updatedRepo = await Repository.findByIdAndUpdate(
            id,
            { $set: { content, description } },
            { new: true }
        );

        if (!updatedRepo) {
            return res.status(404).json({ error: "Repository not found!" });
        }

        res.status(200).json({ message: "Repository updated successfully!", updatedRepo });
    } catch (err) {
        console.error("Error during repository update : ", err.message);
        res.status(500).send("Server error!");
    }
}

async function deleteRepositoryById(req, res) {
    const { id } = req.params;
    try {
        const deletedRepo = await Repository.findByIdAndDelete(id);

        if (!deletedRepo) {
            return res.status(404).json({ error: "Repository not found!" });
        }

        res.status(200).json({ message: "Repository deleted successfully!" });
    } catch (err) {
        console.error("Error during repository deletion : ", err.message);
        res.status(500).send("Server error!");
    }
}

async function toggleVisibilityById(req, res) {
    const { id } = req.params;
    try {
        const repository = await Repository.findById(id);
        if (!repository) {
            return res.status(404).json({ error: "Repository not found!" });
        }

        repository.visibility = !repository.visibility;
        const updatedRepository = await repository.save();

        res.json({
            message: "Repository visibility toggled successfully!",
            repository: updatedRepository,
        });
    } catch (err) {
        console.error("Error during toggling visibility : ", err.message);
        res.status(500).send("Server error!");
    }
}

 

module.exports = {
    createRepository,
    getAllRepositories,
    fetchRepositoryById,
    fetchRepositoryByName,
    fetchRepositoriesForCurrentUser,
    updateRepositoryById,
    deleteRepositoryById,
    toggleVisibilityById,
};