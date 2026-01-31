import axios from "axios";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

/**
 * Axios instance for TMDB
 */
const tmdbAxios = axios.create({
  baseURL: TMDB_BASE_URL,
  headers: {
    Authorization: `Bearer ${process.env.TMDB_API}`,
    "Content-Type": "application/json;charset=utf-8",
  },
});

class TMDBService {
  static async getTopRatedMovies(page = 1) {
    const { data } = await tmdbAxios.get("/movie/top_rated", {
      params: { language: "en-US", page },
    });
    return data;
  }

  static async getPopularMovies(page = 1) {
    const { data } = await tmdbAxios.get("/movie/popular", {
      params: { language: "en-US", page },
    });
    return data;
  }

  static async getNowPlayingMovies(page = 1) {
    const { data } = await tmdbAxios.get("/movie/now_playing", {
      params: { language: "en-US", page },
    });
    return data;
  }

  static async getUpcomingMovies(page = 1) {
    const { data } = await tmdbAxios.get("/movie/upcoming", {
      params: { language: "en-US", page },
    });
    return data;
  }

  static async getMovieDetails(tmdbId) {
    const { data } = await tmdbAxios.get(`/movie/${tmdbId}`, {
      params: { language: "en-US" },
    });
    return data;
  }

  static async getMovieCredits(tmdbId) {
    const { data } = await tmdbAxios.get(`/movie/${tmdbId}/credits`);
    return data;
  }

  static async getMovieKeywords(tmdbId) {
    const { data } = await tmdbAxios.get(`/movie/${tmdbId}/keywords`);
    return data.keywords || [];
  }

  static async searchMovies(query, page = 1) {
    const { data } = await tmdbAxios.get("/search/movie", {
      params: { language: "en-US", query, page },
    });
    return data;
  }

  static async getMovieVideos(tmdbId) {
    const { data } = await tmdbAxios.get(`/movie/${tmdbId}/videos`, {
      params: { language: "en-US" },
    });
    return data;
  }

  static async getSimilarMovies(tmdbId, page = 1) {
    const { data } = await tmdbAxios.get(`/movie/${tmdbId}/similar`, {
      params: { language: "en-US", page },
    });
    return data;
  }

  static async getRecommendations(tmdbId, page = 1) {
    const { data } = await tmdbAxios.get(`/movie/${tmdbId}/recommendations`, {
      params: { language: "en-US", page },
    });
    return data;
  }

  static getImageUrl(path, size = "original") {
    if (!path) return null;
    return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
  }

  static async formatMovieData(tmdbId) {
    const [details, credits, keywords] = await Promise.all([
      this.getMovieDetails(tmdbId),
      this.getMovieCredits(tmdbId),
      this.getMovieKeywords(tmdbId),
    ]);

    return {
      title: details.title,
      overview: details.overview,
      poster_path: details.poster_path || "",
      backdrop_path: details.backdrop_path || "",
      release_date: details.release_date
        ? new Date(details.release_date)
        : null,
      original_language: details.original_language,
      tagline: details.tagline || "",
      genres: details.genres?.map((g) => g.name) || [],
      keywords: keywords.map((k) => k.name),
      casts: credits.cast.slice(0, 10).map((actor) => ({
        actor: actor.name,
        character: actor.character,
        profile_path: actor.profile_path || "",
      })),
      vote_average: details.vote_average || 0,
      runtime: details.runtime || 0,
      count_rating: details.vote_count || 0,
      popularity: details.popularity || 0,
      tmdb_id: details.id,
    };
  }
}

export default TMDBService;