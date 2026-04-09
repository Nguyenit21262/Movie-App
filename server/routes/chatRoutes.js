import express from "express";
import userAuth from "../middlewares/userAuth.js";
import { getChatHistory, streamChat, deleteChatHistory } from "../controllers/chatController.js";

const chatRouter = express.Router();

chatRouter.use(userAuth);
chatRouter.get("/history", getChatHistory);
chatRouter.delete("/history", deleteChatHistory);
chatRouter.post("/stream", streamChat);

export default chatRouter;
