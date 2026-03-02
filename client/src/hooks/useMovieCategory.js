// hooks/useMovieCategory.js
import { useState, useCallback, useRef } from "react";
import axios from "axios";

/**
 * Hook for fetching movie categories with built-in caching and optimization
 * - In-memory cache to prevent duplicate requests
 * - Request deduplication (prevents same request from running twice)
 * - Parallel batch fetching support
 */
export const useMovieCategory = (backendUrl) => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState({});
  const [error, setError] = useState({});
  
  // Track in-flight requests to prevent duplicates
  const pendingRequests = useRef(new Map());
  
  // Cache with timestamp for stale-while-revalidate pattern
  const cache = useRef(new Map());
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Fetch single category with caching and deduplication
   */
  const fetchCategory = useCallback(
    async (key, endpoint, options = {}) => {
      if (!backendUrl) return;

      const { 
        forceRefresh = false,
        timeout = 5000 
      } = options;

      // Return cached data if valid and not forcing refresh
      const cached = cache.current.get(key);
      if (!forceRefresh && cached && Date.now() - cached.timestamp < CACHE_TTL) {
        if (!data[key]) {
          setData((d) => ({ ...d, [key]: cached.data }));
        }
        return cached.data;
      }

      // Return existing in-flight request if available (deduplication)
      if (pendingRequests.current.has(key)) {
        return pendingRequests.current.get(key);
      }

      // Create new request
      const requestPromise = (async () => {
        try {
          setLoading((l) => ({ ...l, [key]: true }));
          setError((e) => ({ ...e, [key]: null }));

          const source = axios.CancelToken.source();
          const timeoutId = setTimeout(() => source.cancel('Request timeout'), timeout);

          const res = await axios.get(
            `${backendUrl}/api/movies/tmdb/${endpoint}`,
            { 
              params: { page: 1 },
              cancelToken: source.token,
              // Enable HTTP compression
              headers: {
                'Accept-Encoding': 'gzip, deflate, br'
              }
            }
          );

          clearTimeout(timeoutId);

          const results = res.data.results ?? [];
          
          // Update cache
          cache.current.set(key, {
            data: results,
            timestamp: Date.now()
          });

          // Update state
          setData((d) => ({ ...d, [key]: results }));
          
          return results;
        } catch (err) {
          if (!axios.isCancel(err)) {
            console.error(`Fetch ${key} failed:`, err.message);
            setError((e) => ({ ...e, [key]: err.message }));
          }
          return [];
        } finally {
          setLoading((l) => ({ ...l, [key]: false }));
          pendingRequests.current.delete(key);
        }
      })();

      // Store in-flight request
      pendingRequests.current.set(key, requestPromise);
      return requestPromise;
    },
    [backendUrl, data]
  );

  /**
   * Fetch multiple categories in parallel with optimized batching
   */
  const fetchBatch = useCallback(
    async (categories) => {
      if (!backendUrl || !categories?.length) return {};

      try {
        // Filter out already loaded categories (unless force refresh)
        const toFetch = categories.filter(({ key }) => !data[key]);
        
        if (toFetch.length === 0) return data;

        // Fetch all in parallel
        const promises = toFetch.map(({ key, endpoint }) => 
          fetchCategory(key, endpoint)
        );

        await Promise.all(promises);
        
        return data;
      } catch (err) {
        console.error('Batch fetch failed:', err);
        return data;
      }
    },
    [backendUrl, data, fetchCategory]
  );

  /**
   * Clear cache for specific key or all keys
   */
  const clearCache = useCallback((key) => {
    if (key) {
      cache.current.delete(key);
    } else {
      cache.current.clear();
    }
  }, []);

  /**
   * Prefetch data without updating loading state (background fetch)
   */
  const prefetch = useCallback(
    async (key, endpoint) => {
      if (!backendUrl || data[key]) return;

      try {
        const res = await axios.get(
          `${backendUrl}/api/movies/tmdb/${endpoint}`,
          { 
            params: { page: 1 },
            headers: { 'Accept-Encoding': 'gzip, deflate, br' }
          }
        );

        const results = res.data.results ?? [];
        
        cache.current.set(key, {
          data: results,
          timestamp: Date.now()
        });
        
        setData((d) => ({ ...d, [key]: results }));
      } catch (err) {
        // Silent fail for prefetch
        console.debug(`Prefetch ${key} failed:`, err.message);
      }
    },
    [backendUrl, data]
  );

  return { 
    data, 
    loading, 
    error,
    fetchCategory, 
    fetchBatch,
    prefetch,
    clearCache 
  };
};