import express from "express";
import {
  getUserData,
  updateProfile,
  updateUserRole,
  getAllUsers,
} from "../controllers/userController.js";
import userAuth from "../middlewares/userAuth.js";
import upload from "../config/uploadConfig.js";

const userRouter = express.Router();

// User routes - require authentication
userRouter.get("/data", userAuth, getUserData);
userRouter.put("/update", userAuth, upload.single("image"), updateProfile);

// Admin routes - require authentication + admin role check
userRouter.get("/all", userAuth, getAllUsers);
userRouter.put("/update-role", userAuth, updateUserRole);

export default userRouter;
