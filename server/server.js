import dotenv from "dotenv";
dotenv.config({ quiet: true });
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";

import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import movieRouter from "./routes/movieRouter.js";
import commentRoutes from "./routes/commentRoutes.js";
import showRouter from "./routes/showRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import notificationRouter from "./routes/notificationRoutes.js";

const app = express();
const PORT = process.env.PORT || 4000;

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);

app.use("/api/movies/:movieId/comments", commentRoutes);
app.use("/api/movies", movieRouter);
app.use("/api/show", showRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/notifications", notificationRouter);

// Health check
app.get("/", (req, res) => {
  res.json({ success: true, message: "API is running" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({ success: false, message: "Something went wrong!" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();

export default app;
