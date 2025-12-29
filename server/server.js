import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import authRouter from "./routes/authRoutes.js";

const app = express();
const port = process.env.PORT || 3000; 

connectDB();

// 2. Middleware cấu hình
app.use(express.json());
app.use(cookieParser());
app.use(cors({ 
    origin: process.env.FRONTEND_URL, 
    credentials: true 
}));

// 3. API Endpoints
app.get("/", (req, res) => res.send("Server is Live!"));
app.use("/api/auth", authRouter);

// 4. Khởi chạy Server
app.listen(port, () =>
  console.log(`Server listening at http://localhost:${port}`)
);