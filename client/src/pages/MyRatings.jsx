import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { StarIcon } from "lucide-react";

import { getUserRatedMovies } from "../api/userApi";
import Loading from "../components/Loading";
import MovieCard from "../components/MovieCard";

const MyRatings = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRatedMovies = async () => {
      try {
        const { data } = await getUserRatedMovies();

        if (data.success) {
          setMovies(data.movies || []);
          return;
        }

        setError(data.message || "Failed to load rated movies");
      } catch (err) {
        console.error("Failed to load rated movies:", err);
        setError("Failed to load rated movies");
      } finally {
        setLoading(false);
      }
    };

    fetchRatedMovies();
  }, []);

  const openMovie = (movie) => {
    const tmdbId = movie.tmdb_id || movie.id;
    if (!tmdbId) return;

    navigate(`/movies/tmdb/${tmdbId}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) return <Loading />;

  return (
    <div className="relative min-h-[80vh] bg-neutral-900 px-4 pt-10 pb-16 sm:px-6 md:px-16 md:pt-16 lg:px-40">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-lg font-semibold text-white">My Ratings</h1>

        <span className="text-sm text-gray-400">
          {movies.length} {movies.length === 1 ? "movie" : "movies"}
        </span>
      </div>

      {error && (
        <div className="rounded-sm border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {!error && movies.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <StarIcon className="mb-4 h-10 w-10 text-gray-600" />
          <p className="text-lg font-medium text-gray-400">
            No rated movies yet
          </p>
          <p className="mt-1 max-w-md text-sm leading-6 text-gray-600">
            Rate a movie to see it in this list.
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
          {movies.map((movie) => (
            <div key={movie._id || movie.tmdb_id} className="space-y-2">
              <MovieCard movie={movie} onClick={() => openMovie(movie)} />

              <div className="mx-auto flex max-w-[230px] items-center gap-1 text-sm text-gray-400">
                <span>Rated</span>
                <span className="flex items-center gap-1 font-medium text-yellow-400">
                  <StarIcon className="h-4 w-4 fill-yellow-400" />
                  {movie.userRating}/5
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRatings;
