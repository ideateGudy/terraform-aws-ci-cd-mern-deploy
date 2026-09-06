import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET, NODE_ENV, REFRESH_TOKEN_SECRET } from "../config/env.js";

export const REFRESH_COOKIE = "refreshToken";
export const createAccessToken = (userId) => jwt.sign({ userId }, ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
export const createRefreshToken = (userId) => jwt.sign({ userId }, REFRESH_TOKEN_SECRET, { expiresIn: "7d" });

export const setRefreshCookie = (res, token) => {
    res.cookie(REFRESH_COOKIE, token, { httpOnly: true, sameSite: "lax", secure: NODE_ENV === "production", maxAge: 7 * 24 * 60 * 60 * 1000 });
};

export const clearRefreshCookie = (res) => res.clearCookie(REFRESH_COOKIE, { httpOnly: true, sameSite: "lax", secure: NODE_ENV === "production" });
export const readRefreshToken = (req) => req.headers.cookie?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${REFRESH_COOKIE}=`))?.slice(REFRESH_COOKIE.length + 1);
export const isJwtError = (error) => error.name === "JsonWebTokenError" || error.name === "TokenExpiredError";