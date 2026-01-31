import Movie from "../models/Movie.js";
import TMDBService from "../service/TMDBService.js";

/**
 * Import movies from TMDB to database
 */
export const importMoviesFromTMDB = async (req, res) => {
  try {
    const { category = "popular", pages = 1 } = req.body;

    let importedCount = 0;
    let skippedCount = 0;

    for (let page = 1; page <= pages; page++) {
      let tmdbMovies;

      // Fetch movies based on category
      switch (category) {
        case "top_rated":
          tmdbMovies = await TMDBService.getTopRatedMovies(page);
          break;
        case "popular":
          tmdbMovies = await TMDBService.getPopularMovies(page);
          break;
        case "now_playing":
          tmdbMovies = await TMDBService.getNowPlayingMovies(page);
          break;
        case "upcoming":
          tmdbMovies = await TMDBService.getUpcomingMovies(page);
          break;
        case "top_rated":
          tmdbMovies = await TMDBService.getTopRatedMovies(page);
          break;
        default:
          tmdbMovies = await TMDBService.getPopularMovies(page);
      }

      // Process each movie
      for (const tmdbMovie of tmdbMovies.results) {
        try {
          // Check if movie already exists
          const existingMovie = await Movie.findOne({
            tmdb_id: tmdbMovie.id,
          });

          if (existingMovie) {
            skippedCount++;
            continue;
          }

          // Format and save movie
          const formattedMovie = await TMDBService.formatMovieData(
            tmdbMovie.id,
          );
          await Movie.create(formattedMovie);
          importedCount++;
        } catch (error) {
          console.error(
            `Error importing movie ${tmdbMovie.id}:`,
            error.message,
          );
          skippedCount++;
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: "Movies imported successfully",
      imported: importedCount,
      skipped: skippedCount,
      total: importedCount + skippedCount,
    });
  } catch (error) {
    console.error("Import movies error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to import movies",
      error: error.message,
    });
  }
};

/**
 * Get all movies from database
 */
export const getAllMovies = async (req, res) => {
  try {
    const { page = 1, limit = 20, sort = "-release_date", search } = req.query;

    const query = {};

    // Add search filter if provided
    if (search) {
      query.$text = { $search: search };
    }

    const movies = await Movie.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Movie.countDocuments(query);

    return res.status(200).json({
      success: true,
      movies,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count,
    });
  } catch (error) {
    console.error("Get all movies error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch movies",
    });
  }
};

/**
 * Get single movie by ID
 */
export const getMovieById = async (req, res) => {
  try {
    const { id } = req.params;

    const movie = await Movie.findById(id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    return res.status(200).json({
      success: true,
      movie,
    });
  } catch (error) {
    console.error("Get movie error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch movie",
    });
  }
};

/**
 * Get movie by TMDB ID
 */
export const getMovieByTMDBId = async (req, res) => {
  try {
    const { tmdbId } = req.params;

    const movie = await Movie.findOne({ tmdb_id: tmdbId });

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    return res.status(200).json({
      success: true,
      movie,
    });
  } catch (error) {
    console.error("Get movie by TMDB ID error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch movie",
    });
  }
};

/**
 * Search movies from TMDB (not from database)
 */
export const searchTMDBMovies = async (req, res) => {
  try {
    const { query, page = 1 } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const results = await TMDBService.searchMovies(query, page);

    return res.status(200).json({
      success: true,
      results: results.results,
      totalPages: results.total_pages,
      currentPage: results.page,
      total: results.total_results,
    });
  } catch (error) {
    console.error("Search TMDB movies error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to search movies",
    });
  }
};

/**
 * Add single movie from TMDB by ID
 */
export const addMovieFromTMDB = async (req, res) => {
  try {
    const { tmdbId } = req.body;

    if (!tmdbId) {
      return res.status(400).json({
        success: false,
        message: "TMDB ID is required",
      });
    }

    // Check if movie already exists
    const existingMovie = await Movie.findOne({ tmdb_id: tmdbId });

    if (existingMovie) {
      return res.status(400).json({
        success: false,
        message: "Movie already exists in database",
        movie: existingMovie,
      });
    }

    // Format and save movie
    const formattedMovie = await TMDBService.formatMovieData(tmdbId);
    const movie = await Movie.create(formattedMovie);

    return res.status(201).json({
      success: true,
      message: "Movie added successfully",
      movie,
    });
  } catch (error) {
    console.error("Add movie error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add movie",
      error: error.message,
    });
  }
};

/**
 * Update movie in database
 */
export const updateMovie = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const movie = await Movie.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Movie updated successfully",
      movie,
    });
  } catch (error) {
    console.error("Update movie error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update movie",
    });
  }
};

/**
 * Delete movie from database
 */
export const deleteMovie = async (req, res) => {
  try {
    const { id } = req.params;

    const movie = await Movie.findByIdAndDelete(id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Movie deleted successfully",
    });
  } catch (error) {
    console.error("Delete movie error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete movie",
    });
  }
};

/**
 * Get popular movies from TMDB (real-time)
 */
export const getTopRatedMovies = async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const results = await TMDBService.getTopRatedMovies(page);

    return res.status(200).json({
      success: true,
      results: results.results,
      totalPages: results.total_pages,
      currentPage: results.page,
    });
  } catch (error) {
    console.error("Get TMDB top rated error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch top rated movies",
    });
  }
};

export const getTMDBPopular = async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const results = await TMDBService.getPopularMovies(page);

    return res.status(200).json({
      success: true,
      results: results.results,
      totalPages: results.total_pages,
      currentPage: results.page,
    });
  } catch (error) {
    console.error("Get TMDB popular error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch popular movies",
    });
  }
};

/**
 * Get now playing movies from TMDB (real-time)
 */
export const getTMDBNowPlaying = async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const results = await TMDBService.getNowPlayingMovies(page);

    return res.status(200).json({
      success: true,
      results: results.results,
      totalPages: results.total_pages,
      currentPage: results.page,
    });
  } catch (error) {
    console.error("Get TMDB now playing error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch now playing movies",
    });
  }
};

/**
 * Get upcoming movies from TMDB (real-time)
 */
export const getTMDBUpcoming = async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const results = await TMDBService.getUpcomingMovies(page);

    return res.status(200).json({
      success: true,
      results: results.results,
      totalPages: results.total_pages,
      currentPage: results.page,
    });
  } catch (error) {
    console.error("Get TMDB upcoming error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch upcoming movies",
    });
  }
};

/**
 * Get movie details from TMDB with credits
 */
export const getTMDBMovieDetails = async (req, res) => {
  try {
    const { tmdbId } = req.params;

    const [details, credits, videos] = await Promise.all([
      TMDBService.getMovieDetails(tmdbId),
      TMDBService.getMovieCredits(tmdbId),
      TMDBService.getMovieVideos(tmdbId),
    ]);

    return res.status(200).json({
      success: true,
      movie: details,
      credits,
      videos: videos.results,
    });
  } catch (error) {
    console.error("Get TMDB movie details error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch movie details",
    });
  }
};
