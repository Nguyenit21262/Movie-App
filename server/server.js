import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import movieRouter from "./routes/movieRouter.js";

const app = express();
const PORT = process.env.PORT || 4000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log(" Uploads directory created");
}

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error(" MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

// Serve static files from uploads directory
app.use("/uploads", express.static(uploadsDir));

// Routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/movies", movieRouter);

// Health check route
app.get("/", (req, res) => {
  res.json({ success: true, message: "API is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);

  // Handle multer errors
  if (err.message === "Only image files are allowed!") {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "File size too large. Maximum size is 5MB",
    });
  }

  res.status(500).json({
    success: false,
    message: "Something went wrong!",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(` Server running on port ${PORT}`);
    console.log(` Uploads directory: ${uploadsDir}`);
  });
};

startServer();

export default app;
