import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Play,
  Star,
  CalendarIcon,
  ClockIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Loading from "./Loading";
import { getTMDBBackdropUrl, getTMDBPosterUrl } from "../lib/tmdb/tmdbConfig";
import timeFormat from "../lib/timeFormat";
import { fetchUpcomingMovies } from "../api/movieApi";

const SLIDE_INTERVAL = 5000;
const FEATURED_LIMIT = 5;

// Di chuyển ra ngoài để tránh khởi tạo lại
const imageCache = new Set();
const preloadImage = (url) => {
  if (!url || imageCache.has(url)) return;
  const img = new Image();
  img.src = url;
  imageCache.add(url);
};

const HeroSection = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const autoPlayRef = useRef(null);

  /* -------------------- Fetch Movies -------------------- */
  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    const fetchMovies = async () => {
      try {
        setLoading(true);
        const res = await fetchUpcomingMovies(1, { signal: controller.signal });

        const results = res.data?.results || [];
        if (!results.length) {
          if (isMounted) setLoading(false);
          return;
        }

        const featured = results.slice(0, FEATURED_LIMIT);

        // Render movie đầu tiên ngay lập tức
        if (isMounted) {
          setMovies([featured[0]]);
          setLoading(false);
          preloadImage(getTMDBBackdropUrl(featured[0].backdrop_path, "w1280"));
        }

        // Load các phim còn lại khi trình duyệt rảnh
        window.requestIdleCallback(() => {
          if (isMounted) {
            setMovies(featured);
            featured.slice(1, 3).forEach((m) =>
              preloadImage(getTMDBBackdropUrl(m.backdrop_path, "w1280"))
            );
          }
        });
      } catch (err) {
        if (err?.name === "CanceledError") return;
        console.error("HeroSection fetch error:", err);
        if (isMounted) setLoading(false);
      }
    };

    fetchMovies();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  /* -------------------- Handlers (Dùng useCallback) -------------------- */
  const nextSlide = useCallback(() => {
    setMovies((prevMovies) => {
      if (prevMovies.length === 0) return prevMovies;
      setCurrentIndex((i) => (i + 1) % prevMovies.length);
      return prevMovies;
    });
  }, []);

  const prevSlide = useCallback(() => {
    setMovies((prevMovies) => {
      if (prevMovies.length === 0) return prevMovies;
      setCurrentIndex((i) => (i - 1 + prevMovies.length) % prevMovies.length);
      return prevMovies;
    });
  }, []);

  /* -------------------- Autoplay & Preload Next -------------------- */
  useEffect(() => {
    if (movies.length <= 1) return;

    autoPlayRef.current = setInterval(nextSlide, SLIDE_INTERVAL);

    // Preload ảnh của slide tiếp theo
    const nextIdx = (currentIndex + 1) % movies.length;
    const nextMovie = movies[nextIdx];
    if (nextMovie?.backdrop_path) {
      preloadImage(getTMDBBackdropUrl(nextMovie.backdrop_path, "w1280"));
    }

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [movies, currentIndex, nextSlide]);

  /* -------------------- UI -------------------- */
  if (loading) return <Loading />;
  if (!movies.length) return null;

  const movie = movies[currentIndex];
  // Fallback url được memoize nhẹ nhàng bằng cách tính toán trực tiếp tại đây
  const backdropUrl = movie.backdrop_path
    ? getTMDBBackdropUrl(movie.backdrop_path, "w1280")
    : getTMDBPosterUrl(movie.poster_path, "w500");

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Background - Thêm will-change-contents để tối ưu performance animation */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 will-change-contents"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(0,0,0,.85), rgba(0,0,0,.4)), url(${backdropUrl})`,
        }}
      />

      <div className="relative h-full flex flex-col justify-center gap-4 px-6 md:px-16 lg:px-36">
        {movie.vote_average > 0 && (
          <div className="flex items-center gap-2 bg-yellow-400/15 px-3 py-1 rounded-full w-fit">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-yellow-300 font-semibold">
              {(movie.vote_average / 2).toFixed(1)}/5
            </span>
          </div>
        )}

        <h1 className="text-5xl md:text-[70px] font-bold text-white max-w-2xl leading-tight">
          {movie.title}
        </h1>

        <div className="flex flex-wrap gap-3 text-gray-300">
          {movie.release_date && (
            <div className="flex items-center gap-1">
              <CalendarIcon size={16} />
              {new Date(movie.release_date).getFullYear()}
            </div>
          )}
          {movie.runtime && (
            <div className="flex items-center gap-1">
              <ClockIcon size={16} />
              {timeFormat(movie.runtime)}
            </div>
          )}
        </div>

        <p className="max-w-2xl text-gray-300 line-clamp-3">
          {movie.overview}
        </p>

        <div className="flex gap-4 mt-4">
          <button
            onClick={() => navigate(`/movies/tmdb/${movie.id}`)}
            className="flex items-center gap-2 px-8 py-3 bg-yellow-500 hover:bg-yellow-600 rounded-full text-black font-medium transition-colors"
          >
            <Play size={18} fill="currentColor" />
            Watch Trailer
          </button>

          <button
            onClick={() => navigate(`/movies/tmdb/${movie.id}`)}
            className="px-8 py-3 border border-gray-500 rounded-full text-gray-300 hover:border-white transition-colors"
          >
            Details
          </button>
        </div>
      </div>

      {movies.length > 1 && (
        <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
          <button 
            onClick={prevSlide} 
            className="bg-black/50 p-3 rounded-full hover:bg-black/70 transition-colors pointer-events-auto"
            aria-label="Previous slide"
          >
            <ChevronLeft className="text-white" />
          </button>
          <button 
            onClick={nextSlide} 
            className="bg-black/50 p-3 rounded-full hover:bg-black/70 transition-colors pointer-events-auto"
            aria-label="Next slide"
          >
            <ChevronRight className="text-white" />
          </button>
        </div>
      )}
    </div>
  );
};

export default HeroSection;
