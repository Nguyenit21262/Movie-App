import { httpClient } from "./httpClient";

const getTmdbList = (endpoint, page = 1, config = {}) =>
  httpClient.get(`/api/movies/tmdb/${endpoint}`, {
    ...config,
    params: { page, ...(config.params || {}) },
  });

export const fetchTopRatedMovies = (page = 1, config) =>
  getTmdbList("top-rated", page, config);

export const fetchNowPlayingMovies = (page = 1, config) =>
  getTmdbList("now-playing", page, config);

export const fetchPopularMovies = (page = 1, config) =>
  getTmdbList("popular", page, config);

export const fetchUpcomingMovies = (page = 1, config) =>
  getTmdbList("upcoming", page, config);

export const fetchTrendingMovies = (timeWindow = "week", page = 1, config = {}) =>
  httpClient.get(`/api/movies/tmdb/trending/${timeWindow}`, {
    ...config,
    params: { page, ...(config.params || {}) },
  });

export const discoverMoviesByGenre = (genreId, page = 1, config = {}) =>
  httpClient.get("/api/movies/tmdb/discover", {
    ...config,
    params: { genreId, page, ...(config.params || {}) },
  });

export const getMovieDetails = (tmdbId, config = {}) =>
  httpClient.get(`/api/movies/tmdb/${tmdbId}`, config);

export const searchMovies = (query) =>
  httpClient.get("/api/movies/search", { params: { q: query } });

export const getMovieSuggestions = (query) =>
  httpClient.get("/api/movies/suggestions", { params: { q: query } });

// Fetch personalized recommendations for the logged-in user
export const fetchRecommendations = (limit = 20, config = {}) =>
  httpClient.get("/api/movies/recommendations", {
    ...config,
    params: { limit, ...(config.params || {}) },
  });

