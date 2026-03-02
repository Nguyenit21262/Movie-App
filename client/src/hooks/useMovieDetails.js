// hooks/useMovieDetails.js
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAbortableRequest } from "./useAbortableRequest";

export const useMovieDetails = (backendUrl, id) => {
  const { createSignal } = useAbortableRequest();

  const [state, setState] = useState({
    movie: null,
    credits: null,
    videos: [],
    recommendations: [],
    loading: true,
    error: null,
  });

  const fetchMovie = useCallback(async () => {
    if (!backendUrl || !id) return;

    try {
      setState((s) => ({ ...s, loading: true }));
      const { data } = await axios.get(
        `${backendUrl}/api/movies/tmdb/${id}`,
        { signal: createSignal() }
      );

      if (data?.success) {
        setState({
          movie: data.movie,
          credits: data.credits ?? null,
          videos: data.videos ?? [],
          recommendations: data.recommendations ?? [],
          loading: false,
          error: null,
        });
      }
    } catch (err) {
      if (!axios.isCancel(err)) {
        setState((s) => ({
          ...s,
          loading: false,
          error: err,
        }));
      }
    }
  }, [backendUrl, id, createSignal]);

  useEffect(() => {
    fetchMovie();
  }, [fetchMovie]);

  return state;
};
