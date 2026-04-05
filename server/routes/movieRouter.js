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
  getTMDBTrendingDay,
  getTMDBTrendingWeek,
  getTMDBMovieDetails,
  discoverTMDBMoviesByGenre,
  getGenreStats,
  searchMovies,
  searchMovieSuggestions,
  ensureMovieExists,
  getRecommendations,
} from "../controllers/movieController.js";
import {
  getMyMovieRating,
  submitMovieRating,
} from "../controllers/ratingController.js";
import userAuth from "../middlewares/userAuth.js";
import commentRoutes from "./commentRoutes.js";

const movieRouter = express.Router();

// TMDB proxy routes (public)
movieRouter.get("/tmdb/popular", getTMDBPopular);
movieRouter.get("/tmdb/now-playing", getTMDBNowPlaying);
movieRouter.get("/tmdb/upcoming", getTMDBUpcoming);
movieRouter.get("/tmdb/top-rated", getTopRatedMovies);
movieRouter.get("/tmdb/trending/day", getTMDBTrendingDay);
movieRouter.get("/tmdb/trending/week", getTMDBTrendingWeek);
movieRouter.get("/tmdb/discover", discoverTMDBMoviesByGenre);
movieRouter.get("/tmdb/search", searchTMDBMovies);
movieRouter.get("/tmdb/:tmdbId/rating/me", userAuth, getMyMovieRating);
movieRouter.post("/tmdb/:tmdbId/rating", userAuth, submitMovieRating);
movieRouter.get("/tmdb/:tmdbId", getTMDBMovieDetails);

// Personalized recommendations (requires auth)
movieRouter.get("/recommendations", userAuth, getRecommendations);

// Local DB routes
movieRouter.get("/search", searchMovies);
movieRouter.get("/suggestions", searchMovieSuggestions);
movieRouter.get("/genres/stats", getGenreStats);
movieRouter.get("/tmdb-id/:tmdbId", getMovieByTMDBId);
movieRouter.get("/", getAllMovies);
movieRouter.get("/:id", getMovieById);

movieRouter.use("/:movieId/comments", commentRoutes);

movieRouter.post("/import", userAuth, importMoviesFromTMDB);
movieRouter.post("/add", userAuth, addMovieFromTMDB);
movieRouter.post("/ensure/:tmdbId", userAuth, ensureMovieExists);
movieRouter.put("/:id", userAuth, updateMovie);
movieRouter.delete("/:id", userAuth, deleteMovie);

export default movieRouter;
