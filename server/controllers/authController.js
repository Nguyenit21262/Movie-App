import bcrypt from "bcryptjs";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";
import generateToken, { getAuthCookieOptions } from "../utils/generateToken.js";
import { parseStrictDate } from "../utils/parseStrictDate.js";

const normalizeEmail = (email = "") => String(email).trim().toLowerCase();
const generateOtpCode = () => String(Math.floor(100000 + Math.random() * 900000));

export const register = async (req, res) => {
  try {
    const { name, email, password, dateOfBirth, currentCity, occupation, sex } =
      req.body;
    const normalizedEmail = normalizeEmail(email);

    if (
      !name ||
      !normalizedEmail ||
      !password ||
      !dateOfBirth ||
      !currentCity ||
      !occupation ||
      !sex
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const { isValid: isValidDateOfBirth, date: parsedDate } =
      parseStrictDate(dateOfBirth);
    if (!isValidDateOfBirth) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid date format. Use DD/MM/YYYY" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ success: false, message: "Password must be at least 6 characters long" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtpCode();

    const user = new User({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      dateOfBirth: parsedDate,
      currentCity,
      occupation: occupation.toLowerCase(),
      sex,
      verifyOtp: otp,
      verifyOtpExpireAt: Date.now() + 24 * 60 * 60 * 1000,
      isAccountVerified: false,
    });

    await user.save();

    await sendEmail({
      to: normalizedEmail,
      subject: "Verify your account",
      text: `Your verification OTP is: ${otp}. This code is valid for 24 hours.`,
    });

    return res.status(201).json({
      success: true,
      message: "Account created. Please verify your email",
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and password are required" 
      });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    if (!user.isAccountVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email first",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    const otp = generateOtpCode();
    user.loginOtp = otp;
    user.loginOtpExpireAt = Date.now() + 5 * 60 * 1000;
    await user.save();

    await sendEmail({
      to: user.email,
      subject: "Login OTP",
      text: `Your login OTP is: ${otp}. This code is valid for 5 minutes.`,
    });

    return res.json({
      success: true,
      message: "OTP sent to email",
      require2FA: true,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const verifyLoginOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and OTP are required" 
      });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    if (user.loginOtp !== otp || user.loginOtpExpireAt < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    user.loginOtp = "";
    user.loginOtpExpireAt = 0;
    await user.save();

    generateToken(res, user._id);

    return res.json({
      success: true,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Verify login OTP error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.verifyOtp !== otp || user.verifyOtpExpireAt < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;
    await user.save();

    return res.json({
      success: true,
      message: "Email verified successfully. Please login to continue.",
    });
  } catch (error) {
    console.error("Verify email error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const resendVerificationOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isAccountVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified. Please login.",
      });
    }

    const otp = generateOtpCode();
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    await sendEmail({
      to: normalizedEmail,
      subject: "Verify your account",
      text: `Your verification OTP is: ${otp}. This code is valid for 24 hours.`,
    });

    return res.json({
      success: true,
      message: "A new verification OTP has been sent to your email",
    });
  } catch (error) {
    console.error("Resend verification OTP error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const sendPasswordResetOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const otp = generateOtpCode();
    
    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    await sendEmail({
      to: normalizedEmail,
      subject: "Password Reset OTP",
      text: `Your password reset OTP is: ${otp}. This code is valid for 15 minutes.`,
    });

    return res.json({
      success: true,
      message: "Password reset OTP sent to email",
    });
  } catch (error) {
    console.error("Send reset OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.resetOtp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (user.resetOtpExpireAt < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const logout = (req, res) => {
  try {
    res.clearCookie("token", getAuthCookieOptions());

    return res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const isAuthenticated = (req, res) => {
  return res.status(200).json({ success: true });
};
