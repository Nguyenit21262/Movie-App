// hooks/useMovieDetails.js
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAbortableRequest } from "./useAbortableRequest";
import { getMovieDetails } from "../api/movieApi";

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
      setState((s) => ({ ...s, loading: true }));
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
    } catch (err) {
      if (!axios.isCancel(err)) {
        setState((s) => ({
          ...s,
          loading: false,
          error: err,
        }));
      }
    }
  }, [id, createSignal]);

  useEffect(() => {
    fetchMovie();
  }, [fetchMovie]);

  return state;
};
