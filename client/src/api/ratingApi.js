import { httpClient } from "./httpClient";

export const submitMovieRating = (tmdbId, rating) =>
  httpClient.post(`/api/movies/tmdb/${tmdbId}/rating`, { rating });

export const getMyMovieRating = (tmdbId) =>
  httpClient.get(`/api/movies/tmdb/${tmdbId}/rating/me`);
