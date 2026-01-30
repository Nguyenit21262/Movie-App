import bcrypt from "bcryptjs";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";
import generateToken from "../utils/generateToken.js";

/* ===================== REGISTER ===================== */

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
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const [day, month, year] = dateOfBirth.split("/");
    const parsedDate = new Date(Number(year), Number(month) - 1, Number(day));

    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format",
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      dateOfBirth: parsedDate,
      currentCity,
      occupation,
      sex,
    });

    await user.save();

    generateToken(res, user._id);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/* ===================== LOGIN ===================== */
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    generateToken(res, user._id);

    return res.status(200).json({
      success: true,
      isAccountVerified: user.isAccountVerified,
      message: "User logged in successfully",
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/* ===================== LOGOUT ===================== */
export const logout = (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });

    return res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/* ===================== SEND VERIFY OTP ===================== */
export const sendVerifyOtp = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.isAccountVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Account already verified" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000; // 24h
    await user.save();

    await sendEmail({
      to: user.email,
      subject: "Verify Your Account - Movie App",
      text: `Hello ${user.name},\n\nYour verification OTP is: ${otp}\n\nBest regards,\nMovie App Team`,
    });

    return res.status(200).json({
      success: true,
      message: "Verification OTP sent successfully",
    });
  } catch (error) {
    console.error("Send verify OTP error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

/* ===================== VERIFY EMAIL ===================== */
export const verifyEmail = async (req, res) => {
  const { otp } = req.body;

  if (!otp) {
    return res.status(400).json({ success: false, message: "Missing OTP" });
  }

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.isAccountVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Account already verified" });
    }

    if (user.verifyOtp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (user.verifyOtpExpireAt < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Verify email error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

/* ===================== AUTH CHECK ===================== */
export const isAuthenticated = (req, res) => {
  return res.status(200).json({ success: true });
};

/* ===================== SEND RESET OTP ===================== */
export const sentResetOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 10 * 60 * 1000; // 10 min
    await user.save();

    await sendEmail({
      to: user.email,
      subject: "Reset Your Password - Movie App",
      text: `Hello ${user.name},\n\nYour password reset OTP is: ${otp}\nThis OTP is valid for 10 minutes.\n\nMovie App Team`,
    });

    return res.status(200).json({
      success: true,
      message: "Password reset OTP sent successfully",
    });
  } catch (error) {
    console.error("Send reset OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/* ===================== RESET PASSWORD ===================== */
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Email, OTP and new password are required",
    });
  }

  try {
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
