import User from "../models/User.js";

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
