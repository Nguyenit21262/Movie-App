import {
  fetchNowPlayingMovies,
  fetchPopularMovies,
  fetchTopRatedMovies,
  fetchUpcomingMovies,
} from "../api/movieApi";

export const fetchTopRated = (_backendUrl, page = 1) =>
  fetchTopRatedMovies(page);

export const fetchNowPlaying = (_backendUrl, page = 2) =>
  fetchNowPlayingMovies(page);

export const fetchPopular = (_backendUrl, page = 3) =>
  fetchPopularMovies(page);

export const fetchUpcoming = (_backendUrl, page = 4) =>
  fetchUpcomingMovies(page);
