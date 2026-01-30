import express from "express";
import {
  isAuthenticated,
  login,
  logout,
  register,
  verifyEmail,
  resetPassword,
  verifyLoginOtp,
  sendPasswordResetOtp,
} from "../controllers/authController.js";
import userAuth from "../middlewares/userAuth.js";

const authRouter = express.Router();

// Public routes
authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/verify-account", verifyEmail);
authRouter.post("/verify-login-otp", verifyLoginOtp);
authRouter.post("/send-reset-otp", sendPasswordResetOtp);
authRouter.post("/reset-password", resetPassword);

// Protected routes
authRouter.post("/logout", userAuth, logout);
authRouter.get("/is-auth", userAuth, isAuthenticated);

export default authRouter;
