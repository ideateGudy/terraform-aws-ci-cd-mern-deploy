import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET } from "../config/env.js";

export const authenticate = (req, res, next) => {
    const authorization = req.headers.authorization;
    const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Authentication required" });

    try {
        const payload = jwt.verify(token, ACCESS_TOKEN_SECRET);
        req.userId = payload.userId;
        next();
    } catch {
        res.status(401).json({ error: "Invalid or expired access token" });
    }
};