import { useState, useRef, useCallback } from "react";
import axios from "axios";

export const useMovieCategories = (backendUrl) => {
  const [movies, setMovies] = useState({
    topRated: [],
    nowPlaying: [],
    popular: [],
    upcoming: [],
  });

  const [loadingInitial, setLoadingInitial] = useState(true);

  const fetchedRef = useRef(new Set());

  const fetchCategory = useCallback(
    async (category, endpoint) => {
      if (!backendUrl) return;

      // tránh duplicate request
      if (fetchedRef.current.has(category)) return;

      fetchedRef.current.add(category);

      try {
        const res = await axios.get(
          `${backendUrl}/api/movies/tmdb/${endpoint}`,
          { params: { page: 1 } }
        );

        setMovies((prev) => ({
          ...prev,
          [category]: res.data.results || [],
        }));
      } catch (err) {
        console.error(`Fetch ${category} error`, err);

        // allow retry
        fetchedRef.current.delete(category);
      } finally {
        setLoadingInitial(false);
      }
    },
    [backendUrl]
  );

  // fetch nhiều category song song
  const fetchMultiple = useCallback(
    async (categories) => {
      await Promise.all(
        categories.map(({ key, endpoint }) =>
          fetchCategory(key, endpoint)
        )
      );
    },
    [fetchCategory]
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