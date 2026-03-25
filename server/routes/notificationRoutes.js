import express from "express";
import userAuth from "../middlewares/userAuth.js";
import { isAdmin } from "../middlewares/adminAuth.js";
import {
  getNotifications,
  markAllRead,
  markOneRead,
  deleteNotification,
  deleteAllNotifications,
  updateBookingStatus,
} from "../controllers/notificationController.js";

const notificationRouter = express.Router();

// User + Admin
notificationRouter.get("/", userAuth, getNotifications);
notificationRouter.put("/read-all", userAuth, markAllRead);
notificationRouter.put("/read/:id", userAuth, markOneRead);
notificationRouter.delete("/all", userAuth, deleteAllNotifications);
notificationRouter.delete("/:id", userAuth, deleteNotification);

// Admin only
notificationRouter.put(
  "/booking/:bookingId/status",
  userAuth,
  isAdmin,
  updateBookingStatus
);

export default notificationRouter;
