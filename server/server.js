import dotenv from "dotenv";
dotenv.config({ quiet: true });
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import path from "path";
import { existsSync } from "fs";
import { fileURLToPath } from "url";

import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import movieRouter from "./routes/movieRouter.js";
import commentRoutes from "./routes/commentRoutes.js";
import showRouter from "./routes/showRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import notificationRouter from "./routes/notificationRoutes.js";
import chatRouter from "./routes/chatRoutes.js";

const app = express();
const PORT = process.env.PORT || 4000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, "../client/dist");
const clientIndexPath = path.join(clientDistPath, "index.html");
const hasClientBuild = existsSync(clientIndexPath);

app.set("trust proxy", 1);

const normalizeOrigin = (value = "") => {
  try {
    const parsedOrigin = new URL(value);
    return `${parsedOrigin.protocol}//${parsedOrigin.host}`;
  } catch {
    return null;
  }
};

const allowedOrigins = new Set(
  [
    process.env.FRONTEND_URL,
    process.env.FRONTEND_URLS,
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
  ]
    .filter(Boolean)
    .flatMap((value) => value.split(","))
    .map((value) => normalizeOrigin(value.trim()))
    .filter(Boolean),
);

const isAllowedDevOrigin = (origin = "") =>
  process.env.NODE_ENV !== "production" &&
  /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);

const isSameOriginRequest = (req) => {
  const requestOrigin = normalizeOrigin(req.get("origin"));
  if (!requestOrigin) return false;

  const forwardedProtocol = req.get("x-forwarded-proto")?.split(",")[0].trim();
  const forwardedHost = req.get("x-forwarded-host")?.split(",")[0].trim();
  const protocol = forwardedProtocol || req.protocol;
  const host = forwardedHost || req.get("host");

  return Boolean(host && requestOrigin === `${protocol}://${host}`);
};

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
app.use((req, res, next) => {
  const origin = req.get("origin");
  const normalizedOrigin = normalizeOrigin(origin);

  if (
    !origin ||
    (normalizedOrigin && allowedOrigins.has(normalizedOrigin)) ||
    isAllowedDevOrigin(origin) ||
    isSameOriginRequest(req)
  ) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: `CORS blocked for origin: ${origin}`,
  });
});
app.use(
  cors({
    origin: true,
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
app.use("/api/chat", chatRouter);

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "API is running" });
});

if (hasClientBuild) {
  app.use(express.static(clientDistPath));

  app.use((req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/api")) {
      return next();
    }

    return res.sendFile(clientIndexPath);
  });
}

app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({ success: false, message: "Something went wrong!" });
});

// 404 handler
app.use((req, res) => {
  if (!hasClientBuild && !req.path.startsWith("/api")) {
    return res.status(404).json({
      success: false,
      message: "Client build not found. Run `npm run build` in the client app.",
    });
  }

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
