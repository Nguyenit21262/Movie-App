import { useState, useRef, useCallback } from "react";
import {
  discoverMoviesByGenre,
  fetchNowPlayingMovies,
  fetchPopularMovies,
  fetchTopRatedMovies,
  fetchTrendingMovies,
  fetchUpcomingMovies,
} from "../../api/movieApi";

const endpointMap = {
  "top-rated": fetchTopRatedMovies,
  "now-playing": fetchNowPlayingMovies,
  popular: fetchPopularMovies,
  upcoming: fetchUpcomingMovies,
  "trending-day": (page, options = {}) => fetchTrendingMovies("day", page, options),
  "trending-week": (page, options = {}) => fetchTrendingMovies("week", page, options),
};

export const useMovieCategories = () => {
  const [movies, setMovies] = useState({
    trendingWeek: [],
    topRated: [],
    nowPlaying: [],
    popular: [],
    upcoming: [],
    genreDiscover: [],
  });
  const [loadingInitial, setLoadingInitial] = useState(true);
  const fetchedRef = useRef(new Set());

  const fetchCategory = useCallback(async (category, endpoint, options = {}) => {
    if (fetchedRef.current.has(category)) return;

    const fetcher = endpointMap[endpoint];
    const customFetcher = options.fetcher;

    if (!fetcher && !customFetcher) return;

    fetchedRef.current.add(category);

    try {
      const response = customFetcher
        ? await customFetcher()
        : await fetcher(1, options);
      setMovies((prev) => ({
        ...prev,
        [category]: response.data.results || [],
      }));
    } catch (error) {
      console.error(`Fetch ${category} error`, error);
      fetchedRef.current.delete(category);
    } finally {
      setLoadingInitial(false);
    }
  }, []);

  const fetchMultiple = useCallback(
    async (categories) => {
      await Promise.all(
        categories.map(({ key, endpoint, options }) =>
          fetchCategory(key, endpoint, options),
        ),
      );
    },
    [fetchCategory],
  );

  const fetchGenreDiscover = useCallback(
    async (category, genreId) =>
      fetchCategory(category, "discover", {
        fetcher: () => discoverMoviesByGenre(genreId),
      }),
    [fetchCategory],
  );

  const filterByGenre = useCallback((list, genreId) => {
    if (!Array.isArray(list)) return [];
    if (!genreId) return list;
    return list.filter((movie) => movie.genre_ids?.includes(genreId));
  }, []);

  return {
    movies,
    loadingInitial,
    fetchCategory,
    fetchMultiple,
    fetchGenreDiscover,
    filterByGenre,
  };
};
