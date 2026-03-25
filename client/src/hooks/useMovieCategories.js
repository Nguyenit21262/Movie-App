import { useState, useRef, useCallback } from "react";
import {
  fetchNowPlayingMovies,
  fetchPopularMovies,
  fetchTopRatedMovies,
  fetchUpcomingMovies,
} from "../api/movieApi";

const endpointMap = {
  "top-rated": fetchTopRatedMovies,
  "now-playing": fetchNowPlayingMovies,
  popular: fetchPopularMovies,
  upcoming: fetchUpcomingMovies,
};

export const useMovieCategories = () => {
  const [movies, setMovies] = useState({
    topRated: [],
    nowPlaying: [],
    popular: [],
    upcoming: [],
  });
  const [loadingInitial, setLoadingInitial] = useState(true);
  const fetchedRef = useRef(new Set());

  const fetchCategory = useCallback(async (category, endpoint) => {
    if (fetchedRef.current.has(category)) return;

    const fetcher = endpointMap[endpoint];
    if (!fetcher) return;

    fetchedRef.current.add(category);

    try {
      const res = await fetcher(1);

      setMovies((prev) => ({
        ...prev,
        [category]: res.data.results || [],
      }));
    } catch (err) {
      console.error(`Fetch ${category} error`, err);
      fetchedRef.current.delete(category);
    } finally {
      setLoadingInitial(false);
    }
  }, []);

  const fetchMultiple = useCallback(
    async (categories) => {
      await Promise.all(
        categories.map(({ key, endpoint }) => fetchCategory(key, endpoint)),
      );
    },
    [fetchCategory],
  );

  const filterByGenre = useCallback((list, genreId) => {
    if (!genreId) return list;
    return list.filter((m) => m.genre_ids?.includes(genreId));
  }, []);

  return {
    movies,
    loadingInitial,
    fetchCategory,
    fetchMultiple,
    filterByGenre,
  };
};
