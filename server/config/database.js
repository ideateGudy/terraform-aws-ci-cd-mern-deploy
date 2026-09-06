import mongoose from "mongoose";
import { MONGODB_URI } from "./env.js";

export const connectDatabase = () => mongoose.connect(MONGODB_URI);