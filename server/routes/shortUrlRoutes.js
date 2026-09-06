import { Router } from "express";
import { createShortUrl, deleteShortUrl, listShortUrls } from "../controllers/shortUrlController.js";
import { authenticate } from "../middleware/authenticate.js";

const router = Router();
router.get("/", authenticate, listShortUrls);
router.post("/", authenticate, createShortUrl);
router.delete("/:id", authenticate, deleteShortUrl);

export default router;