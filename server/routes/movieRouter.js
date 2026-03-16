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
  searchMovies,
  searchMovieSuggestions,
  ensureMovieExists,
} from "../controllers/movieController.js";
import userAuth from "../middlewares/userAuth.js";
import commentRoutes from "./commentRoutes.js";

const movieRouter = express.Router();

movieRouter.get("/tmdb/popular", getTMDBPopular);
movieRouter.get("/tmdb/now-playing", getTMDBNowPlaying);
movieRouter.get("/tmdb/upcoming", getTMDBUpcoming);
movieRouter.get("/tmdb/top-rated", getTopRatedMovies);
movieRouter.get("/tmdb/search", searchTMDBMovies);
movieRouter.get("/tmdb/:tmdbId", getTMDBMovieDetails);

movieRouter.get("/search", searchMovies); //
movieRouter.get("/suggestions", searchMovieSuggestions); //
movieRouter.get("/genres/stats", getGenreStats);
movieRouter.get("/tmdb-id/:tmdbId", getMovieByTMDBId);

movieRouter.get("/:id", getMovieById); //

movieRouter.use("/:movieId/comments", commentRoutes);

movieRouter.post("/import", userAuth, importMoviesFromTMDB);
movieRouter.post("/add", userAuth, addMovieFromTMDB);
movieRouter.post("/ensure/:tmdbId", userAuth, ensureMovieExists);
movieRouter.put("/:id", userAuth, updateMovie);
movieRouter.delete("/:id", userAuth, deleteMovie);

export default movieRouter;
