import jwt from "jsonwebtoken";
import User from "../models/User.js";

const userAuth = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: No token provided. Please login again.",
    });
  }

  try {
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

    if (tokenDecode.id) {
      const user = await User.findById(tokenDecode.id).select('-password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: User not found. Please login again.",
        });
      }

      req.userId = tokenDecode.id;
      req.user = user;
      next();
    } else {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Invalid token payload. Please login again.",
      });
    }
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Token has expired. Please login again.",
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Invalid token. Please login again.",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid or expired token. Please login again.",
    });
  }
};

export const adminAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Please login first.",
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Admin access required.",
    });
  }

  next();
};

export default userAuth;