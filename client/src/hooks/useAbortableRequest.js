// hooks/useAbortableRequest.js
import { useEffect, useRef, useCallback } from "react";

/**
 * Hook for managing abortable HTTP requests
 * Automatically cancels pending requests on unmount or new request
 */
export const useAbortableRequest = () => {
  const controllerRef = useRef(null);

  const createSignal = useCallback(() => {
    // Cancel previous request if exists
    controllerRef.current?.abort();
    
    // Create new controller
    controllerRef.current = new AbortController();
    return controllerRef.current.signal;
  }, []);

  const abort = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      controllerRef.current?.abort();
    };
  }, []);

  return { createSignal, abort };
};