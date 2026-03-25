import { httpClient } from "./httpClient";

export const getMovieComments = (movieId) =>
  httpClient.get(`/api/movies/${movieId}/comments`);

export const createMovieComment = (movieId, payload) =>
  httpClient.post(`/api/movies/${movieId}/comments`, payload);

export const updateMovieComment = (movieId, commentId, payload) =>
  httpClient.put(`/api/movies/${movieId}/comments/${commentId}`, payload);

export const deleteMovieComment = (movieId, commentId) =>
  httpClient.delete(`/api/movies/${movieId}/comments/${commentId}`);
