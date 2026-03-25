import express from "express";
import {
  getUserData,
  updateProfile,
  updateUserRole,
  getAllUsers,
  getUserBookings,
} from "../controllers/userController.js";
import userAuth from "../middlewares/userAuth.js";

const userRouter = express.Router();

// User routes - require authentication
userRouter.get("/data", userAuth, getUserData);
userRouter.put("/update", userAuth, updateProfile);
userRouter.get("/bookings", userAuth, getUserBookings);

// Admin routes - require authentication + admin role check
userRouter.get("/all", userAuth, getAllUsers);
userRouter.put("/update-role", userAuth, updateUserRole);

export default userRouter;
