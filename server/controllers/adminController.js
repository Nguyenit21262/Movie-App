import Booking from "../models/Booking.js";
import Chat from "../models/Chat.js";
import Show from "../models/Show.js";
import User from "../models/User.js";
import mongoose from "mongoose";

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

const CHAT_PROVIDERS = new Set([
  "external-movie-ai",
  "openai-compatible",
  "fallback",
]);

const getDateRange = (from, to) => {
  const createdAt = {};

  if (from) {
    const fromDate = new Date(from);
    if (!Number.isNaN(fromDate.getTime())) {
      createdAt.$gte = fromDate;
    }
  }

  if (to) {
    const toDate = new Date(to);
    if (!Number.isNaN(toDate.getTime())) {
      if (!String(to).includes("T")) {
        toDate.setHours(23, 59, 59, 999);
      }
      createdAt.$lte = toDate;
    }
  }

  return Object.keys(createdAt).length ? createdAt : null;
};

const getHiddenFilter = (hidden = "visible") => {
  if (hidden === "all") return null;
  if (hidden === "hidden") return { isHidden: true };
  return { isHidden: { $ne: true } };
};

const buildChatMatch = ({ userId, provider, from, to, hidden }) => {
  const match = {};
  const hiddenFilter = getHiddenFilter(hidden);
  const createdAt = getDateRange(from, to);

  if (hiddenFilter) Object.assign(match, hiddenFilter);
  if (createdAt) match.createdAt = createdAt;
  if (provider && CHAT_PROVIDERS.has(provider)) {
    match["metadata.provider"] = provider;
  }
  if (userId && mongoose.isValidObjectId(userId)) {
    match.user = new mongoose.Types.ObjectId(userId);
  }

  return match;
};

export const getChatUsers = async (req, res) => {
  try {
    const { search = "", provider, from, to, hidden = "visible" } = req.query;
    const match = buildChatMatch({ provider, from, to, hidden });
    const searchText = search.trim();

    const pipeline = [
      { $match: match },
      {
        $group: {
          _id: "$user",
          totalChats: { $sum: 1 },
          hiddenChats: { $sum: { $cond: ["$isHidden", 1, 0] } },
          lastChatAt: { $max: "$createdAt" },
          providers: { $addToSet: "$metadata.provider" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
    ];

    if (searchText) {
      pipeline.push({
        $match: {
          $or: [
            { "user.name": { $regex: searchText, $options: "i" } },
            { "user.email": { $regex: searchText, $options: "i" } },
          ],
        },
      });
    }

    pipeline.push(
      { $sort: { lastChatAt: -1 } },
      { $limit: 100 },
      {
        $project: {
          _id: 0,
          user: {
            _id: "$user._id",
            name: "$user.name",
            email: "$user.email",
            role: "$user.role",
            currentCity: "$user.currentCity",
            occupation: "$user.occupation",
          },
          totalChats: 1,
          hiddenChats: 1,
          lastChatAt: 1,
          providers: 1,
        },
      },
    );

    const users = await Chat.aggregate(pipeline);

    res.json({ success: true, users });
  } catch (error) {
    console.error("Error fetching chat users:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminChats = async (req, res) => {
  try {
    const {
      userId,
      provider,
      from,
      to,
      hidden = "visible",
      page = 1,
      limit = 50,
    } = req.query;

    const match = buildChatMatch({ userId, provider, from, to, hidden });
    const pageNumber = Math.max(Number(page) || 1, 1);
    const limitNumber = Math.min(Math.max(Number(limit) || 50, 1), 100);
    const skip = (pageNumber - 1) * limitNumber;

    const [chats, total] = await Promise.all([
      Chat.find(match)
        .populate("user", "name email role currentCity occupation")
        .populate("hiddenBy", "name email")
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limitNumber)
        .lean(),
      Chat.countDocuments(match),
    ]);

    res.json({
      success: true,
      chats,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    console.error("Error fetching admin chats:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateChatVisibility = async (req, res) => {
  try {
    const { chatId } = req.params;
    const isHidden = Boolean(req.body?.isHidden);

    if (!mongoose.isValidObjectId(chatId)) {
      return res.status(400).json({ success: false, message: "Invalid chat id" });
    }

    const chat = await Chat.findByIdAndUpdate(
      chatId,
      {
        isHidden,
        hiddenAt: isHidden ? new Date() : null,
        hiddenBy: isHidden ? req.userId : null,
      },
      { new: true },
    )
      .populate("user", "name email role currentCity occupation")
      .populate("hiddenBy", "name email")
      .lean();

    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }

    res.json({ success: true, chat });
  } catch (error) {
    console.error("Error updating chat visibility:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAdminChat = async (req, res) => {
  try {
    const { chatId } = req.params;

    if (!mongoose.isValidObjectId(chatId)) {
      return res.status(400).json({ success: false, message: "Invalid chat id" });
    }

    const chat = await Chat.findByIdAndDelete(chatId).lean();
    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }

    res.json({ success: true, message: "Chat deleted" });
  } catch (error) {
    console.error("Error deleting chat:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
