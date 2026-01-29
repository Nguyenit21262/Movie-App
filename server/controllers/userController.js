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
