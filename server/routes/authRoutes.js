import express from "express";
import {
  isAuthenticated,
  login,
  logout,
  register,
  sendVerifyOtp,
  verifyEmail,
  sentResetOtp,
  resetPassword,
} from "../controllers/authController.js";
import userAuth from "../middlewares/userAuth.js";

const authRouter = express.Router();

authRouter.post("/login", login);
authRouter.post("/register", register);
authRouter.post("/logout", logout);
authRouter.post("/send-verify-otp", userAuth, sendVerifyOtp);
authRouter.post("/verify-account", userAuth, verifyEmail);
authRouter.post("/is-auth", userAuth, isAuthenticated);
authRouter.post("/sent-reset-otp", sentResetOtp);
authRouter.post("/reset-password", resetPassword);
export default authRouter;
