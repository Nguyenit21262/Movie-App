import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";

const app = express();
const port = process.env.PORT || 4000;

connectDB();

// Cấu hình Middleware
app.use(express.json());
app.use(cookieParser());

// Cấu hình CORS chi tiết để nhận được Cookie
const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000']; 
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// API Endpoints
app.get("/", (req, res) => res.send("Server is Live!"));
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

app.listen(port, () =>
  console.log(`Server listening at http://localhost:${port}`)
);