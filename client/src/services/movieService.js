import axios from "axios";

export const fetchTopRated = (backendUrl, page = 1) =>
  axios.get(`${backendUrl}/api/movies/tmdb/top-rated`, { params: { page } });

export const fetchNowPlaying = (backendUrl, page = 2) =>
  axios.get(`${backendUrl}/api/movies/tmdb/now-playing`, { params: { page } });

export const fetchPopular = (backendUrl, page = 3) =>
  axios.get(`${backendUrl}/api/movies/tmdb/popular`, { params: { page } });

export const fetchUpcoming = (backendUrl, page = 4) =>
  axios.get(`${backendUrl}/api/movies/tmdb/upcoming`, { params: { page } });
