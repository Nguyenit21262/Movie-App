import axios from "axios";
import Movie from "../models/Movie.js";
import Rating from "../models/Rating.js";

const DEFAULT_LIMIT = 5;
const DEFAULT_TIMEOUT_MS = Number(process.env.RECOMMENDER_TIMEOUT_MS || 15000);

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const tokenizeQuestion = (question = "") =>
  question
    .toLowerCase()
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3)
    .slice(0, 8);

const getYear = (releaseDate) => {
  if (!releaseDate) return "Unknown";
  const parsed = new Date(releaseDate);
  return Number.isNaN(parsed.getTime()) ? "Unknown" : parsed.getFullYear();
};

const buildUserPayload = (user) => ({
  id: String(user?._id || ""),
  name: user?.name || "",
  role: user?.role || "user",
  sex: user?.sex || "",
  occupation: user?.occupation || "",
  currentCity: user?.currentCity || "",
  dateOfBirth: user?.dateOfBirth || null,
});

const normalizeMoviePayload = (movie) => ({
  tmdb_id: movie?.tmdb_id ?? null,
  title: movie?.title || "",
  overview: movie?.overview || "",
  genres: movie?.genres || [],
  keywords: movie?.keywords || [],
  vote_average: movie?.vote_average || 0,
  count_rating: movie?.count_rating || 0,
  runtime: movie?.runtime || 0,
  release_date: movie?.release_date || null,
});

const normalizeRatingPayload = (ratingDoc) => ({
  rating: ratingDoc.rating,
  createdAt: ratingDoc.createdAt,
  updatedAt: ratingDoc.updatedAt,
  movie: normalizeMoviePayload(ratingDoc.movie),
});

const normalizeRecommendation = (movie, extra = {}) => ({
  id: movie?._id || null,
  tmdb_id: movie?.tmdb_id ?? extra.tmdb_id ?? null,
  title: movie?.title || extra.title || "Unknown title",
  overview: movie?.overview || extra.overview || "",
  genres: movie?.genres || extra.genres || [],
  keywords: movie?.keywords || extra.keywords || [],
  runtime: movie?.runtime || extra.runtime || 0,
  vote_average: movie?.vote_average ?? extra.vote_average ?? 0,
  count_rating: movie?.count_rating ?? extra.count_rating ?? 0,
  release_date: movie?.release_date || extra.release_date || null,
  poster_path: movie?.poster_path || extra.poster_path || null,
  backdrop_path: movie?.backdrop_path || extra.backdrop_path || null,
  score: extra.score ?? null,
  reason: extra.reason || "",
  source: extra.source || "local-fallback",
});

// ─────────────────────────────────────────────────────────────────────────────
// Fetch user ratings
// ─────────────────────────────────────────────────────────────────────────────

const fetchUserRatingSnapshot = async (userId) => {
  const ratings = await Rating.find({ user: userId })
    .populate("movie")
    .sort({ updatedAt: -1, createdAt: -1 })
    .limit(100)
    .lean();

  return ratings.filter((item) => item.movie).map(normalizeRatingPayload);
};

// ─────────────────────────────────────────────────────────────────────────────
// Resolve external AI-service results against local MongoDB
// ─────────────────────────────────────────────────────────────────────────────

const resolveExternalRecommendations = async (items) => {
  const tmdbIds = items
    .map((item) => Number(item.tmdb_id ?? item.id))
    .filter((value) => Number.isFinite(value));

  const movies = tmdbIds.length
    ? await Movie.find({ tmdb_id: { $in: tmdbIds } }).lean()
    : [];

  const byTmdbId = new Map(movies.map((movie) => [Number(movie.tmdb_id), movie]));

  return items
    .map((item) => {
      const tmdbId = Number(item.tmdb_id ?? item.id);
      const movie = Number.isFinite(tmdbId) ? byTmdbId.get(tmdbId) : null;

      return normalizeRecommendation(movie, {
        tmdb_id: Number.isFinite(tmdbId) ? tmdbId : null,
        title: item.title,
        overview: item.overview,
        genres: item.genres,
        keywords: item.keywords,
        runtime: item.runtime,
        vote_average: item.vote_average,
        count_rating: item.count_rating,
        release_date: item.release_date,
        score: item.score,
        reason: item.reason,
        source: item.source || "ml-service",
      });
    })
    .filter((item) => item.tmdb_id || item.title);
};

// ─────────────────────────────────────────────────────────────────────────────
// Call AI-service /recommendations/chat
// ─────────────────────────────────────────────────────────────────────────────

const callExternalRecommender = async ({
  user,
  question,
  ratingSnapshot,
  limit,
}) => {
  const baseUrl = process.env.RECOMMENDER_API_URL;
  if (!baseUrl) return [];

  const endpoint = `${baseUrl.replace(/\/$/, "")}/recommendations/chat`;
  const payload = {
    user: buildUserPayload(user),
    question,
    limit,
    ratings: ratingSnapshot,
  };

  const { data } = await axios.post(endpoint, payload, {
    timeout: DEFAULT_TIMEOUT_MS,
    headers: { "Content-Type": "application/json" },
  });

  const rawItems = data?.recommendations || data?.items || data?.results || [];
  if (!Array.isArray(rawItems) || !rawItems.length) return [];

  return resolveExternalRecommendations(rawItems.slice(0, limit));
};

// ─────────────────────────────────────────────────────────────────────────────
// Local MongoDB fallback — dùng khi AI-service unavailable
// ─────────────────────────────────────────────────────────────────────────────

const scoreFallbackMovie = (movie, likedGenres, regexes) => {
  let score = 0;

  for (const genre of movie.genres || []) {
    score += likedGenres.get(genre) || 0;
  }

  const searchableParts = [
    movie.title,
    movie.overview,
    ...(movie.genres || []),
    ...(movie.keywords || []),
  ]
    .filter(Boolean)
    .join(" ");

  for (const regex of regexes) {
    if (regex.test(searchableParts)) {
      score += 3;
    }
  }

  score += Number(movie.vote_average || 0) * 0.15;
  score += Math.min(Number(movie.popularity || 0), 100) * 0.01;
  score += Math.min(Number(movie.count_rating || 0), 5000) * 0.0005;

  return score;
};

const buildFallbackRecommendations = async ({
  question,
  ratingSnapshot,
  limit,
}) => {
  const ratedTmdbIds = new Set(
    ratingSnapshot
      .map((item) => Number(item.movie?.tmdb_id))
      .filter((value) => Number.isFinite(value)),
  );

  // Tính preferred genres từ ratings
  const likedGenres = new Map();
  for (const item of ratingSnapshot) {
    if (item.rating < 3) continue;
    for (const genre of item.movie?.genres || []) {
      likedGenres.set(genre, (likedGenres.get(genre) || 0) + item.rating);
    }
  }

  const topGenres = [...likedGenres.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([genre]) => genre);

  const regexes = tokenizeQuestion(question).map(
    (token) => new RegExp(escapeRegex(token), "i"),
  );

  // Query candidates
  const query = { tmdb_id: { $nin: [...ratedTmdbIds] } };
  if (topGenres.length) {
    query.genres = { $in: topGenres };
  }

  const candidateLimit = Math.max(limit * 8, 40);
  let candidates = await Movie.find(query)
    .sort({ vote_average: -1, popularity: -1, count_rating: -1 })
    .limit(candidateLimit)
    .lean();

  // Nếu không có phim match genre → lấy phổ biến nhất
  if (!candidates.length) {
    candidates = await Movie.find({ tmdb_id: { $nin: [...ratedTmdbIds] } })
      .sort({ vote_average: -1, popularity: -1 })
      .limit(candidateLimit)
      .lean();
  }

  return candidates
    .map((movie) => ({
      movie,
      score: scoreFallbackMovie(movie, likedGenres, regexes),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ movie, score }) =>
      normalizeRecommendation(movie, {
        score: Math.round(score * 100) / 100,
        source: "local-fallback",
        reason: topGenres.length
          ? `Matched preferred genres: ${topGenres.join(", ")}`
          : "Popular and highly rated movie",
      }),
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Top-popular fallback — khi user chưa có ratings
// ─────────────────────────────────────────────────────────────────────────────

const buildPopularFallback = async ({ question, limit }) => {
  const regexes = tokenizeQuestion(question).map(
    (token) => new RegExp(escapeRegex(token), "i"),
  );

  // Nếu câu hỏi có keyword → ưu tiên phim match keyword
  let movies = [];
  if (regexes.length) {
    const keywordConditions = regexes.map((regex) => ({
      $or: [
        { title: regex },
        { genres: regex },
        { keywords: regex },
        { overview: regex },
      ],
    }));

    movies = await Movie.find({ $and: keywordConditions })
      .sort({ vote_average: -1, popularity: -1 })
      .limit(limit * 3)
      .lean();
  }

  // Nếu không đủ → bổ sung phim phổ biến
  if (movies.length < limit) {
    const existingIds = new Set(movies.map((m) => String(m._id)));
    const popular = await Movie.find({})
      .sort({ vote_average: -1, popularity: -1 })
      .limit(limit * 3)
      .lean();

    for (const m of popular) {
      if (!existingIds.has(String(m._id))) {
        movies.push(m);
        if (movies.length >= limit * 2) break;
      }
    }
  }

  return movies.slice(0, limit).map((movie) =>
    normalizeRecommendation(movie, {
      score: Number((movie.vote_average / 10).toFixed(2)),
      source: "popular-fallback",
      reason: question
        ? `Popular movie matching your interest`
        : "Popular and highly rated movie",
    }),
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export const getPersonalizedRecommendations = async ({
  user,
  question = "",
  limit = DEFAULT_LIMIT,
}) => {
  if (!user?._id) {
    // Unauthenticated — trả phim phổ biến
    const recommendations = await buildPopularFallback({ question, limit });
    return { recommendations, ratingSnapshot: [] };
  }

  const ratingSnapshot = await fetchUserRatingSnapshot(user._id);

  // User chưa có ratings → trả phim phổ biến + gợi ý theo keyword
  if (!ratingSnapshot.length) {
    const recommendations = await buildPopularFallback({ question, limit });
    return { recommendations, ratingSnapshot };
  }

  // User có ratings → thử AI-service trước
  try {
    const recommendations = await callExternalRecommender({
      user,
      question,
      ratingSnapshot,
      limit,
    });

    if (recommendations.length) {
      return { recommendations, ratingSnapshot };
    }
  } catch (error) {
    console.warn(
      "External recommender unavailable, using local fallback: %s",
      error.message,
    );
  }

  // Fallback: local MongoDB scoring
  const fallbackRecommendations = await buildFallbackRecommendations({
    question,
    ratingSnapshot,
    limit,
  });

  return {
    recommendations: fallbackRecommendations,
    ratingSnapshot,
  };
};

export const formatRecommendationContext = (recommendations = []) => {
  if (!recommendations.length) {
    return "No personalized recommendations are currently available.";
  }

  return recommendations
    .map((movie, index) => {
      const lines = [
        `Recommendation ${index + 1}: ${movie.title} (${getYear(movie.release_date)})`,
        `TMDB ID: ${movie.tmdb_id || "Unknown"}`,
        `Genres: ${movie.genres?.join(", ") || "Unknown"}`,
        `Average rating: ${movie.vote_average || "N/A"}/10`,
        `Source: ${movie.source || "unknown"}`,
      ];

      if (movie.score !== null && movie.score !== undefined) {
        lines.push(`Recommendation score: ${movie.score}`);
      }

      if (movie.reason) {
        lines.push(`Reason: ${movie.reason}`);
      }

      if (movie.overview) {
        lines.push(`Overview: ${movie.overview}`);
      }

      return lines.join("\n");
    })
    .join("\n\n");
};
