import express from "express";
import {
  getUserData,
  updateProfile,
  updateUserRole,
  getAllUsers,
  getUserBookings,
  getUserRatedMovies,
  getUserBookmarkedMovies,
  getMovieBookmarkStatus,
  addMovieBookmark,
  removeMovieBookmark,
  getMyRecommendations,
} from "../controllers/userController.js";
import userAuth from "../middlewares/userAuth.js";

const userRouter = express.Router();

// User routes - require authentication
userRouter.get("/data", userAuth, getUserData);
userRouter.put("/update", userAuth, updateProfile);
userRouter.get("/bookings", userAuth, getUserBookings);
userRouter.get("/ratings", userAuth, getUserRatedMovies);
userRouter.get("/bookmarks", userAuth, getUserBookmarkedMovies);
userRouter.get("/bookmarks/:tmdbId", userAuth, getMovieBookmarkStatus);
userRouter.post("/bookmarks/:tmdbId", userAuth, addMovieBookmark);
userRouter.delete("/bookmarks/:tmdbId", userAuth, removeMovieBookmark);
userRouter.get("/recommendations", userAuth, getMyRecommendations);

// Admin routes - require authentication + admin role check
userRouter.get("/all", userAuth, getAllUsers);
userRouter.put("/update-role", userAuth, updateUserRole);

export default userRouter;
