import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import User from "../models/User.js";

//api to get dashboard data
export const getDashboardData = async (req, res) => {
  try {
    const [bookings, activeShows, totalUser] = await Promise.all([
      Booking.find({ isPaid: true }),

      Show.find({ showDateTime: { $gte: new Date() } })
        .populate("movie")
        .sort({ showDateTime: 1 }),

      User.countDocuments(),
    ]);

    const dashboardData = {
      totalBookings: bookings.length,
      totalRevenue: bookings.reduce((acc, b) => acc + (b.amount || 0), 0),
      activeShows, // [{ _id, showDateTime, showPrice, movie: { title, poster_path, vote_average } }]
      totalUser,
    };

    res.json({ success: true, dashboardData });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllShows = async (req, res) => {
  try {
    const shows = await Show.find({ showDateTime: { $gte: new Date() } })
      .populate("movie")
      .sort({ showDateTime: 1 });
    res.json({ success: true, shows });
  } catch (error) {
    console.error("Error fetching all shows:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user")
      .populate({ path: "show", populate: { path: "movie" } })
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    console.error("Error fetching all bookings:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
