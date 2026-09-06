import { Router } from "express";
import { createEntry, deleteEntry, getEntry, listEntries, updateEntry } from "../controllers/diaryController.js";
import { authenticate } from "../middleware/authenticate.js";

const router = Router();
router.use(authenticate);
router.get("/", listEntries);
router.get("/:id", getEntry);
router.post("/", createEntry);
router.patch("/:id", updateEntry);
router.delete("/:id", deleteEntry);

export default router;