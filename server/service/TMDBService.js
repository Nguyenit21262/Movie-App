import axios from "axios";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";
const DEFAULT_LANGUAGE = "en-US";
const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);
const DEFAULT_RETRIES = 3;

const tmdbAxios = axios.create({
  baseURL: TMDB_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json;charset=utf-8",
  },
  params: { language: DEFAULT_LANGUAGE },
});

tmdbAxios.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${process.env.TMDB_API || ""}`;
  return config;
});

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const extractDirectorNames = (credits = null) => {
  const directors =
    credits?.crew
      ?.filter((person) => person?.job === "Director" && person?.name)
      .map((person) => person.name.trim())
      .filter(Boolean) || [];

  return [...new Set(directors)].join(", ");
};

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

  if (error?.code) {
    return status
      ? `status ${status} | ${error.code} | ${error.message}`
      : `${error.code} | ${error.message}`;
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

  /**
   * Discover movies that are both recent (last 5 years) and highly rated.
   * Used as a cold-start fallback for new users.
   */
  static discoverRecentTopRated(page = 1) {
    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - 5);
    const fromDate = cutoff.toISOString().split("T")[0];

    return handleTMDBRequest(
      () =>
        tmdbAxios.get("/discover/movie", {
          params: {
            sort_by: "vote_average.desc",
            "vote_count.gte": 300,       // enough votes to be trustworthy
            "release_date.gte": fromDate, // last 5 years
            "vote_average.gte": 7.0,     // reasonably good
            page,
          },
        }),
      { label: `TMDB discover recent top-rated page ${page}` },
    );
  }

  static getImageUrl(path, size = "original") {
    return path ? `${TMDB_IMAGE_BASE_URL}/${size}${path}` : null;
  }

  static extractDirector(credits = null) {
    return extractDirectorNames(credits);
  }

  static formatFromDetails(details, credits = null, keywords = null) {
    // Extract origin_country: prefer origin_country array, fallback to production_countries
    const originCountry =
      details.origin_country?.length
        ? details.origin_country.map((c) => c.toUpperCase())
        : details.production_countries
            ?.map((c) => c.iso_3166_1?.toUpperCase())
            .filter(Boolean) || [];

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
      origin_country: originCountry,
      tagline: details.tagline || "",
      director: extractDirectorNames(credits),
      genres: details.genres?.map((g) => g.name) || [],
      keywords: keywords?.keywords?.map((k) => k.name) || [],
      casts:
        credits?.cast
          ?.filter((c) => c.name && c.character?.trim())
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
