import mongoose from "mongoose";
import DiaryEntry from "../models/DiaryEntry.js";

const notFound = (res) => res.status(404).json({ error: "Diary entry not found" });

export const listEntries = async (req, res, next) => {
    try { res.json(await DiaryEntry.find({ user: req.userId }).sort({ updatedAt: -1 })); } catch (error) { next(error); }
};

export const getEntry = async (req, res, next) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) return notFound(res);
        const entry = await DiaryEntry.findOne({ _id: req.params.id, user: req.userId });
        if (!entry) return notFound(res);
        res.json(entry);
    } catch (error) { next(error); }
};

export const createEntry = async (req, res, next) => {
    const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
    const content = typeof req.body.content === "string" ? req.body.content.trim() : "";
    if (!title) return res.status(400).json({ error: "Title is required" });
    if (!content) return res.status(400).json({ error: "Content is required" });
    try { res.status(201).json(await DiaryEntry.create({ title, content, user: req.userId })); } catch (error) { next(error); }
};

export const updateEntry = async (req, res, next) => {
    if (!mongoose.isValidObjectId(req.params.id)) return notFound(res);
    const updates = {};
    if (typeof req.body.title === "string") updates.title = req.body.title.trim();
    if (typeof req.body.content === "string") updates.content = req.body.content.trim();
    if (Object.keys(updates).length === 0) return res.status(400).json({ error: "No valid fields to update" });
    if (updates.title === "") return res.status(400).json({ error: "Title is required" });
    if (updates.content === "") return res.status(400).json({ error: "Content is required" });
    try {
        const entry = await DiaryEntry.findOneAndUpdate({ _id: req.params.id, user: req.userId }, updates, { new: true, runValidators: true });
        if (!entry) return notFound(res);
        res.json(entry);
    } catch (error) { next(error); }
};

export const deleteEntry = async (req, res, next) => {
    if (!mongoose.isValidObjectId(req.params.id)) return notFound(res);
    try {
        const entry = await DiaryEntry.findOneAndDelete({ _id: req.params.id, user: req.userId });
        if (!entry) return notFound(res);
        res.json(entry);
    } catch (error) { next(error); }
};