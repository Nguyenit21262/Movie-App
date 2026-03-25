import Show from "../models/Show.js";
import Booking from "../models/Booking.js";
import User from "../models/User.js";
import { createBookingNotifications } from "./notificationController.js";

const checkSeatsAvailability = async (showId, selectedSeats) => {
  try {
    const showData = await Show.findById(showId);
    if (!showData) return false;
    return !selectedSeats.some((seat) => showData.occupiedSeats[seat]);
  } catch {
    return false;
  }
};

export const createBooking = async (req, res) => {
  try {
    const userId = req.userId;
    const { showId, selectedSeats } = req.body;

    if (!showId || !selectedSeats?.length) {
      return res.status(400).json({
        success: false,
        message: "showId and selectedSeats are required",
      });
    }

    const isAvailable = await checkSeatsAvailability(showId, selectedSeats);
    if (!isAvailable) {
      return res.status(409).json({
        success: false,
        message: "Selected seats are already booked.",
      });
    }

    const showData = await Show.findById(showId).populate("movie");
    if (!showData) {
      return res.status(404).json({ success: false, message: "Show not found" });
    }

    const booking = await Booking.create({
      user: userId,
      show: showId,
      amount: showData.showPrice * selectedSeats.length,
      bookedSeats: selectedSeats,
      isPaid: false,
    });

    selectedSeats.forEach((seat) => {
      showData.occupiedSeats[seat] = userId;
    });
    showData.markModified("occupiedSeats");
    await showData.save();

    // Populate booking trước khi gửi notification
    const populatedBooking = await Booking.findById(booking._id)
      .populate({ path: "show", populate: { path: "movie" } });

    // Lấy danh sách admin để gửi notification
    const admins = await User.find({ role: "admin" }).select("_id");
    const adminIds = admins.map((a) => a._id);

    await createBookingNotifications(populatedBooking, adminIds);

    res.json({
      success: true,
      message: "Booking created successfully",
      bookingId: booking._id,
    });
  } catch (error) {
    console.error("createBooking error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOccupiedSeats = async (req, res) => {
  try {
    const { showId } = req.params;
    const showData = await Show.findById(showId);
    if (!showData) {
      return res.status(404).json({ success: false, message: "Show not found" });
    }
    const occupiedSeats = Object.keys(showData.occupiedSeats);
    res.json({ success: true, occupiedSeats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};