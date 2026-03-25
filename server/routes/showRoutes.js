import express from "express";
import {
  getNowPlayingShows,
  getUpcomingMovies,
  addShow,
  getShows,
  getShowById,
  deleteShow,
  updateShow,
} from "../controllers/showController.js";
import userAuth from "../middlewares/userAuth.js";
import { isAdmin } from "../middlewares/adminAuth.js";

const showRouter = express.Router();

showRouter.get("/now-playing", getNowPlayingShows);
showRouter.get("/upcoming", getUpcomingMovies);
showRouter.get("/all-shows", getShows);

// Các route admin
showRouter.post("/add", userAuth, isAdmin, addShow);
showRouter.delete("/:showId", userAuth, isAdmin, deleteShow);
showRouter.put("/:showId", userAuth, isAdmin, updateShow);
showRouter.delete("/show/:showId", userAuth, isAdmin, deleteShow);
showRouter.put("/show/:showId", userAuth, isAdmin, updateShow);

showRouter.get("/:movieId", getShowById);

export default showRouter;
