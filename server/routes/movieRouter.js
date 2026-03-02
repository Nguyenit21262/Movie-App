import express from "express";
import {
  importMoviesFromTMDB,
  getAllMovies,
  getMovieById,
  getMovieByTMDBId,
  searchTMDBMovies,
  addMovieFromTMDB,
  updateMovie,
  deleteMovie,
  getTMDBPopular,
  getTMDBNowPlaying,
  getTMDBUpcoming,
  getTopRatedMovies,
  getTMDBMovieDetails,
  getGenreStats, 
} from "../controllers/movieController.js";
import userAuth from "../middlewares/userAuth.js";

const movieRouter = express.Router();

// TMDB real-time endpoints (no auth required)
movieRouter.get("/tmdb/popular", getTMDBPopular);
movieRouter.get("/tmdb/now-playing", getTMDBNowPlaying);
movieRouter.get("/tmdb/upcoming", getTMDBUpcoming);
movieRouter.get("/tmdb/top-rated", getTopRatedMovies);
movieRouter.get("/tmdb/search", searchTMDBMovies);
movieRouter.get("/tmdb/:tmdbId", getTMDBMovieDetails);

// Database endpoints
movieRouter.get("/genres/stats", getGenreStats); // Get genre statistics
movieRouter.get("/", getAllMovies); // Supports ?genre= filter
movieRouter.get("/tmdb-id/:tmdbId", getMovieByTMDBId);
movieRouter.get("/:id", getMovieById);

// Admin endpoints (require auth)
movieRouter.post("/import", userAuth, importMoviesFromTMDB);
movieRouter.post("/add", userAuth, addMovieFromTMDB);
movieRouter.put("/:id", userAuth, updateMovie);
movieRouter.delete("/:id", userAuth, deleteMovie);

export default movieRouter;