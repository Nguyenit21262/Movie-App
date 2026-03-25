import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Loading from "../components/Loading";
import TheatersCard from "../components/TheatersCard";
import LazySection from "../components/LazySection";
import { fetchUpcomingMovies } from "../api/movieApi";
import { getTheaterMovies } from "../api/showApi";

const TMDB_IMAGE = "https://image.tmdb.org/t/p/w300";

const Theaters = () => {
  const navigate = useNavigate();
  const [nowPlayingShows, setNowPlayingShows] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [error, setError] = useState(null);

  const fetchNowPlayingShows = useCallback(async () => {
    try {
      const { data } = await getTheaterMovies();
      if (data.success) {
        setNowPlayingShows(data.shows); // Movie[] từ DB
      } else {
        setError("Failed to load theater data");
      }
    } catch (err) {
      console.error("Error fetching shows:", err);
      setError("Failed to load theater data");
    } finally {
      setLoadingInitial(false);
    }
  }, []);

  const fetchUpcoming = useCallback(async () => {
    try {
      const res = await fetchUpcomingMovies(1);
      setUpcomingMovies(res.data.results || []);
    } catch (err) {
      console.error("Error fetching upcoming:", err);
    }
  }, []);

  useEffect(() => {
    fetchNowPlayingShows();
  }, [fetchNowPlayingShows]);

  const handleShowClick = useCallback(
    (movie) => {
      navigate(`/theaters/${movie._id}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [navigate],
  );

  const handleUpcomingClick = useCallback(
    (id) => {
      navigate(`/theaters/tmdb/${id}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [navigate],
  );

  if (loadingInitial) return <Loading />;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-900">
        <div className="text-center p-8 bg-neutral-800 rounded-2xl border border-red-500/20">
          <p className="text-red-500 text-xl mb-6 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all active:scale-95"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-16 py-8 mt-10 bg-neutral-900 min-h-screen">
      <section className="px-6 md:px-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-white text-3xl font-bold tracking-tight">
            Now Playing
          </h2>
          <span className="h-px flex-1 bg-neutral-800 ml-6 hidden md:block" />
        </div>

        {nowPlayingShows.length > 0 ? (
          <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {nowPlayingShows.map((movie) => (
              <TheatersCard
                key={movie._id}
                movie={{
                  ...movie,
                  poster_path: `${TMDB_IMAGE}${movie.poster_path}`,
                }}
                movieDbId={movie._id}
                onClick={() => handleShowClick(movie)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center mb-4">
              <span className="text-2xl">🎬</span>
            </div>
            <p className="text-gray-400 text-lg font-medium">
              No shows available
            </p>
            <p className="text-gray-600 text-sm mt-1">
              Admin has not scheduled any shows yet
            </p>
          </div>
        )}
      </section>

      {/* ── UPCOMING — từ TMDB ── */}
      <LazySection fetchData={fetchUpcoming}>
        <section className="px-6 md:px-12 animate-in fade-in duration-1000">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-white text-3xl font-bold tracking-tight">
              Upcoming Movies
            </h2>
            <span className="h-px flex-1 bg-neutral-800 ml-6 hidden md:block" />
          </div>

          {upcomingMovies.length > 0 ? (
            <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {upcomingMovies.map((movie) => (
                <TheatersCard
                  key={movie.id}
                  movie={{
                    ...movie,
                    poster_path: `${TMDB_IMAGE}${movie.poster_path}`,
                  }}
                  onClick={() => handleUpcomingClick(movie.id)}
                />
              ))}
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 opacity-20">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-[2/3] bg-neutral-800 rounded-xl"
                />
              ))}
            </div>
          )}
        </section>
      </LazySection>
    </div>
  );
};

export default Theaters;
