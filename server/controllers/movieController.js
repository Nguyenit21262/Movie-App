import Movie from "../models/Movie.js";
import TMDBService from "../service/TMDBService.js";
import { getPersonalizedRecommendations } from "../service/recommendationService.js";

const isDuplicateKeyError = (error) => error?.code === 11000;

const normalizeMoviePayload = (formatted) => ({
  ...formatted,
  overview: formatted?.overview || "",
  poster_path: formatted?.poster_path || "",
  backdrop_path: formatted?.backdrop_path || "",
  tagline: formatted?.tagline || "",
  director: formatted?.director || "",
  genres: formatted?.genres || [],
  keywords: formatted?.keywords || [],
  casts: formatted?.casts || [],
});

const saveOneMovieToDB = async (tmdbId) => {
  const formatted = await TMDBService.formatMovieData(tmdbId);
  const normalized = normalizeMoviePayload(formatted);

  const result = await Movie.updateOne(
    { tmdb_id: tmdbId },
    { $setOnInsert: normalized },
    { upsert: true },
  );

  return result.upsertedCount ? normalized : null;
};


const saveMoviesToDB = async (tmdbMovies) => {
  const results = { saved: 0, skipped: 0 };

  for (const tmdbMovie of tmdbMovies) {
    try {
      const saved = await saveOneMovieToDB(tmdbMovie.id);
      saved ? results.saved++ : results.skipped++;
    } catch (err) {
      if (isDuplicateKeyError(err)) {
        results.skipped++;
        continue;
      }
      console.error(`Failed to save movie ${tmdbMovie.id}:`, err.message);
      results.skipped++;
    }
  }

  return results;
};

const saveMovieFromDetails = async (details, credits, keywords) => {
  const formatted = normalizeMoviePayload(
    TMDBService.formatFromDetails(details, credits, keywords),
  );

  const result = await Movie.updateOne(
    { tmdb_id: details.id },
    { $setOnInsert: formatted },
    { upsert: true },
  );

  return result.upsertedCount ? formatted : null;
};


const backgroundSave = (promise, label) => {
  promise.catch((err) =>
    console.error(`Background save error (${label}):`, err.message),
  );
};


const TMDB_LIST_FETCHERS = {
  popular: TMDBService.getPopularMovies.bind(TMDBService),
  top_rated: TMDBService.getTopRatedMovies.bind(TMDBService),
  now_playing: TMDBService.getNowPlayingMovies.bind(TMDBService),
  upcoming: TMDBService.getUpcomingMovies.bind(TMDBService),
  trending_day: (page) => TMDBService.getTrendingMovies("day", page),
  trending_week: (page) => TMDBService.getTrendingMovies("week", page),
};


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
export const getTMDBTrendingDay = createTMDBListHandler("trending_day");
export const getTMDBTrendingWeek = createTMDBListHandler("trending_week");

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
        .limit(parseInt(limit, 10))
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

export const discoverTMDBMoviesByGenre = async (req, res) => {
  try {
    const { genreId, page = 1 } = req.query;

    if (!genreId) {
      return res.status(400).json({
        success: false,
        message: "genreId is required",
      });
    }

    const results = await TMDBService.discoverByGenre(genreId, page);

    backgroundSave(saveMoviesToDB(results.results), `discover:${genreId}`);

    return res.status(200).json({
      success: true,
      results: results.results,
      totalPages: results.total_pages,
      currentPage: results.page,
    });
  } catch (error) {
    console.error("Discover TMDB movies by genre error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to discover movies by genre",
    });
  }
};

export const getTMDBMovieDetails = async (req, res) => {
  try {
    const { tmdbId } = req.params;

    const details = await TMDBService.getMovieDetails(tmdbId);
    const [credits, keywords, videos, recommendations] =
      await Promise.all([
        TMDBService.getMovieCredits(tmdbId, { optional: true }),
        TMDBService.getMovieKeywords(tmdbId, { optional: true }),
        TMDBService.getMovieVideos(tmdbId, { optional: true }),
        TMDBService.getRecommendations(tmdbId, 1, { optional: true }),
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
      credits: credits || { cast: [], crew: [] },
      videos: videos?.results || [],
      recommendations: recommendations?.results || [],
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

// Personalized recommendations cho user đã đăng nhập
export const getRecommendations = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;
    const question = (req.query.q || "").trim();

    const { recommendations } = await getPersonalizedRecommendations({
      user: req.user,
      question,
      limit,
    });

    return res.json({
      success: true,
      recommendations,
      total: recommendations.length,
    });
  } catch (error) {
    console.error("getRecommendations error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch recommendations",
    });
  }
};
