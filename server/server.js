import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/db.js";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "./middlewares/error.js";

const app = express();
const port = 3000;

//Middleware
app.use(express.json());
app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(errorMiddleware);
connectDB();

//API Routes
app.get("/", (req, res) => res.send("Server is Live!"));

app.listen(port, () =>
  console.log(`Server listening at http://localhost:${port}`)
);
