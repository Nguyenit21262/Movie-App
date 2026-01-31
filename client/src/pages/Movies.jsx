import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import MovieCard from "../components/MovieCard";
import { AppContent } from "../context/AppContext";

const Movies = () => {
  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContent);

  const [movies, setMovies] = useState({
    topRated: [],
    nowPlaying: [],
    popular: [],
    upcoming: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);

        const [
          topRatedRes,
          nowPlayingRes,
          popularRes,
          upcomingRes,
        ] = await Promise.all([
          axios.get(`${backendUrl}/api/movies/tmdb/top-rated`, {
            params: { page: 1 },
          }),
          axios.get(`${backendUrl}/api/movies/tmdb/now-playing`, {
            params: { page: 1 },
          }),
          axios.get(`${backendUrl}/api/movies/tmdb/popular`, {
            params: { page: 1 },
          }),
          axios.get(`${backendUrl}/api/movies/tmdb/upcoming`, {
            params: { page: 1 },
          }),
        ]);

        setMovies({
          topRated: topRatedRes.data.results || [],
          nowPlaying: nowPlayingRes.data.results || [],
          popular: popularRes.data.results || [],
          upcoming: upcomingRes.data.results || [],
        });
      } catch (err) {
        console.error(err);
        setError("Failed to load movies");
      } finally {
        setLoading(false);
      }
    };

    if (backendUrl) fetchMovies();
  }, [backendUrl]);

  const handleMovieClick = (movie) => {
    navigate(`/movies/tmdb/${movie.id}`);
    window.scrollTo(0, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-900 text-white">
        Loading movies...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-900 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-14 py-8 bg-neutral-900 min-h-screen">
      {/* TOP RATED */}
      <section className="px-8">
        <h2 className="text-white text-2xl font-bold mb-6">Top Pick</h2>
        <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {movies.topRated.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onClick={() => handleMovieClick(movie)}
            />
          ))}
        </div>
      </section>

      {/* NOW PLAYING */}
      <section className="px-8">
        <h2 className="text-white text-2xl font-bold mb-6">Now Playing</h2>
        <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {movies.nowPlaying.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onClick={() => handleMovieClick(movie)}
            />
          ))}
        </div>
      </section>

      {/* POPULAR */}
      <section className="px-8">
        <h2 className="text-white text-2xl font-bold mb-6">Popular Movies</h2>
        <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {movies.popular.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onClick={() => handleMovieClick(movie)}
            />
          ))}
        </div>
      </section>

      {/* UPCOMING */}
      <section className="px-8">
        <h2 className="text-white text-2xl font-bold mb-6">Upcoming Movies</h2>
        <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {movies.upcoming.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onClick={() => handleMovieClick(movie)}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Movies;
