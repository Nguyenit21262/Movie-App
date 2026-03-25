import { httpClient } from "./httpClient";

export const getTheaterMovies = () => httpClient.get("/api/show/all-shows");

export const getShowMovieById = (movieId, config = {}) =>
  httpClient.get(`/api/show/${movieId}`, config);

export const getAdminUpcomingMovies = () => httpClient.get("/api/show/upcoming");

export const getAdminNowPlayingMovies = () =>
  httpClient.get("/api/show/now-playing");

export const addShow = (payload) => httpClient.post("/api/show/add", payload);

export const updateShow = (showId, payload) =>
  httpClient.put(`/api/show/${showId}`, payload);

export const deleteShow = (showId) => httpClient.delete(`/api/show/${showId}`);
