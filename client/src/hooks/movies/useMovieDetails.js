import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { getMovieDetails } from "../../api/movieApi";
import { useAbortableRequest } from "../core/useAbortableRequest";

export const useMovieDetails = (id) => {
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
    if (!id) return;

    try {
      setState((current) => ({ ...current, loading: true }));
      const { data } = await getMovieDetails(id, { signal: createSignal() });

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
    } catch (error) {
      if (!axios.isCancel(error)) {
        setState((current) => ({
          ...current,
          loading: false,
          error,
        }));
      }
    }
  }, [id, createSignal]);

  useEffect(() => {
    fetchMovie();
  }, [fetchMovie]);

  return state;
};
