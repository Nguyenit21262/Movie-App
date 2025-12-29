import bcrypt from "bcryptjs";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";
import generateToken from "../utils/generateToken.js";

export const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Missing Details",
    });
  }

  try {
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
    });
    await user.save();

    //generate token and set cookie
    generateToken(res, user._id);

    //send welcome email
    await sendEmail({
      to: user.email,
      subject: "Welcome to Movie App!",
      text: `Hello ${user.name},\n\nWelcome to Movie App! Your account has been created.\n\nBest regards,\nThe Team`,
    }).catch((err) => console.error("Email queue error:", err));

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Error in user registration:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Missing Details",
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

    //generate token and set cookie
    generateToken(res, user._id);

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
    });
  } catch (error) {
    console.error("Error in user login:", error);
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
    return res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    console.error("Error in user logout:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const sendVerifyOtp = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (user.isAccountVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Account already verified" });
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.verifyOtp = otp;
    user.verifyOtpExpiry = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();
    sendEmail({
      to: user.email,
      subject: "Verify Your Account - Movie App",
      text: `Hello ${user.name},\n\nYour verification OTP is: ${otp}\n\nBest regards,\nThe Team`,
    }).catch((err) => console.error("Email queue error:", err));

    return res.status(200).json({
      success: true,
      message: "Verification OTP sent successfully",
    });
  } catch (error) {
    console.error("Error in sending verify OTP:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId);
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

    if (user.verifyOtp !== otp || user.verifyOtpExpiry < Date.now()) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpiry = 0;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Error in verifying email:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

//check authentication status
export const isAuthenticated = (req, res) => {
  try {
    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
