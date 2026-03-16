import axios from "axios";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";
const DEFAULT_LANGUAGE = "en-US";

const tmdbAxios = axios.create({
  baseURL: TMDB_BASE_URL,
  headers: {
    Authorization: `Bearer ${process.env.TMDB_API}`,
    "Content-Type": "application/json;charset=utf-8",
  },
  params: { language: DEFAULT_LANGUAGE },
});

const handleTMDBRequest = async (request) => {
  try {
    const { data } = await request;
    return data;
  } catch (error) {
    console.error("TMDB API Error:", error.response?.data || error.message);
    throw new Error("TMDB request failed");
  }
};

class TMDBService {
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

  static discoverByGenre(genreId, page = 1) {
    return handleTMDBRequest(
      tmdbAxios.get("/discover/movie", {
        params: { with_genres: genreId, page, sort_by: "popularity.desc" },
      }),
    );
  }

  static searchMovies(query, page = 1) {
    return handleTMDBRequest(
      tmdbAxios.get("/search/movie", { params: { query, page } }),
    );
  }

  static getMovieDetails(tmdbId) {
    return handleTMDBRequest(tmdbAxios.get(`/movie/${tmdbId}`));
  }

  static getMovieCredits(tmdbId) {
    return handleTMDBRequest(tmdbAxios.get(`/movie/${tmdbId}/credits`));
  }

  static getMovieKeywords(tmdbId) {
    return handleTMDBRequest(tmdbAxios.get(`/movie/${tmdbId}/keywords`));
  }

  static getMovieVideos(tmdbId) {
    return handleTMDBRequest(tmdbAxios.get(`/movie/${tmdbId}/videos`));
  }

  static getSimilarMovies(tmdbId, page = 1) {
    return handleTMDBRequest(
      tmdbAxios.get(`/movie/${tmdbId}/similar`, { params: { page } }),
    );
  }

  static getRecommendations(tmdbId, page = 1) {
    return handleTMDBRequest(
      tmdbAxios.get(`/movie/${tmdbId}/recommendations`, { params: { page } }),
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
    const [details, credits, keywords] = await Promise.all([
      this.getMovieDetails(tmdbId),
      this.getMovieCredits(tmdbId),
      this.getMovieKeywords(tmdbId),
    ]);
    return this.formatFromDetails(details, credits, keywords);
  }
}

export default TMDBService;
