import axios from "axios";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Rating from "../models/Rating.js";
import Movie from "../models/Movie.js";
import Bookmark from "../models/Bookmark.js";
import UserRecommendation from "../models/UserRecommendation.js";
import TMDBService from "../service/TMDBService.js";
import { parseStrictDate } from "../utils/parseStrictDate.js";


export const getUserData = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      userData: user,
    });
  } catch (error) {
    console.error("Get user error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, dateOfBirth, currentCity, occupation, sex } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (currentCity) updateData.currentCity = currentCity;
    if (occupation) updateData.occupation = occupation.toLowerCase();
    if (sex) updateData.sex = sex;

    if (dateOfBirth) {
      const { isValid: isValidDateOfBirth, date: parsedDate } =
        parseStrictDate(dateOfBirth);

      if (!isValidDateOfBirth) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format. Use DD/MM/YYYY",
        });
      }

      updateData.dateOfBirth = parsedDate;
    }

    const updatedUser = await User.findByIdAndUpdate(req.userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body;

    if (!userId || !role) {
      return res.status(400).json({
        success: false,
        message: "User ID and role are required",
      });
    }

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be 'user' or 'admin'",
      });
    }

    // Check if the requesting user is an admin
    const requestingUser = await User.findById(req.userId);
    if (requestingUser.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can update user roles",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true },
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update role error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    // Check if the requesting user is an admin
    const requestingUser = await User.findById(req.userId);
    if (requestingUser.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can view all users",
      });
    }

    const users = await User.find().select("-password");

    return res.status(200).json({
      success: true,
      users,
      total: users.length,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

//api to get all user bookings
export const getUserBookings = async (req, res) => {
  try {
    const userId = req.userId;

    const bookings = await Booking.find({ user: userId })
      .populate({
        path: "show",
        populate: { path: "movie" },
      })
      .sort({ createdAt: -1 });
    res.json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error("Get user bookings error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getUserRatedMovies = async (req, res) => {
  try {
    const ratings = await Rating.find({ user: req.userId })
      .populate({
        path: "movie",
        select:
          "title overview poster_path backdrop_path release_date vote_average count_rating runtime genres tmdb_id",
      })
      .sort({ updatedAt: -1 })
      .lean();

    const ratedMovies = ratings
      .filter((item) => item.movie)
      .map((item) => ({
        ...item.movie,
        id: item.movie.tmdb_id,
        userRating: item.rating,
        ratedAt: item.updatedAt || item.createdAt,
      }));

    return res.json({
      success: true,
      movies: ratedMovies,
      total: ratedMovies.length,
    });
  } catch (error) {
    console.error("Get user rated movies error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load rated movies",
    });
  }
};

const ensureBookmarkMovieByTmdbId = async (tmdbId) => {
  const normalizedTmdbId = Number(tmdbId);
  let movie = await Movie.findOne({ tmdb_id: normalizedTmdbId });

  if (movie) return movie;

  const formatted = await TMDBService.formatMovieData(normalizedTmdbId);

  movie = await Movie.findOneAndUpdate(
    { tmdb_id: formatted.tmdb_id },
    { $setOnInsert: formatted },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  return movie;
};

export const getUserBookmarkedMovies = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.userId })
      .populate({
        path: "movie",
        select:
          "title overview poster_path backdrop_path release_date vote_average count_rating runtime genres tmdb_id",
      })
      .sort({ createdAt: -1 })
      .lean();

    const movies = bookmarks
      .filter((item) => item.movie)
      .map((item) => ({
        ...item.movie,
        id: item.movie.tmdb_id,
        bookmarkedAt: item.createdAt,
      }));

    return res.json({
      success: true,
      movies,
      total: movies.length,
    });
  } catch (error) {
    console.error("Get user bookmarked movies error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load bookmarks",
    });
  }
};

export const getMovieBookmarkStatus = async (req, res) => {
  try {
    const tmdbId = Number(req.params.tmdbId);

    if (!Number.isInteger(tmdbId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid TMDB movie id",
      });
    }

    const movie = await Movie.findOne({ tmdb_id: tmdbId }).select("_id").lean();
    if (!movie) {
      return res.json({ success: true, bookmarked: false });
    }

    const bookmark = await Bookmark.exists({
      user: req.userId,
      movie: movie._id,
    });

    return res.json({
      success: true,
      bookmarked: Boolean(bookmark),
    });
  } catch (error) {
    console.error("Get bookmark status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load bookmark status",
    });
  }
};

export const addMovieBookmark = async (req, res) => {
  try {
    const tmdbId = Number(req.params.tmdbId);

    if (!Number.isInteger(tmdbId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid TMDB movie id",
      });
    }

    const movie = await ensureBookmarkMovieByTmdbId(tmdbId);

    await Bookmark.findOneAndUpdate(
      { user: req.userId, movie: movie._id },
      { $setOnInsert: { user: req.userId, movie: movie._id } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    return res.json({
      success: true,
      bookmarked: true,
      message: "Movie added to bookmarks",
    });
  } catch (error) {
    console.error("Add bookmark error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add bookmark",
    });
  }
};

export const removeMovieBookmark = async (req, res) => {
  try {
    const tmdbId = Number(req.params.tmdbId);

    if (!Number.isInteger(tmdbId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid TMDB movie id",
      });
    }

    const movie = await Movie.findOne({ tmdb_id: tmdbId }).select("_id").lean();

    if (movie) {
      await Bookmark.deleteOne({
        user: req.userId,
        movie: movie._id,
      });
    }

    return res.json({
      success: true,
      bookmarked: false,
      message: "Movie removed from bookmarks",
    });
  } catch (error) {
    console.error("Remove bookmark error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to remove bookmark",
    });
  }
};

// ── Recommendation thresholds ─────────────────────────────────────────────────
// Users with fewer than this many ratings get cold-start (recent + high-rated) movies
const COLD_START_THRESHOLD = 5;
// Rebuild GCN cache after this many new ratings since last build
const REFRESH_TRIGGER = 5;
// How many concurrent TMDB poster-fetch requests to make
const POSTER_CONCURRENCY = 5;
const RECOMMENDATION_TIMEZONE =
  process.env.RECOMMENDATION_TIMEZONE || "Asia/Ho_Chi_Minh";
const recommendationBuildLocks = new Map();

const getHourInTimezone = (date, timeZone) => {
  try {
    const hourPart = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "numeric",
      hourCycle: "h23",
    })
      .formatToParts(date)
      .find((part) => part.type === "hour");

    const hour = Number(hourPart?.value);
    return Number.isInteger(hour) ? hour : date.getHours();
  } catch {
    return date.getHours();
  }
};

const getRecommendationTimeContext = (date = new Date()) => {
  const hour = getHourInTimezone(date, RECOMMENDATION_TIMEZONE);

  if (hour >= 6 && hour < 12) {
    return {
      bucket: "morning",
      label: "Morning",
      hour,
      timezone: RECOMMENDATION_TIMEZONE,
    };
  }

  if (hour >= 12 && hour < 18) {
    return {
      bucket: "afternoon",
      label: "Afternoon",
      hour,
      timezone: RECOMMENDATION_TIMEZONE,
    };
  }

  if (hour >= 18 && hour < 24) {
    return {
      bucket: "evening",
      label: "Evening",
      hour,
      timezone: RECOMMENDATION_TIMEZONE,
    };
  }

  return {
    bucket: "night",
    label: "Night",
    hour,
    timezone: RECOMMENDATION_TIMEZONE,
  };
};

const buildCachedRecommendationPayload = ({
  cache,
  limit,
  ratingCount,
  timeContext,
  source = "gcn-cached",
}) => {
  const ratingsSinceLastBuild = Math.max(
    0,
    ratingCount - (cache?.ratingCountAtBuild || 0),
  );

  return {
    success: true,
    recommendations: (cache?.recommendations || []).slice(0, limit),
    source,
    ratingCount,
    timeContext,
    ratingsSinceLastBuild,
    nextRefreshIn: Math.max(0, REFRESH_TRIGGER - ratingsSinceLastBuild),
  };
};

/**
 * Enrich a list of {tmdb_id, ...} records with poster_path.
 * Checks MongoDB first (free cache hit), then falls back to TMDB API for misses.
 */
const enrichWithPosters = async (rawRecs) => {
  if (!rawRecs.length) return rawRecs;

  const tmdbIds = rawRecs.map((r) => r.tmdb_id).filter((id) => id != null);

  // 1. Batch query local MongoDB cache
  const cached = await Movie.find(
    { tmdb_id: { $in: tmdbIds } },
    { tmdb_id: 1, poster_path: 1, release_date: 1, vote_average: 1, _id: 0 },
  ).lean();

  const posterMap = new Map(cached.map((m) => [m.tmdb_id, m]));

  // 2. Fetch missing posters from TMDB (rate-limited batches)
  const missing = rawRecs.filter((r) => r.tmdb_id && !posterMap.has(r.tmdb_id));

  for (let i = 0; i < missing.length; i += POSTER_CONCURRENCY) {
    const batch = missing.slice(i, i + POSTER_CONCURRENCY);
    const results = await Promise.allSettled(
      batch.map(async (rec) => {
        const details = await TMDBService.getMovieDetails(rec.tmdb_id, {
          optional: true,
        });
        if (details) {
          posterMap.set(rec.tmdb_id, {
            tmdb_id: rec.tmdb_id,
            poster_path: details.poster_path || null,
            release_date: details.release_date || null,
            vote_average: details.vote_average || 0,
          });
        }
      }),
    );
    results.forEach((r) => {
      if (r.status === "rejected") {
        console.warn("[recommendations] TMDB poster fetch failed:", r.reason?.message);
      }
    });
  }

  // 3. Merge into records
  return rawRecs.map((rec) => {
    const info = posterMap.get(rec.tmdb_id);
    return {
      ...rec,
      id: rec.tmdb_id,
      poster_path: info?.poster_path || rec.poster_path || null,
      release_date: rec.release_date || info?.release_date || null,
      vote_average: rec.vote_average || info?.vote_average || 0,
    };
  });
};

export const getMyRecommendations = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const forceRefresh = req.query.refresh === "true";
    const timeContext = getRecommendationTimeContext();

    // Count how many movies this user has rated
    const ratingCount = await Rating.countDocuments({ user: req.userId });

    // ── COLD START: not enough ratings yet ───────────────────────────────────
    if (ratingCount < COLD_START_THRESHOLD) {
      console.info(
        "[recommendations] cold-start | user=%s | ratingCount=%d",
        req.userId,
        ratingCount,
      );

      // Fetch recent + highly rated movies from TMDB (2 pages for variety)
      const [page1, page2] = await Promise.allSettled([
        TMDBService.discoverRecentTopRated(1),
        TMDBService.discoverRecentTopRated(2),
      ]);

      const tmdbResults = [
        ...(page1.status === "fulfilled" ? page1.value?.results || [] : []),
        ...(page2.status === "fulfilled" ? page2.value?.results || [] : []),
      ];

      // Deduplicate and slice to limit
      const seen = new Set();
      const coldStartMovies = tmdbResults
        .filter((m) => {
          if (seen.has(m.id)) return false;
          seen.add(m.id);
          return true;
        })
        .slice(0, limit)
        .map((m) => ({
          id: m.id,
          tmdb_id: m.id,
          title: m.title,
          overview: m.overview || "",
          poster_path: m.poster_path || null,
          release_date: m.release_date || null,
          vote_average: m.vote_average || 0,
          genres: [],
        }));

      return res.json({
        success: true,
        recommendations: coldStartMovies,
        source: "cold-start",
        ratingCount,
        timeContext,
        // Tell the frontend how many ratings until personalized picks kick in
        ratingsUntilPersonalized: COLD_START_THRESHOLD - ratingCount,
      });
    }

    // ── WARM USER: use GCN personalized recommendations ──────────────────────

    // Check cache
    const cache = await UserRecommendation.findOne({ user: req.userId });
    const ratingsSinceLastBuild = Math.max(
      0,
      cache ? ratingCount - cache.ratingCountAtBuild : ratingCount,
    );
    const crossedPersonalizationThreshold =
      cache && (cache.ratingCountAtBuild || 0) < COLD_START_THRESHOLD;
    const crossedTimeContext =
      cache && cache.timeContextAtBuild !== timeContext.bucket;

    const needsRebuild =
      !cache ||
      crossedPersonalizationThreshold ||
      crossedTimeContext ||
      ratingsSinceLastBuild >= REFRESH_TRIGGER ||
      forceRefresh;

    // Serve from cache if still fresh
    if (!needsRebuild && cache?.recommendations?.length > 0) {
      console.info(
        "[recommendations] cache-hit | user=%s | ratingCount=%d | ratingsSinceLastBuild=%d",
        req.userId,
        ratingCount,
        ratingsSinceLastBuild,
      );
      return res.json(
        buildCachedRecommendationPayload({
          cache,
          limit,
          ratingCount,
          timeContext,
        }),
      );
    }

    // ── Rebuild GCN recommendations ──────────────────────────────────────────
    const aiUrl = process.env.AI_MOVIE_API_URL;
    if (!aiUrl) {
      return res.json({ success: true, recommendations: [], source: "unavailable" });
    }

    const buildKey = String(req.userId);
    if (recommendationBuildLocks.has(buildKey)) {
      if (cache?.recommendations?.length > 0 && !crossedTimeContext) {
        console.info(
          "[recommendations] build-in-progress, returning stale cache | user=%s | ratingCount=%d",
          req.userId,
          ratingCount,
        );
        return res.json(
          buildCachedRecommendationPayload({
            cache,
            limit,
            ratingCount,
            timeContext,
            source: "gcn-stale-cache",
          }),
        );
      }

      console.info(
        "[recommendations] build-in-progress, no cache yet | user=%s | ratingCount=%d",
        req.userId,
        ratingCount,
      );
      return res.json({
        success: true,
        recommendations: [],
        source: "gcn-building",
        ratingCount,
        timeContext,
        ratingsSinceLastBuild,
        nextRefreshIn: 1,
        message: "Recommendations are rebuilding. Try again shortly.",
      });
    }

    console.info(
      "[recommendations] building GCN | user=%s | ratingCount=%d | forceRefresh=%s",
      req.userId,
      ratingCount,
      forceRefresh,
    );
    recommendationBuildLocks.set(buildKey, true);

    // Fetch ratings to send to GCN
    const ratings = await Rating.find({ user: req.userId })
      .populate({
        path: "movie",
        select:
          "title overview genres keywords original_language origin_country vote_average count_rating runtime release_date tmdb_id",
      })
      .sort({ updatedAt: -1 })
      .lean();

    const normalizedRatings = ratings
      .filter((r) => r.movie)
      .map((r) => ({
        rating: r.rating,
        // Pydantic expects str | None — convert Date objects to ISO strings
        createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : null,
        updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : null,
        movie: {
          tmdb_id: r.movie.tmdb_id || null,
          title: r.movie.title || "",
          overview: r.movie.overview || "",
          genres: r.movie.genres || [],
          keywords: r.movie.keywords || [],
          original_language: r.movie.original_language || "",
          origin_country: r.movie.origin_country || [],
          vote_average: r.movie.vote_average || 0,
          count_rating: r.movie.count_rating || 0,
          runtime: r.movie.runtime || 0,
          // release_date is a Date in MongoDB — convert to "YYYY-MM-DD" string
          release_date: r.movie.release_date
            ? new Date(r.movie.release_date).toISOString().split("T")[0]
            : null,
        },
      }));

    const user =
      req.user ||
      (await User.findById(req.userId).select("-password").lean());

    const aiResponse = await axios.post(
      `${aiUrl.replace(/\/$/, "")}/recommendations/chat`,
      {
        user: {
          id: String(req.userId),
          name: user?.name || "",
          role: user?.role || "user",
          sex: user?.sex || "",
          occupation: user?.occupation || "",
          currentCity: user?.currentCity || "",
          // dateOfBirth is a Date in MongoDB — convert to ISO string
          dateOfBirth: user?.dateOfBirth
            ? new Date(user.dateOfBirth).toISOString().split("T")[0]
            : null,
        },
        question: "top picks for user",
        timeContext,
        // AI service Pydantic model has le=20, so cap at 20
        limit: 20,
        ratings: normalizedRatings,
      },
      { timeout: 30000 },
    );

    const rawRecs = aiResponse.data?.recommendations || [];
    const enriched = await enrichWithPosters(rawRecs);

    // Save enriched list to cache
    await UserRecommendation.findOneAndUpdate(
      { user: req.userId },
      {
        recommendations: enriched,
        ratingCountAtBuild: ratingCount,
        timeContextAtBuild: timeContext.bucket,
        source: "gcn",
      },
      { upsert: true, new: true },
    );

    console.info(
      "[recommendations] GCN built | user=%s | ratingCount=%d | results=%d",
      req.userId,
      ratingCount,
      enriched.length,
    );
    recommendationBuildLocks.delete(buildKey);

    return res.json({
      success: true,
      recommendations: enriched.slice(0, limit),
      source: "gcn",
      ratingCount,
      timeContext,
      ratingsSinceLastBuild: 0,
      nextRefreshIn: REFRESH_TRIGGER,
    });
  } catch (error) {
    recommendationBuildLocks.delete(String(req.userId));
    console.error("getMyRecommendations error:", error.message);

    try {
      const limit = Math.min(parseInt(req.query.limit) || 20, 50);
      const ratingCount = await Rating.countDocuments({ user: req.userId });
      const cache = await UserRecommendation.findOne({ user: req.userId });
      const timeContext = getRecommendationTimeContext();

      if (
        cache?.recommendations?.length > 0 &&
        cache.timeContextAtBuild === timeContext.bucket
      ) {
        return res.json(
          buildCachedRecommendationPayload({
            cache,
            limit,
            ratingCount,
            timeContext,
            source: "gcn-stale-cache",
          }),
        );
      }
    } catch (fallbackError) {
      console.error(
        "getMyRecommendations stale-cache fallback error:",
        fallbackError.message,
      );
    }

    return res.json({
      success: true,
      recommendations: [],
      source: "gcn-unavailable",
      timeContext: getRecommendationTimeContext(),
      message: "Recommendations are temporarily unavailable. Try again shortly.",
    });
  }
};
