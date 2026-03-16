import Movie from "../models/Movie.js";
import TMDBService from "../service/TMDBService.js";

const saveOneMovieToDB = async (tmdbId) => {
  const existing = await Movie.findOne({ tmdb_id: tmdbId });
  if (existing) return null;

  const formatted = await TMDBService.formatMovieData(tmdbId);
  return Movie.create(formatted);
};

/**
 * Lưu nhiều movies vào DB từ danh sách TMDB results.
 * Chạy tuần tự để tránh rate limit TMDB.
 */
const saveMoviesToDB = async (tmdbMovies) => {
  const results = { saved: 0, skipped: 0 };

  for (const tmdbMovie of tmdbMovies) {
    try {
      const saved = await saveOneMovieToDB(tmdbMovie.id);
      saved ? results.saved++ : results.skipped++;
    } catch (err) {
      console.error(`Failed to save movie ${tmdbMovie.id}:`, err.message);
      results.skipped++;
    }
  }

  return results;
};

/**
 * Lưu movie vào DB khi đã có sẵn details object (tái sử dụng data, không gọi thêm API).
 * Dùng trong getTMDBMovieDetails khi details đã được fetch cho response.
 */
const saveMovieFromDetails = async (details, credits, keywords) => {
  const existing = await Movie.findOne({ tmdb_id: details.id });
  if (existing) return null;

  const formatted = TMDBService.formatFromDetails(details, credits, keywords);
  return Movie.create(formatted);
};

/**
 * Wrapper chạy save trong background — không block response, không throw.
 */
const backgroundSave = (promise, label) => {
  promise.catch((err) =>
    console.error(`Background save error (${label}):`, err.message),
  );
};

// ─────────────────────────────────────────────
// TMDB LIST ENDPOINTS
// Tất cả có cùng pattern: fetch → background save → trả về
// ─────────────────────────────────────────────

const TMDB_LIST_FETCHERS = {
  popular: TMDBService.getPopularMovies.bind(TMDBService),
  top_rated: TMDBService.getTopRatedMovies.bind(TMDBService),
  now_playing: TMDBService.getNowPlayingMovies.bind(TMDBService),
  upcoming: TMDBService.getUpcomingMovies.bind(TMDBService),
};

/**
 * Factory tạo handler cho các TMDB list endpoint.
 * Tránh lặp code giữa getTMDBPopular / getTopRatedMovies / v.v.
 */
const createTMDBListHandler = (category) => async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const fetcher = TMDB_LIST_FETCHERS[category];
    const results = await fetcher(page);

    backgroundSave(saveMoviesToDB(results.results), category);

    return res.status(200).json({
      success: true,
      results: results.results,
      totalPages: results.total_pages,
      currentPage: results.page,
    });
  } catch (error) {
    console.error(`Get TMDB ${category} error:`, error);
    return res.status(500).json({
      success: false,
      message: `Failed to fetch ${category} movies`,
    });
  }
};

export const getTMDBPopular = createTMDBListHandler("popular");
export const getTopRatedMovies = createTMDBListHandler("top_rated");
export const getTMDBNowPlaying = createTMDBListHandler("now_playing");
export const getTMDBUpcoming = createTMDBListHandler("upcoming");

export const importMoviesFromTMDB = async (req, res) => {
  try {
    const { category = "popular", pages = 1 } = req.body;

    const fetcher = TMDB_LIST_FETCHERS[category] ?? TMDB_LIST_FETCHERS.popular;
    let importedCount = 0;
    let skippedCount = 0;

    for (let page = 1; page <= pages; page++) {
      const tmdbMovies = await fetcher(page);
      const { saved, skipped } = await saveMoviesToDB(tmdbMovies.results);
      importedCount += saved;
      skippedCount += skipped;
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

export const getAllMovies = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort = "-release_date",
      search,
      genre,
    } = req.query;

    const query = {};
    if (search) query.$text = { $search: search };
    if (genre && genre !== "all") query.genres = genre;

    const [movies, count] = await Promise.all([
      Movie.find(query)
        .sort(sort)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec(),
      Movie.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      movies,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count,
    });
  } catch (error) {
    console.error("Get all movies error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch movies" });
  }
};

export const getGenreStats = async (req, res) => {
  try {
    const genreStats = await Movie.aggregate([
      { $unwind: "$genres" },
      { $group: { _id: "$genres", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    return res.status(200).json({
      success: true,
      genres: genreStats.map((g) => ({ name: g._id, count: g.count })),
    });
  } catch (error) {
    console.error("Get genre stats error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch genre statistics" });
  }
};

export const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res
        .status(404)
        .json({ success: false, message: "Movie not found" });
    }
    return res.status(200).json({ success: true, movie });
  } catch (error) {
    console.error("Get movie error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch movie" });
  }
};

export const getMovieByTMDBId = async (req, res) => {
  try {
    const movie = await Movie.findOne({ tmdb_id: req.params.tmdbId });
    if (!movie) {
      return res
        .status(404)
        .json({ success: false, message: "Movie not found" });
    }
    return res.status(200).json({ success: true, movie });
  } catch (error) {
    console.error("Get movie by TMDB ID error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch movie" });
  }
};

export const updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!movie) {
      return res
        .status(404)
        .json({ success: false, message: "Movie not found" });
    }
    return res
      .status(200)
      .json({ success: true, message: "Movie updated successfully", movie });
  } catch (error) {
    console.error("Update movie error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update movie" });
  }
};

export const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) {
      return res
        .status(404)
        .json({ success: false, message: "Movie not found" });
    }
    return res
      .status(200)
      .json({ success: true, message: "Movie deleted successfully" });
  } catch (error) {
    console.error("Delete movie error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to delete movie" });
  }
};

export const ensureMovieExists = async (req, res) => {
  try {
    const { tmdbId } = req.params;

    let movie = await Movie.findOne({ tmdb_id: tmdbId });
    if (movie) {
      return res.status(200).json({ success: true, movie });
    }

    const formatted = await TMDBService.formatMovieData(tmdbId);
    movie = await Movie.create(formatted);

    return res.status(201).json({ success: true, movie });
  } catch (error) {
    console.error("Ensure movie exists error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to ensure movie exists" });
  }
};

export const addMovieFromTMDB = async (req, res) => {
  try {
    const { tmdbId } = req.body;
    if (!tmdbId) {
      return res
        .status(400)
        .json({ success: false, message: "TMDB ID is required" });
    }

    const existingMovie = await Movie.findOne({ tmdb_id: tmdbId });
    if (existingMovie) {
      return res.status(400).json({
        success: false,
        message: "Movie already exists in database",
        movie: existingMovie,
      });
    }

    const formattedMovie = await TMDBService.formatMovieData(tmdbId);
    const movie = await Movie.create(formattedMovie);

    return res
      .status(201)
      .json({ success: true, message: "Movie added successfully", movie });
  } catch (error) {
    console.error("Add movie error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add movie",
      error: error.message,
    });
  }
};


export const searchTMDBMovies = async (req, res) => {
  try {
    const { query, page = 1 } = req.query;
    if (!query) {
      return res
        .status(400)
        .json({ success: false, message: "Search query is required" });
    }

    const results = await TMDBService.searchMovies(query, page);

    backgroundSave(saveMoviesToDB(results.results), "search");

    return res.status(200).json({
      success: true,
      results: results.results,
      totalPages: results.total_pages,
      currentPage: results.page,
      total: results.total_results,
    });
  } catch (error) {
    console.error("Search TMDB movies error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to search movies" });
  }
};

export const getTMDBMovieDetails = async (req, res) => {
  try {
    const { tmdbId } = req.params;

    const [details, credits, keywords, videos, recommendations] =
      await Promise.all([
        TMDBService.getMovieDetails(tmdbId),
        TMDBService.getMovieCredits(tmdbId),
        TMDBService.getMovieKeywords(tmdbId),
        TMDBService.getMovieVideos(tmdbId),
        TMDBService.getRecommendations(tmdbId),
      ]);

    backgroundSave(
      saveMovieFromDetails(details, credits, keywords),
      `details:${tmdbId}`,
    );

    // Lưu recommendations (background)
    if (recommendations?.results?.length) {
      backgroundSave(
        saveMoviesToDB(recommendations.results),
        "recommendations",
      );
    }

    return res.status(200).json({
      success: true,
      movie: details,
      credits,
      videos: videos.results,
      recommendations: recommendations.results,
    });
  } catch (error) {
    console.error("Get TMDB movie details error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch movie details" });
  }
};

// Search movies in the database by title, overview, genres, keywords, or cast members.
export const searchMovies = async (req, res) => {
  try {
    const { q = "" } = req.query;
    if (!q) {
      return res.status(200).json({
        success: true,
        movies: [],
      });
    }

    const movies = await Movie.find({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { overview: { $regex: q, $options: "i" } },
        { genres: { $regex: q, $options: "i" } },
        { keywords: { $regex: q, $options: "i" } },
        { "casts.actor": { $regex: q, $options: "i" } },
      ],
    }).sort({ popularity: -1 });

    return res.status(200).json({
      success: true,
      total: movies.length,
      movies,
    });
  } catch (error) {
    console.error("Search movies error:");
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);

    return res.status(500).json({
      success: false,
      message: "Failed to search movies",
      error: error.message,
    });
  }
};

// autocomplete
export const searchMovieSuggestions = async (req, res) => {
  try {
    const { q = "" } = req.query;

    if (!q) {
      return res.json({ suggestions: [] });
    }

    const movies = await Movie.find({
      title: { $regex: q, $options: "i" },
    })
      .limit(10)
      .select("title -_id");

    const suggestions = movies.map((m) => m.title);

    return res.json({ suggestions });
  } catch (error) {
    console.error("Suggestion API error:");
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch suggestions",
      error: error.message,
    });
  }
};
