import { Router } from "express";
import { getProfile, login, logout, refresh, register, updateProfile } from "../controllers/authController.js";
import { authenticate } from "../middleware/authenticate.js";

const router = Router();
router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/profile", authenticate, getProfile);
router.patch("/profile", authenticate, updateProfile);

export default router;