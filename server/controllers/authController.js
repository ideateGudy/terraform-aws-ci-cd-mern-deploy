import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { REFRESH_TOKEN_SECRET } from "../config/env.js";
import User from "../models/User.js";
import { clearRefreshCookie, createAccessToken, createRefreshToken, isJwtError, readRefreshToken, setRefreshCookie } from "../utils/tokens.js";

const serializeUser = (user) => ({ id: user.id, name: user.name, email: user.email });

export const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json({ user: serializeUser(user) });
    } catch (error) {
        next(error);
    }
};

export const updateProfile = async (req, res, next) => {
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    if (!name || !email) return res.status(400).json({ error: "Name and email are required" });

    try {
        const existingUser = await User.findOne({ email, _id: { $ne: req.userId } });
        if (existingUser) return res.status(409).json({ error: "An account with that email already exists" });
        const user = await User.findByIdAndUpdate(req.userId, { name, email }, { new: true, runValidators: true });
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json({ user: serializeUser(user) });
    } catch (error) {
        next(error);
    }
};

export const register = async (req, res, next) => {
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";
    if (!name || !email || password.length < 8) return res.status(400).json({ error: "Name, email, and a password of at least 8 characters are required" });

    try {
        if (await User.findOne({ email })) return res.status(409).json({ error: "An account with that email already exists" });
        const user = await User.create({ name, email, passwordHash: await bcrypt.hash(password, 12) });
        const refreshToken = createRefreshToken(user.id);
        user.refreshTokenHash = await bcrypt.hash(refreshToken, 12);
        await user.save();
        setRefreshCookie(res, refreshToken);
        res.status(201).json({ accessToken: createAccessToken(user.id), user: serializeUser(user) });
    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";
    try {
        const user = await User.findOne({ email }).select("+passwordHash");
        if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ error: "Invalid email or password" });
        const refreshToken = createRefreshToken(user.id);
        user.refreshTokenHash = await bcrypt.hash(refreshToken, 12);
        await user.save();
        setRefreshCookie(res, refreshToken);
        res.json({ accessToken: createAccessToken(user.id), user: serializeUser(user) });
    } catch (error) {
        next(error);
    }
};

export const refresh = async (req, res, next) => {
    const refreshToken = readRefreshToken(req);
    if (!refreshToken) return res.status(401).json({ error: "Refresh token required" });
    try {
        const payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
        const user = await User.findById(payload.userId).select("+refreshTokenHash");
        if (!user || !user.refreshTokenHash || !(await bcrypt.compare(refreshToken, user.refreshTokenHash))) return res.status(401).json({ error: "Invalid refresh token" });
        const rotatedToken = createRefreshToken(user.id);
        user.refreshTokenHash = await bcrypt.hash(rotatedToken, 12);
        await user.save();
        setRefreshCookie(res, rotatedToken);
        res.json({ accessToken: createAccessToken(user.id), user: serializeUser(user) });
    } catch (error) {
        if (isJwtError(error)) return res.status(401).json({ error: "Invalid or expired refresh token" });
        next(error);
    }
};

export const logout = async (req, res, next) => {
    const refreshToken = readRefreshToken(req);
    try {
        if (refreshToken) {
            const payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
            await User.findByIdAndUpdate(payload.userId, { $unset: { refreshTokenHash: 1 } });
        }
        clearRefreshCookie(res);
        res.status(204).end();
    } catch (error) {
        if (isJwtError(error)) {
            clearRefreshCookie(res);
            return res.status(204).end();
        }
        next(error);
    }
};