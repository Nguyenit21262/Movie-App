import { httpClient } from "./httpClient";

export const getCurrentUser = () => httpClient.get("/api/user/data");

export const updateUserProfile = (payload) =>
  httpClient.put("/api/user/update", payload);

export const getUserBookings = () => httpClient.get("/api/user/bookings");

export const getUserRatedMovies = () => httpClient.get("/api/user/ratings");

export const getUserBookmarkedMovies = () =>
  httpClient.get("/api/user/bookmarks");

export const getMovieBookmarkStatus = (tmdbId) =>
  httpClient.get(`/api/user/bookmarks/${tmdbId}`);

export const addMovieBookmark = (tmdbId) =>
  httpClient.post(`/api/user/bookmarks/${tmdbId}`);

export const removeMovieBookmark = (tmdbId) =>
  httpClient.delete(`/api/user/bookmarks/${tmdbId}`);
