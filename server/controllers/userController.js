import User from "../models/User.js";
export const getUserData = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      userData: {
        name: user.name,
        isAccountVerified: user.isAccountVerified,
      },
    });
  } catch (error) {
    console.error("Error in fetching user data:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;

    const {
      name,
      email,
      dateOfBirth,
      currentCity,
      occupation,
      sex,
      image,
    } = req.body;

    const updateData = {};

    if (name) updateData.name = name;
    if (currentCity) updateData.currentCity = currentCity;
    if (occupation) updateData.occupation = occupation;
    if (sex) updateData.sex = sex;
    if (image) updateData.image = image;

    if (dateOfBirth) {
      const [day, month, year] = dateOfBirth.split("/");
      const parsedDate = new Date(
        Number(year),
        Number(month) - 1,
        Number(day)
      );

      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid date of birth format",
        });
      }

      updateData.dateOfBirth = parsedDate;
    }

    if (email) {
      const emailExists = await User.findOne({
        email,
        _id: { $ne: userId },
      });

      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "Email already in use",
        });
      }

      updateData.email = email;
      updateData.isAccountVerified = false;
      updateData.verifyOtp = "";
      updateData.verifyOtpExpireAt = 0;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select("-password");

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

