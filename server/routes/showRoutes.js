import express from "express";
import { addShow, getNowPlayingShows } from "../controllers/showController.js";
const showRouter = express.Router();

showRouter.get("/now-playing", getNowPlayingShows);
showRouter.post("/add-show", addShow);
export default showRouter;
