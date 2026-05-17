import express from "express";
import userAuth from "../middlewares/userAuth.js";

import {
  getDashboardData,
  getAllShows,
  getAllBookings,
  getChatUsers,
  getAdminChats,
  updateChatVisibility,
  deleteAdminChat,
} from "../controllers/adminController.js";
import { isAdmin } from "../middlewares/adminAuth.js";

const adminRouter = express.Router();

adminRouter.use(userAuth, isAdmin);

adminRouter.get("/dashboard", getDashboardData);
adminRouter.get("/all-shows", getAllShows);
adminRouter.get("/all-bookings", getAllBookings);
adminRouter.get("/chat-users", getChatUsers);
adminRouter.get("/chats", getAdminChats);
adminRouter.patch("/chats/:chatId/visibility", updateChatVisibility);
adminRouter.delete("/chats/:chatId", deleteAdminChat);

export default adminRouter;
