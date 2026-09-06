import cors from "cors";
import express from "express";
import authRoutes from "./routes/authRoutes.js";
import shortUrlRoutes from "./routes/shortUrlRoutes.js";
import diaryRoutes from "./routes/diaryRoutes.js";
import { redirectShortUrl } from "./controllers/shortUrlController.js";
import { connectDatabase } from "./config/database.js";
import { CLIENT_URL, PORT, validateEnvironment } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());
app.get("/healthz", (_req, res) => res.status(200).json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.get("/s/:shortCode", redirectShortUrl);
app.use("/api/shortener", shortUrlRoutes);
app.use("/api/diary", diaryRoutes);
app.use(errorHandler);

const startServer = async () => {
    validateEnvironment();
    await connectDatabase();
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
};

startServer().catch((error) => {
    console.error("Unable to start server:", error.message);
    process.exit(1);
});
