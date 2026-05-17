import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";

import {
  getUserBookmarkedMovies,
  removeMovieBookmark,
} from "../api/userApi";
import Loading from "../components/Loading";
import MovieCard from "../components/MovieCard";

const MyBookmarks = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const { data } = await getUserBookmarkedMovies();

        if (data.success) {
          setMovies(data.movies || []);
          return;
        }

        setError(data.message || "Failed to load bookmarks");
      } catch (err) {
        console.error("Failed to load bookmarks:", err);
        setError("Failed to load bookmarks");
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, []);

  const openMovie = (movie) => {
    const tmdbId = movie.tmdb_id || movie.id;
    if (!tmdbId) return;

    navigate(`/movies/tmdb/${tmdbId}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRemove = async (movie) => {
    const tmdbId = movie.tmdb_id || movie.id;
    if (!tmdbId || removingId === tmdbId) return;

    try {
      setRemovingId(tmdbId);
      const { data } = await removeMovieBookmark(tmdbId);

      if (data.success) {
        setMovies((current) =>
          current.filter((item) => (item.tmdb_id || item.id) !== tmdbId),
        );
      } else {
        setError(data.message || "Failed to remove bookmark");
      }
    } catch (err) {
      console.error("Failed to remove bookmark:", err);
      setError("Failed to remove bookmark");
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="relative min-h-[80vh] bg-neutral-900 px-4 pt-10 pb-16 sm:px-6 md:px-16 md:pt-16 lg:px-40">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-lg font-semibold text-white">My Bookmarks</h1>

        <span className="text-sm text-gray-400">
          {movies.length} {movies.length === 1 ? "movie" : "movies"}
        </span>
      </div>

      {error && (
        <div className="mb-6 rounded-sm border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {!error && movies.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Heart className="mb-4 h-10 w-10 text-gray-600" />
          <p className="text-lg font-medium text-gray-400">
            No bookmarks yet
          </p>
          <p className="mt-1 max-w-md text-sm leading-6 text-gray-600">
            Tap the heart button on a movie to save it here.
          </p>
          <button
            onClick={() => navigate("/movies")}
            className="mt-6 rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700"
          >
            Browse Movies
          </button>
        </div>
      )}

      {movies.length > 0 && (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {movies.map((movie) => {
            const tmdbId = movie.tmdb_id || movie.id;

            return (
              <div key={movie._id || tmdbId} className="space-y-2">
                <MovieCard
                  movie={movie}
                  onClick={() => openMovie(movie)}
                  showRating={false}
                />

                <button
                  onClick={() => handleRemove(movie)}
                  disabled={removingId === tmdbId}
                  className="mx-auto flex max-w-[230px] items-center gap-1 text-sm font-medium text-red-400 transition hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                  {removingId === tmdbId ? "Removing..." : "Remove"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBookmarks;
