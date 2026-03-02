import { useContext, useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import { TMDB_GENRES, getGenreId } from "../lib/tmdb/Genres";

// Components
import MovieCard from "../components/MovieCard";
import Loading from "../components/Loading";
import LazySection from "../components/LazySection";
import axios from "axios";

const Movies = () => {
  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContent);
  const [searchParams] = useSearchParams();

  const [movies, setMovies] = useState({
    topRated: [],
    nowPlaying: [],
    popular: [],
    upcoming: [],
  });

  const [selectedGenre, setSelectedGenre] = useState(null);
  const [loadingInitial, setLoadingInitial] = useState(true);

  useEffect(() => {
    const genreParam = searchParams.get("genre");
    setSelectedGenre(genreParam ? getGenreId(genreParam) : null);
  }, [searchParams]);

  // Hàm fetch đơn lẻ cho từng category
  const fetchCategory = useCallback(
    async (category, endpoint) => {
      // Nếu đã có data và không có filter genre mới thì không fetch lại
      if (movies[category].length > 0 && !selectedGenre) return;

      try {
        const res = await axios.get(
          `${backendUrl}/api/movies/tmdb/${endpoint}`,
          {
            params: { page: 1 },
          },
        );
        const results = res.data.results || [];

        setMovies((prev) => ({ ...prev, [category]: results }));
      } catch (err) {
        console.error(`Error fetching ${category}:`, err);
      } finally {
        if (category === "topRated") setLoadingInitial(false);
      }
    },
    [backendUrl, selectedGenre, movies],
  );

  // Khởi tạo: Chỉ fetch "Top Rated" trước để hiện nội dung ngay
  useEffect(() => {
    if (backendUrl) {
      fetchCategory("topRated", "top-rated");
    }
  }, [backendUrl, fetchCategory]);

  const handleMovieClick = useCallback(
    (id) => {
      navigate(`/movies/tmdb/${id}`);
      window.scrollTo(0, 0);
    },
    [navigate],
  );

  // Lọc phim theo Genre 
  const filterByGenre = (movieList) => {
    if (!selectedGenre) return movieList;
    return movieList.filter((m) => m.genre_ids?.includes(selectedGenre));
  };

  if (loadingInitial) return <Loading />;

  const genreName = selectedGenre ? TMDB_GENRES[selectedGenre] : null;


  const sections = [
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
  ];

  const isEmpty = sections.every(
    (s) => filterByGenre(movies[s.key]).length === 0,
  );

  return (
    <div className="space-y-14 py-8 mt-10 bg-neutral-900 min-h-screen">
      {/* Header */}
      {genreName && (
        <div className="px-8 animate-in fade-in duration-500">
          <h1 className="text-4xl font-bold text-white mb-2">
            {genreName} Movies
          </h1>
          <button
            onClick={() => navigate("/movies")}
            className="text-gray-400 hover:text-yellow-400 transition text-sm flex items-center gap-2"
          >
            <span>←</span> Back to All Movies
          </button>
        </div>
      )}

      {/* Render Sections */}
      {sections.map((sec, index) => (
        <LazySection
          key={sec.key}
          fetchData={() =>
            index === 0 ? null : fetchCategory(sec.key, sec.endpoint)
          }
        >
          {filterByGenre(movies[sec.key]).length > 0 && (
            <section className="px-8 animate-in slide-in-from-bottom-4 duration-700">
              <h2 className="text-white text-2xl font-bold mb-6">
                {sec.title}
              </h2>
              <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {filterByGenre(movies[sec.key]).map((movie) => (
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

      {/* No Results */}
      {isEmpty && !loadingInitial && (
        <div className="px-8 py-20 text-center">
          <p className="text-gray-400 text-xl mb-4">
            No {genreName || ""} movies found
          </p>
          <button
            onClick={() => navigate("/movies")}
            className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg transition active:scale-95"
          >
            View All Movies
          </button>
        </div>
      )}
    </div>
  );
};

export default Movies;
