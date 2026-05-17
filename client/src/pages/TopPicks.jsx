import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContent";
import { fetchPersonalRecommendations } from "../api/movieApi";
import MovieCard from "../components/MovieCard";
import Loading from "../components/Loading";
import { getCurrentTimeContextBucket } from "../lib/timeContext";

const SORT_OPTIONS = [
  { key: "relevance", label: "Best Match" },
  { key: "rating", label: "Rating" },
  { key: "title", label: "Title" },
  { key: "year", label: "Release Year" },
];

const ORDER_OPTIONS = [
  { key: "asc", label: "Ascending" },
  { key: "desc", label: "Descending" },
];

const sortMovies = (movies, sortKey, sortDirection) => {
  const list = [...movies];
  const direction = sortDirection === "asc" ? 1 : -1;

  switch (sortKey) {
    case "rating":
      return list.sort(
        (a, b) => ((a.vote_average ?? 0) - (b.vote_average ?? 0)) * direction,
      );
    case "title":
      return list.sort((a, b) =>
        (a.title ?? "").localeCompare(b.title ?? "", undefined, {
          sensitivity: "base",
        }) * direction,
      );
    case "year":
      return list.sort(
        (a, b) =>
          (new Date(a.release_date ?? 0) - new Date(b.release_date ?? 0)) *
          direction,
      );
    case "relevance":
    default:
      return list;
  }
};

const GuestPrompt = ({ onLogin }) => (
  <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center md:p-10">
    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gray-500">
      Members Only
    </p>
    <h2 className="mt-4 text-2xl font-semibold text-white">
      Sign in to unlock Top Picks
    </h2>
    <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-400">
      We use the movies you rate to build a recommendation shelf that feels more
      personal than the standard catalog lists.
    </p>
    <button
      onClick={onLogin}
      className="mt-6 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-gray-200"
    >
      Sign In
    </button>
  </div>
);

const EmptyState = ({ onRefresh, loading }) => (
  <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-8 text-center md:p-10">
    <h2 className="text-2xl font-semibold text-white">No picks yet</h2>
    <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-400">
      The recommendation service may still be warming up, or your taste profile
      needs a little more activity. Try again in a moment.
    </p>
    <button
      onClick={onRefresh}
      disabled={loading}
      className="mt-6 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/10 disabled:opacity-50"
    >
      Retry
    </button>
  </div>
);

const TopPicks = () => {
  const navigate = useNavigate();
  const {
    isLoggedIn,
    loading: authLoading,
    topPicksRefreshToken,
  } = useContext(AppContent);

  const [movies, setMovies] = useState([]);
  const [meta, setMeta] = useState({
    source: null,
    ratingCount: 0,
    ratingsSinceLastBuild: 0,
    ratingsUntilPersonalized: null,
    nextRefreshIn: null,
    timeContext: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortKey, setSortKey] = useState("relevance");
  const [sortDirection, setSortDirection] = useState("desc");
  const activeRequestRef = useRef(null);
  const requestIdRef = useRef(0);
  const refreshTimerRef = useRef(null);
  const timeContextTimerRef = useRef(null);
  const activeTimeBucketRef = useRef(getCurrentTimeContextBucket());
  const pendingRefreshRef = useRef(null);

  const fetchRecommendations = useCallback(
    async (forceRefresh = false) => {
      if (!isLoggedIn) return;

      if (activeRequestRef.current) {
        pendingRefreshRef.current = {
          forceRefresh: Boolean(
            pendingRefreshRef.current?.forceRefresh || forceRefresh,
          ),
        };
        return;
      }

      const controller = new AbortController();
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      activeRequestRef.current = controller;

      setLoading(true);
      setError(null);

      try {
        const { data } = await fetchPersonalRecommendations(30, forceRefresh, {
          signal: controller.signal,
        });

        if (requestId !== requestIdRef.current) return;

        if (data.success) {
          const normalized = (data.recommendations || []).map((rec, idx) => ({
            ...rec,
            id: rec.tmdb_id ?? idx,
          }));

          setMovies(normalized);
          setMeta({
            source: data.source ?? null,
            ratingCount: data.ratingCount ?? 0,
            ratingsSinceLastBuild: data.ratingsSinceLastBuild ?? 0,
            ratingsUntilPersonalized: data.ratingsUntilPersonalized ?? null,
            nextRefreshIn: data.nextRefreshIn ?? null,
            timeContext: data.timeContext ?? null,
          });
          activeTimeBucketRef.current =
            data.timeContext?.bucket ?? getCurrentTimeContextBucket();

          if (data.source === "gcn-building") {
            clearTimeout(refreshTimerRef.current);
            refreshTimerRef.current = setTimeout(() => {
              fetchRecommendations();
            }, 2500);
          }
        } else {
          setError("Unable to load Top Picks right now.");
        }
      } catch (err) {
        if (err?.code === "ERR_CANCELED" || controller.signal.aborted) {
          return;
        }
        console.error("TopPicks fetch error:", err);
        setError("Top Picks could not be loaded. Please try again.");
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
          if (activeRequestRef.current === controller) {
            activeRequestRef.current = null;
          }

          if (pendingRefreshRef.current) {
            const pendingForceRefresh = pendingRefreshRef.current.forceRefresh;
            pendingRefreshRef.current = null;
            fetchRecommendations(pendingForceRefresh);
          }
        }
      }
    },
    [isLoggedIn],
  );

  useEffect(() => {
    if (!authLoading && isLoggedIn) {
      fetchRecommendations();
    }
  }, [authLoading, isLoggedIn, fetchRecommendations]);

  useEffect(() => {
    if (!isLoggedIn || topPicksRefreshToken === 0) return;

    clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = setTimeout(() => {
      fetchRecommendations(true);
    }, 600);

    return () => clearTimeout(refreshTimerRef.current);
  }, [isLoggedIn, topPicksRefreshToken, fetchRecommendations]);

  useEffect(() => {
    if (!isLoggedIn) return;

    activeTimeBucketRef.current = getCurrentTimeContextBucket();
    timeContextTimerRef.current = setInterval(() => {
      const currentBucket = getCurrentTimeContextBucket();

      if (currentBucket !== activeTimeBucketRef.current) {
        activeTimeBucketRef.current = currentBucket;
        fetchRecommendations(true);
      }
    }, 60000);

    return () => clearInterval(timeContextTimerRef.current);
  }, [isLoggedIn, fetchRecommendations]);

  useEffect(() => {
    return () => {
      clearTimeout(refreshTimerRef.current);
      clearInterval(timeContextTimerRef.current);
      pendingRefreshRef.current = null;
      activeRequestRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (sortKey === "title") {
      setSortDirection("asc");
      return;
    }

    setSortDirection("desc");
  }, [sortKey]);

  const sortedMovies = useMemo(
    () => sortMovies(movies, sortKey, sortDirection),
    [movies, sortKey, sortDirection],
  );

  const handleMovieClick = (movie) => {
    const id = movie.tmdb_id ?? movie.id;
    if (!id) return;

    navigate(`/movies/tmdb/${id}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (authLoading) return <Loading />;

  return (
    <div className="min-h-screen bg-neutral-900 pt-24">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-12 sm:px-6 lg:px-8">
        {!isLoggedIn && <GuestPrompt onLogin={() => navigate("/login")} />}

        {isLoggedIn && loading && movies.length === 0 && (
          <div className="flex justify-center py-20">
            <Loading />
          </div>
        )}

        {isLoggedIn && error && (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
            <p className="text-sm text-gray-300">{error}</p>
            <button
              onClick={() => fetchRecommendations(true)}
              className="mt-5 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Try Again
            </button>
          </div>
        )}

        {isLoggedIn && !loading && !error && movies.length === 0 && (
          <EmptyState onRefresh={() => fetchRecommendations(true)} loading={loading} />
        )}

        {isLoggedIn && sortedMovies.length > 0 && (
          <>
            <div className="flex flex-wrap items-center gap-3 rounded-2x p-1">
              <span className="text-sm text-gray-400">Sort by:</span>

              <select
                value={sortKey}
                onChange={(event) => setSortKey(event.target.value)}
                className="rounded-md border border-white/10 bg-white text-sm text-black focus:outline-none"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                value={sortDirection}
                onChange={(event) => setSortDirection(event.target.value)}
                disabled={sortKey === "relevance"}
                className="rounded-md border border-white/10 bg-white  text-sm text-black focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-200"
              >
                {ORDER_OPTIONS.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>

              {meta.timeContext?.label && (
                <span className="ml-auto rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-xs font-medium text-yellow-200">
                  {meta.timeContext.label} context
                </span>
              )}

              {/* <span className="ml-auto text-sm text-gray-500">
                {sortedMovies.length} movies
              </span>

              {meta.source !== "cold-start" && meta.nextRefreshIn != null && (
                <span className="text-sm text-gray-500">
                  Auto-updates after {meta.nextRefreshIn} more ratings
                </span>
              )} */}
            </div>

            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {sortedMovies.map((movie) => (
                <MovieCard
                  key={movie.tmdb_id ?? movie.id}
                  movie={movie}
                  onClick={() => handleMovieClick(movie)}
                />
              ))}
            </div>

            {loading && movies.length > 0 && (
              <p className="text-center text-sm text-gray-500">
                Refreshing your personalized picks...
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TopPicks;
