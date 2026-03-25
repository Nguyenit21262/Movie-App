import express from "express";
import { createBooking, getOccupiedSeats } from "../controllers/bookingController.js";
import userAuth from "../middlewares/userAuth.js";

const bookingRouter = express.Router();

bookingRouter.post("/create", userAuth, createBooking);
bookingRouter.get("/seats/:showId", getOccupiedSeats);

export default bookingRouter;