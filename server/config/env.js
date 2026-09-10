import "dotenv/config";

export const PORT = process.env.PORT || 3000;
export const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
export const SERVER_URL = process.env.SERVER_URL || process.env.SERVER_URL || `http://localhost:${PORT}`;
export const MONGODB_URI = process.env.MONGODB_URI?.trim();
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
export const NODE_ENV = process.env.NODE_ENV || "development";

export const validateEnvironment = () => {
    if (!MONGODB_URI || MONGODB_URI === "paste-your-mongodb-connection-string-here") {
        throw new Error("MONGODB_URI is required. Add it to server/.env.");
    }
    if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
        throw new Error("ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET are required in server/.env.");
    }
};