import User from "../models/User.js";
import path from "path";
import fs from "fs";

export const getUserData = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      userData: user,
    });
  } catch (error) {
    console.error("Get user error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, dateOfBirth, currentCity, occupation, sex } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (currentCity) updateData.currentCity = currentCity;
    if (occupation) updateData.occupation = occupation.toLowerCase();
    if (sex) updateData.sex = sex;

    if (dateOfBirth) {
      // Expect DD/MM/YYYY format from frontend
      const [day, month, year] = dateOfBirth.split("/");
      const parsedDate = new Date(year, month - 1, day);

      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format. Use DD/MM/YYYY",
        });
      }

      updateData.dateOfBirth = parsedDate;
    }

    // Handle image upload
    if (req.file) {
      // Get old user data to delete old image
      const oldUser = await User.findById(req.userId);

      // Delete old image if it's not the default image
      if (oldUser.image && oldUser.image !== "userImage.png") {
        const oldImagePath = path.join(process.cwd(), "uploads", oldUser.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      // Save new image filename
      updateData.image = req.file.filename;
    }

    const updatedUser = await User.findByIdAndUpdate(req.userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body;

    if (!userId || !role) {
      return res.status(400).json({
        success: false,
        message: "User ID and role are required",
      });
    }

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be 'user' or 'admin'",
      });
    }

    // Check if the requesting user is an admin
    const requestingUser = await User.findById(req.userId);
    if (requestingUser.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can update user roles",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true },
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update role error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    // Check if the requesting user is an admin
    const requestingUser = await User.findById(req.userId);
    if (requestingUser.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can view all users",
      });
    }

    const users = await User.find().select("-password");

    return res.status(200).json({
      success: true,
      users,
      total: users.length,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
