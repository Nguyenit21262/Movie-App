import axios from "axios";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";
const DEFAULT_LANGUAGE = "en-US";

/**
 * Axios instance
 */
const tmdbAxios = axios.create({
  baseURL: TMDB_BASE_URL,
  headers: {
    Authorization: `Bearer ${process.env.TMDB_API}`,
    "Content-Type": "application/json;charset=utf-8",
  },
  params: {
    language: DEFAULT_LANGUAGE,
  },
});

/**
 * Centralized error handler
 */
const handleTMDBRequest = async (request) => {
  try {
    const { data } = await request;
    return data;
  } catch (error) {
    console.error(
      "TMDB API Error:",
      error.response?.data || error.message,
    );
    throw new Error("TMDB request failed");
  }
};

class TMDBService {
  // ===== MOVIE LIST =====
  static getTopRatedMovies(page = 1) {
    return handleTMDBRequest(
      tmdbAxios.get("/movie/top_rated", { params: { page } }),
    );
  }

  static getPopularMovies(page = 1) {
    return handleTMDBRequest(
      tmdbAxios.get("/movie/popular", { params: { page } }),
    );
  }

  static getNowPlayingMovies(page = 1) {
    return handleTMDBRequest(
      tmdbAxios.get("/movie/now_playing", { params: { page } }),
    );
  }

  static getUpcomingMovies(page = 1) {
    return handleTMDBRequest(
      tmdbAxios.get("/movie/upcoming", { params: { page } }),
    );
  }

  // ===== GENRE DISCOVERY (QUAN TRỌNG) =====
  static discoverByGenre(genreId, page = 1) {
    return handleTMDBRequest(
      tmdbAxios.get("/discover/movie", {
        params: {
          with_genres: genreId,
          page,
          sort_by: "popularity.desc",
        },
      }),
    );
  }

  // ===== SEARCH =====
  static searchMovies(query, page = 1) {
    return handleTMDBRequest(
      tmdbAxios.get("/search/movie", {
        params: { query, page },
      }),
    );
  }

  // ===== DETAILS =====
  static getMovieDetails(tmdbId) {
    return handleTMDBRequest(
      tmdbAxios.get(`/movie/${tmdbId}`),
    );
  }

  static getMovieCredits(tmdbId) {
    return handleTMDBRequest(
      tmdbAxios.get(`/movie/${tmdbId}/credits`),
    );
  }

  static getMovieKeywords(tmdbId) {
    return handleTMDBRequest(
      tmdbAxios.get(`/movie/${tmdbId}/keywords`),
    );
  }

  static getMovieVideos(tmdbId) {
    return handleTMDBRequest(
      tmdbAxios.get(`/movie/${tmdbId}/videos`),
    );
  }

  static getSimilarMovies(tmdbId, page = 1) {
    return handleTMDBRequest(
      tmdbAxios.get(`/movie/${tmdbId}/similar`, { params: { page } }),
    );
  }

  static getRecommendations(tmdbId, page = 1) {
    return handleTMDBRequest(
      tmdbAxios.get(`/movie/${tmdbId}/recommendations`, {
        params: { page },
      }),
    );
  }

  // ===== IMAGE =====
  static getImageUrl(path, size = "original") {
    return path ? `${TMDB_IMAGE_BASE_URL}/${size}${path}` : null;
  }

  // ===== FORMAT DATA =====
  static async formatMovieData(tmdbId) {
    const [details, credits, keywords] = await Promise.all([
      this.getMovieDetails(tmdbId),
      this.getMovieCredits(tmdbId),
      this.getMovieKeywords(tmdbId),
    ]);

    return {
      tmdb_id: details.id,
      title: details.title,
      overview: details.overview,
      poster_path: details.poster_path,
      backdrop_path: details.backdrop_path,
      release_date: details.release_date || null,
      runtime: details.runtime || 0,
      vote_average: details.vote_average || 0,
      vote_count: details.vote_count || 0,
      popularity: details.popularity || 0,
      genres: details.genres?.map((g) => g.name) || [],
      keywords: keywords.keywords?.map((k) => k.name) || [],
      casts:
        credits.cast?.slice(0, 10).map((c) => ({
          actor: c.name,
          character: c.character,
          profile_path: c.profile_path,
        })) || [],
    };
  }
}

export default TMDBService;
