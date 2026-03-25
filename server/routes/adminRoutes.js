import express from "express";
import userAuth from "../middlewares/userAuth.js";

import {
  getDashboardData,
  getAllShows,
  getAllBookings,
} from "../controllers/adminController.js";
import { isAdmin } from "../middlewares/adminAuth.js";

const adminRouter = express.Router();

adminRouter.use(userAuth, isAdmin);

adminRouter.get("/dashboard", getDashboardData);
adminRouter.get("/all-shows", getAllShows);
adminRouter.get("/all-bookings", getAllBookings);

export default adminRouter;
