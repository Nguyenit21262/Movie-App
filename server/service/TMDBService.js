import axios from "axios";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";
const DEFAULT_LANGUAGE = "en-US";
const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);
const DEFAULT_RETRIES = 3;

const tmdbAxios = axios.create({
  baseURL: TMDB_BASE_URL,
  headers: {
    Authorization: `Bearer ${process.env.TMDB_API}`,
    "Content-Type": "application/json;charset=utf-8",
  },
  params: { language: DEFAULT_LANGUAGE },
});

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const summarizeTMDBError = (error) => {
  const status = error?.response?.status;
  const payload = error?.response?.data;

  if (typeof payload === "string") {
    const compact = payload.replace(/\s+/g, " ").trim().slice(0, 160);
    return status ? `status ${status} | ${compact}` : compact;
  }

  if (payload?.status_message) {
    return status
      ? `status ${status} | ${payload.status_message}`
      : payload.status_message;
  }

  return status
    ? `status ${status} | ${error.message}`
    : error.message;
};

const shouldRetryTMDBError = (error) => {
  const status = error?.response?.status;
  if (status && RETRYABLE_STATUS_CODES.has(status)) return true;
  return !status && Boolean(error?.code);
};

const handleTMDBRequest = async (
  requestFactory,
  { label = "TMDB request", retries = DEFAULT_RETRIES, optional = false } = {},
) => {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const { data } = await requestFactory();
      return data;
    } catch (error) {
      lastError = error;
      const canRetry = attempt < retries && shouldRetryTMDBError(error);

      if (canRetry) {
        const delayMs = 1000 * Math.pow(2, attempt);
        console.warn(
          `${label} retry ${attempt + 1}/${retries} after ${delayMs}ms: ${summarizeTMDBError(error)}`,
        );
        await wait(delayMs);
        continue;
      }

      const summary = summarizeTMDBError(error);
      if (optional) {
        console.warn(`${label} skipped: ${summary}`);
        return null;
      }

      console.error(`${label} failed: ${summary}`);
      throw new Error(`${label} failed`);
    }
  }

  if (optional) return null;
  throw new Error(`${label} failed: ${summarizeTMDBError(lastError)}`);
};

class TMDBService {
  static getTopRatedMovies(page = 1) {
    return handleTMDBRequest(
      () => tmdbAxios.get("/movie/top_rated", { params: { page } }),
      { label: `TMDB top rated page ${page}` },
    );
  }

  static getPopularMovies(page = 1) {
    return handleTMDBRequest(
      () => tmdbAxios.get("/movie/popular", { params: { page } }),
      { label: `TMDB popular page ${page}` },
    );
  }

  static getNowPlayingMovies(page = 1) {
    return handleTMDBRequest(
      () => tmdbAxios.get("/movie/now_playing", { params: { page } }),
      { label: `TMDB now playing page ${page}` },
    );
  }

  static getUpcomingMovies(page = 1) {
    return handleTMDBRequest(
      () => tmdbAxios.get("/movie/upcoming", { params: { page } }),
      { label: `TMDB upcoming page ${page}` },
    );
  }

  static getTrendingMovies(timeWindow = "week", page = 1) {
    return handleTMDBRequest(
      () => tmdbAxios.get(`/trending/movie/${timeWindow}`, { params: { page } }),
      { label: `TMDB trending ${timeWindow} page ${page}` },
    );
  }

  static discoverByGenre(genreId, page = 1) {
    return handleTMDBRequest(
      () => tmdbAxios.get("/discover/movie", {
        params: { with_genres: genreId, page, sort_by: "popularity.desc" },
      }),
      { label: `TMDB discover genre ${genreId} page ${page}` },
    );
  }

  static searchMovies(query, page = 1) {
    return handleTMDBRequest(
      () => tmdbAxios.get("/search/movie", { params: { query, page } }),
      { label: `TMDB search "${query}" page ${page}` },
    );
  }

  static getMovieDetails(tmdbId, options = {}) {
    return handleTMDBRequest(
      () => tmdbAxios.get(`/movie/${tmdbId}`),
      { label: `TMDB movie details ${tmdbId}`, ...options },
    );
  }

  static getMovieCredits(tmdbId, options = {}) {
    return handleTMDBRequest(
      () => tmdbAxios.get(`/movie/${tmdbId}/credits`),
      { label: `TMDB movie credits ${tmdbId}`, ...options },
    );
  }

  static getMovieKeywords(tmdbId, options = {}) {
    return handleTMDBRequest(
      () => tmdbAxios.get(`/movie/${tmdbId}/keywords`),
      { label: `TMDB movie keywords ${tmdbId}`, ...options },
    );
  }

  static getMovieVideos(tmdbId, options = {}) {
    return handleTMDBRequest(
      () => tmdbAxios.get(`/movie/${tmdbId}/videos`),
      { label: `TMDB movie videos ${tmdbId}`, ...options },
    );
  }

  static getSimilarMovies(tmdbId, page = 1) {
    return handleTMDBRequest(
      () => tmdbAxios.get(`/movie/${tmdbId}/similar`, { params: { page } }),
      { label: `TMDB similar ${tmdbId} page ${page}` },
    );
  }

  static getRecommendations(tmdbId, page = 1, options = {}) {
    return handleTMDBRequest(
      () => tmdbAxios.get(`/movie/${tmdbId}/recommendations`, { params: { page } }),
      { label: `TMDB recommendations ${tmdbId} page ${page}`, ...options },
    );
  }

  static getImageUrl(path, size = "original") {
    return path ? `${TMDB_IMAGE_BASE_URL}/${size}${path}` : null;
  }

  static formatFromDetails(details, credits = null, keywords = null) {
    return {
      tmdb_id: details.id,
      title: details.title,
      overview: details.overview,
      poster_path: details.poster_path || "",
      backdrop_path: details.backdrop_path || "",
      release_date: details.release_date || null,
      runtime: details.runtime || 0,
      vote_average: details.vote_average || 0,
      count_rating: details.vote_count || 0,
      popularity: details.popularity || 0,
      original_language: details.original_language || "en",
      tagline: details.tagline || "",
      genres: details.genres?.map((g) => g.name) || [],
      keywords: keywords?.keywords?.map((k) => k.name) || [],
      casts:
        credits?.cast
          ?.filter((c) => c.name && c.character?.trim()) // bỏ qua cast không có character
          .slice(0, 10)
          .map((c) => ({
            actor: c.name,
            character: c.character.trim(),
            profile_path: c.profile_path || "",
          })) || [],
    };
  }
  static async formatMovieData(tmdbId) {
    const details = await this.getMovieDetails(tmdbId);
    const [credits, keywords] = await Promise.all([
      this.getMovieCredits(tmdbId, { optional: true }),
      this.getMovieKeywords(tmdbId, { optional: true }),
    ]);
    return this.formatFromDetails(details, credits, keywords);
  }
}

export default TMDBService;
