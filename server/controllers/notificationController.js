import Notification from "../models/Notification.js";
import Booking from "../models/Booking.js";
import User from "../models/User.js";


export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.userId })
      .populate({
        path: "booking",
        populate: { path: "show", populate: { path: "movie" } },
      })
      .sort({ createdAt: -1 })
      .limit(20);

    const unreadCount = await Notification.countDocuments({
      recipient: req.userId,
      isRead: false,
    });

    res.json({ success: true, notifications, unreadCount });
  } catch (error) {
    console.error("getNotifications error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.userId, isRead: false },
      { isRead: true }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const markOneRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.userId },
      { isRead: true }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const deleted = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.userId,
    });

    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }

    res.json({ success: true, message: "Notification deleted" });
  } catch (error) {
    console.error("deleteNotification error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAllNotifications = async (req, res) => {
  try {
    const result = await Notification.deleteMany({ recipient: req.userId });

    res.json({
      success: true,
      message: "All notifications deleted",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("deleteAllNotifications error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { isPaid } = req.body;

    const booking = await Booking.findById(bookingId)
      .populate({ path: "show", populate: { path: "movie" } })
      .populate("user");

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    booking.isPaid = isPaid;
    await booking.save();

    // Gửi notification cho user
    const movieTitle = booking.show?.movie?.title || "Movie";
    await Notification.create({
      recipient: booking.user._id,
      type: isPaid ? "booking_paid" : "booking_cancelled",
      title: isPaid ? "Payment Confirmed" : "Booking Pending",
      message: isPaid
        ? `Your booking for "${movieTitle}" has been confirmed. Seats: ${booking.bookedSeats.join(", ")}`
        : `Your booking for "${movieTitle}" is pending payment.`,
      booking: booking._id,
    });

    res.json({
      success: true,
      message: `Booking marked as ${isPaid ? "paid" : "pending"}`,
      booking,
    });
  } catch (error) {
    console.error("updateBookingStatus error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export const createBookingNotifications = async (booking, adminIds) => {
  try {
    const movieTitle = booking.show?.movie?.title || "Movie";

    // Notification cho user
    await Notification.create({
      recipient: booking.user,
      type: "booking_created",
      title: "Booking Created",
      message: `You booked "${movieTitle}". Seats: ${booking.bookedSeats.join(", ")}. Awaiting payment confirmation.`,
      booking: booking._id,
    });

    // Notification cho tất cả admin
    const adminNotifications = adminIds.map((adminId) => ({
      recipient: adminId,
      type: "booking_created",
      title: "New Booking",
      message: `A user just booked "${movieTitle}". Seats: ${booking.bookedSeats.join(", ")}. Amount: $${booking.amount}`,
      booking: booking._id,
    }));

    await Notification.insertMany(adminNotifications);
  } catch (error) {
    console.error("createBookingNotifications error:", error);
  }
};
