import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { TMDB_GENRES, getGenreId } from "../lib/tmdb/Genres";

import MovieCard from "../components/MovieCard";
import Loading from "../components/Loading";
import LazySection from "../components/LazySection";

import { useMovieCategories } from "../hooks";
import { searchMovies as searchMoviesRequest } from "../api/movieApi";

const Movies = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const {
    movies,
    loadingInitial,
    fetchCategory,
    fetchMultiple,
    fetchGenreDiscover,
    filterByGenre,
  } = useMovieCategories();

  const [searchMovies, setSearchMovies] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const searchQuery = searchParams.get("search");

  const selectedGenre = useMemo(() => {
    const genreParam = searchParams.get("genre");
    return genreParam ? getGenreId(genreParam) : null;
  }, [searchParams]);

  const genreName = selectedGenre ? TMDB_GENRES[selectedGenre] : null;

  const sections = useMemo(
    () => [
      {
        key: "trendingWeek",
        title: genreName ? `${genreName} Trending` : "Trending This Week",
        endpoint: "trending-week",
      },
      {
        key: "topRated",
        title: genreName ? `Top ${genreName}` : "Top Rated",
        endpoint: "top-rated",
      },
      {
        key: "nowPlaying",
        title: genreName ? `${genreName} Now Playing` : "Now Playing",
        endpoint: "now-playing",
      },
      {
        key: "popular",
        title: genreName ? `Popular ${genreName}` : "Popular Movies",
        endpoint: "popular",
      },
      {
        key: "upcoming",
        title: genreName ? `Upcoming ${genreName}` : "Upcoming Movies",
        endpoint: "upcoming",
      },
    ],
    [genreName],
  );

  useEffect(() => {
    if (searchQuery) return;

    fetchMultiple([
      { key: "trendingWeek", endpoint: "trending-week" },
      { key: "topRated", endpoint: "top-rated" },
      { key: "nowPlaying", endpoint: "now-playing" },
    ]);
  }, [fetchMultiple, searchQuery]);

  useEffect(() => {
    if (!selectedGenre || searchQuery) return;

    fetchGenreDiscover("genreDiscover", selectedGenre);
  }, [fetchGenreDiscover, searchQuery, selectedGenre]);

  useEffect(() => {
    if (!searchQuery) return;

    const fetchSearchMovies = async () => {
      try {
        setLoadingSearch(true);

        const { data } = await searchMoviesRequest(searchQuery);

        const normalized =
          data.movies?.map((m) => ({
            ...m,
            id: m.tmdb_id,
          })) || [];

        setSearchMovies(normalized);
      } catch (err) {
        console.error("Search error:", err);
        setSearchMovies([]);
      } finally {
        setLoadingSearch(false);
      }
    };

    fetchSearchMovies();
  }, [searchQuery]);

  const handleMovieClick = (id) => {
    navigate(`/movies/tmdb/${id}`);
    window.scrollTo(0, 0);
  };

  const isEmpty = useMemo(
    () =>
      sections.every(
        (s) => filterByGenre(movies[s.key], selectedGenre).length === 0,
      ),
    [sections, movies, selectedGenre, filterByGenre],
  );

  if (loadingInitial && !searchQuery) return <Loading />;

  if (searchQuery) {
    return (
      <div className="space-y-10 py-8 mt-10 bg-neutral-900 min-h-screen px-8">
        <h1 className="text-3xl font-bold text-white">
          Search results for "{searchQuery}"
        </h1>

        {loadingSearch ? (
          <Loading />
        ) : (
          <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {searchMovies.map((movie) => (
              <MovieCard
                key={movie.tmdb_id}
                movie={movie}
                onClick={() => handleMovieClick(movie.tmdb_id)}
              />
            ))}
          </div>
        )}

        {!loadingSearch && searchMovies.length === 0 && (
          <div className="text-center py-20 text-gray-400 text-xl">
            No movies found
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-14 py-8 mt-10 bg-neutral-900 min-h-screen">
      {genreName && (
        <div className="px-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            {genreName} Movies
          </h1>

          <button
            onClick={() => navigate("/movies")}
            className="text-gray-400 hover:text-yellow-400 transition text-sm"
          >
            ← Back to All Movies
          </button>
        </div>
      )}

      {genreName && movies.genreDiscover?.length > 0 && (
        <section className="px-8">
          <h2 className="text-white text-2xl font-bold mb-6">
            {genreName} Spotlight
          </h2>

          <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {movies.genreDiscover.map((movie) => (
              <MovieCard
                key={`genre-${movie.id}`}
                movie={movie}
                onClick={() => handleMovieClick(movie.id)}
              />
            ))}
          </div>
        </section>
      )}

      {sections.map((sec, index) => (
        <LazySection
          key={sec.key}
          fetchData={() => index > 2 && fetchCategory(sec.key, sec.endpoint)}
        >
          {filterByGenre(movies[sec.key], selectedGenre).length > 0 && (
            <section className="px-8">
              <h2 className="text-white text-2xl font-bold mb-6">
                {sec.title}
              </h2>

              <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {filterByGenre(movies[sec.key], selectedGenre).map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onClick={() => handleMovieClick(movie.id)}
                  />
                ))}
              </div>
            </section>
          )}
        </LazySection>
      ))}

      {isEmpty && !loadingInitial && (
        <div className="px-8 py-20 text-center">
          <p className="text-gray-400 text-xl mb-4">
            No {genreName || ""} movies found
          </p>

          <button
            onClick={() => navigate("/movies")}
            className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg"
          >
            View All Movies
          </button>
        </div>
      )}
    </div>
  );
};

export default Movies;
