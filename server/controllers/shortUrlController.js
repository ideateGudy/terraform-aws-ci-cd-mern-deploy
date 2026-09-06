import { randomBytes } from "node:crypto";
import mongoose from "mongoose";
import ShortUrl from "../models/ShortUrl.js";

const isHttpUrl = (value) => {
    try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch {
        return false;
    }
};

const createCode = () => randomBytes(4).toString("base64url");

const getPublicUrl = (req) => process.env.PUBLIC_URL || `${req.protocol}://${req.get("host")}`;

const serializeShortUrl = (shortUrl, req) => ({
    ...shortUrl.toJSON(),
    shortUrl: `${getPublicUrl(req)}/s/${shortUrl.shortCode}`,
});

export const listShortUrls = async (req, res, next) => {
    try {
        const shortUrls = await ShortUrl.find({ user: req.userId }).sort({ createdAt: -1 });
        res.json(shortUrls.map((shortUrl) => serializeShortUrl(shortUrl, req)));
    } catch (error) {
        next(error);
    }
};

export const createShortUrl = async (req, res, next) => {
    const originalUrl = typeof req.body.originalUrl === "string" ? req.body.originalUrl.trim() : "";
    if (!isHttpUrl(originalUrl)) return res.status(400).json({ error: "Enter a valid HTTP or HTTPS URL" });

    try {
        let shortCode = createCode();
        while (await ShortUrl.exists({ shortCode })) shortCode = createCode();
        const shortUrl = await ShortUrl.create({ originalUrl, shortCode, user: req.userId });
        res.status(201).json(serializeShortUrl(shortUrl, req));
    } catch (error) {
        next(error);
    }
};

export const deleteShortUrl = async (req, res, next) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(404).json({ error: "Short URL not found" });
    }

    try {
        const shortUrl = await ShortUrl.findOneAndDelete({ _id: req.params.id, user: req.userId });
        if (!shortUrl) return res.status(404).json({ error: "Short URL not found" });
        res.status(204).end();
    } catch (error) {
        next(error);
    }
};

export const redirectShortUrl = async (req, res, next) => {
    try {
        const shortUrl = await ShortUrl.findOneAndUpdate(
            { shortCode: req.params.shortCode },
            { $inc: { clicks: 1 } },
            { new: true },
        );
        if (!shortUrl) return res.status(404).json({ error: "Short URL not found" });
        res.redirect(shortUrl.originalUrl);
    } catch (error) {
        next(error);
    }
};
