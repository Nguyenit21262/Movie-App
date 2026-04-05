import { useEffect, useRef, useCallback } from "react";

export const useAbortableRequest = () => {
  const controllerRef = useRef(null);

  const createSignal = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = new AbortController();
    return controllerRef.current.signal;
  }, []);

  const abort = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      controllerRef.current?.abort();
    };
  }, []);

  return { createSignal, abort };
};
