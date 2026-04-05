import express from "express";
import userAuth from "../middlewares/userAuth.js";
import { getChatHistory, streamChat } from "../controllers/chatController.js";

const chatRouter = express.Router();

chatRouter.use(userAuth);
chatRouter.get("/history", getChatHistory);
chatRouter.post("/stream", streamChat);

export default chatRouter;
