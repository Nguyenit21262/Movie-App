import bcrypt from "bcryptjs";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";
import generateToken from "../utils/generateToken.js";

export const register = async (req, res) => {
  try {
    const { name, email, password, dateOfBirth, currentCity, occupation, sex } =
      req.body;

    if (
      !name ||
      !email ||
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

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const [day, month, year] = dateOfBirth.split("/");
    const parsedDate = new Date(year, month - 1, day);
    if (isNaN(parsedDate.getTime())) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid date format" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ success: false, message: "Password must be at least 6 characters long" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    const user = new User({
      name,
      email,
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
      to: email,
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

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and password are required" 
      });
    }

    const user = await User.findOne({ email });
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

    const otp = String(Math.floor(100000 + Math.random() * 900000));
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

    if (!email || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and OTP are required" 
      });
    }

    const user = await User.findOne({ email });
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

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const user = await User.findOne({ email });
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

export const sendPasswordResetOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    
    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    await sendEmail({
      to: email,
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

    if (!email || !otp || !newPassword) {
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

    const user = await User.findOne({ email });
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
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });

    return res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const isAuthenticated = (req, res) => {
  return res.status(200).json({ success: true });
};
