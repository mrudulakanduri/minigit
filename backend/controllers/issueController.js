const mongoose = require("mongoose");
const Repository = require("../models/repoModel");
const User = require("../models/userModel");
const Issue = require("../models/issueModel");

async function createIssue(req, res) {
    const { title, description, repository } = req.body;
    try {
        const issue = new Issue({
            title,
            description,
            repository,
        });

        await issue.save();
        res.status(201).json({ message: "Issue created successfully!", issue });
    } catch (err) {
        console.error("Error during issue creation : ", err.message);
        res.status(500).send("Server error!");
    }
}

async function updateIssueById(req, res) {
    const { id } = req.params;
    const { title, description, status } = req.body;
    try {
        const issue = await Issue.findByIdAndUpdate(
            id,
            { $set: { title, description, status } },
            { new: true }
        );

        if (!issue) {
            return res.status(404).json({ error: "Issue not found!" });
        }

        res.json({ message: "Issue updated successfully!", issue });
    } catch (err) {
        console.error("Error during updating issue : ", err.message);
        res.status(500).send("Server error!");
    }
}

async function deleteIssueById(req, res) {
    const { id } = req.params;
    try {
        const issue = await Issue.findByIdAndDelete(id);
        if (!issue) {
            return res.status(404).json({ error: "Issue not found!" });
        }

        res.json({ message: "Issue deleted successfully!" });
    } catch (err) {
        console.error("Error during deleting issue : ", err.message);
        res.status(500).send("Server error!");
    }
}

async function getAllIssues(req, res) {
    const { id } = req.params;
    try {
        const issues = await Issue.find({ repository: id });
        res.json(issues);
    } catch (err) {
        console.error("Error during fetching issues : ", err.message);
        res.status(500).send("Server error!");
    }
}

async function getIssueById(req, res) {
    const { id } = req.params;
    try {
        const issue = await Issue.findById(id);
        if (!issue) {
            return res.status(404).json({ error: "Issue not found!" });
        }

        res.json(issue);
    } catch (err) {
        console.error("Error during fetching issue : ", err.message);
        res.status(500).send("Server error!");
    }
}

module.exports = {
    createIssue,
    updateIssueById,
    deleteIssueById,
    getAllIssues,
    getIssueById,
};