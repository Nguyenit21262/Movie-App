import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import {
  Play,
  Star,
  CalendarIcon,
  ClockIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getTMDBBackdropUrl, getTMDBPosterUrl } from "../lib/tmdbConfig";
import timeFormat from "../lib/timeFormat";
import axios from "axios";

const HeroSection = () => {
  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContent);

  const [movies, setMovies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [imagesPreloaded, setImagesPreloaded] = useState(false);
  const autoPlayRef = useRef(null);
  const imagePreloadRef = useRef({});

  // Preload images function
  const preloadImage = (url) => {
    return new Promise((resolve, reject) => {
      if (imagePreloadRef.current[url]) {
        resolve();
        return;
      }
      const img = new Image();
      img.onload = () => {
        imagePreloadRef.current[url] = true;
        resolve();
      };
      img.onerror = reject;
      img.src = url;
    });
  };

  // Fetch featured movies with optimizations
  useEffect(() => {
    const fetchFeaturedMovies = async () => {
      try {
        setLoading(true);

        // Fetch popular movies (only first page for speed)
        const { data } = await axios.get(
          `${backendUrl}/api/movies/tmdb/top-rated`,
          {
            params: { page: 1 },
            // Add timeout to prevent hanging
            timeout: 5000,
          },
        );

        if (data.success && data.results && data.results.length > 0) {
          // Get first 5 movies but only fetch details for first 2 initially
          const featuredMovies = data.results.slice(0, 5);

          // Fetch details for first movie immediately (priority)
          const firstMovieDetails = await axios.get(
            `${backendUrl}/api/movies/tmdb/${featuredMovies[0].id}`,
            { timeout: 3000 },
          );

          const firstMovie = firstMovieDetails.data.success
            ? firstMovieDetails.data.movie
            : featuredMovies[0];

          // Set first movie immediately to show content fast
          setMovies([firstMovie]);
          setLoading(false);

          // Preload first movie's backdrop
          const firstBackdrop = firstMovie.backdrop_path
            ? getTMDBBackdropUrl(firstMovie.backdrop_path, "w1280") // Use smaller size for faster load
            : getTMDBPosterUrl(firstMovie.poster_path, "w500");

          preloadImage(firstBackdrop);

          // Fetch remaining movies in background (non-blocking)
          Promise.all(
            featuredMovies.slice(1).map(async (movie) => {
              try {
                const detailsResponse = await axios.get(
                  `${backendUrl}/api/movies/tmdb/${movie.id}`,
                  { timeout: 3000 },
                );
                return detailsResponse.data.success
                  ? detailsResponse.data.movie
                  : movie;
              } catch (error) {
                console.warn(`Using basic data for movie ${movie.id}`);
                return movie; // Use basic data if details fail
              }
            }),
          ).then((remainingMovies) => {
            const allMovies = [firstMovie, ...remainingMovies];
            setMovies(allMovies);

            // Preload next 2 images in background
            const imagesToPreload = allMovies.slice(1, 3).map((movie) => {
              return movie.backdrop_path
                ? getTMDBBackdropUrl(movie.backdrop_path, "w1280")
                : getTMDBPosterUrl(movie.poster_path, "w500");
            });

            Promise.all(imagesToPreload.map(preloadImage))
              .then(() => setImagesPreloaded(true))
              .catch((err) => console.warn("Image preload failed:", err));
          });
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching featured movies:", error);
        setLoading(false);
      }
    };

    if (backendUrl) {
      fetchFeaturedMovies();
    }
  }, [backendUrl]);

  // Lazy preload remaining images when carousel changes
  useEffect(() => {
    if (movies.length > 0 && currentIndex < movies.length) {
      // Preload next and previous images
      const nextIndex = (currentIndex + 1) % movies.length;
      const prevIndex = (currentIndex - 1 + movies.length) % movies.length;

      [nextIndex, prevIndex].forEach((index) => {
        const movie = movies[index];
        if (movie) {
          const imageUrl = movie.backdrop_path
            ? getTMDBBackdropUrl(movie.backdrop_path, "w1280")
            : getTMDBPosterUrl(movie.poster_path, "w500");
          preloadImage(imageUrl);
        }
      });
    }
  }, [currentIndex, movies]);

  // Auto-play carousel
  useEffect(() => {
    if (isAutoPlaying && movies.length > 1) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % movies.length);
      }, 5000);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, movies.length]);

  const handlePrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length);
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % movies.length);
  };

  const goToSlide = (index) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  };

  if (loading) {
    return (
      <div className="relative flex items-center justify-center h-screen bg-neutral-900">
        <div className="text-white text-xl">Loading featured movies...</div>
      </div>
    );
  }

  if (!movies || movies.length === 0) {
    return (
      <div className="relative flex items-center justify-center h-screen bg-neutral-900">
        <div className="text-white text-xl">No featured movies available</div>
      </div>
    );
  }

  const movie = movies[currentIndex];

  // Use smaller image size for faster loading
  const backdropUrl = movie.backdrop_path
    ? getTMDBBackdropUrl(movie.backdrop_path, "w1280") // Use w1280 instead of original
    : movie.poster_path
      ? getTMDBPosterUrl(movie.poster_path, "w500")
      : "";

  return (
    <div className="relative h-screen mb-6 overflow-hidden">
      {/* Background Image with Transition */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.5)), url(${backdropUrl})`,
        }}
      >
        {/* Content */}
        <div className="relative h-full flex flex-col items-start justify-center gap-4 px-6 md:px-16 lg:px-36">
          {/* Rating */}
          <div className="flex flex-wrap items-center gap-3 animate-fadeIn">
            {movie.vote_average > 0 && (
              <div className="group flex items-center gap-2 rounded-full bg-yellow-400/15 px-3 py-1.5 backdrop-blur-sm border border-yellow-400/25 shadow-sm">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 group-hover:scale-110 transition" />

                <span className="font-semibold text-sm md:text-base text-yellow-300 leading-none">
                  {(movie.vote_average / 2).toFixed(1)}
                </span>

                <span className="text-gray-400 text-xs md:text-sm font-medium">
                  /5
                </span>
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-[70px] md:leading-[1.1] font-bold text-white max-w-2xl cursor-pointer animate-fadeIn">
            {movie.title || movie.name || "Untitled"}
          </h1>

          {/* Tagline */}
          {movie.tagline && (
            <p className="text-xl text-gray-300 italic max-w-2xl animate-fadeIn">
              "{movie.tagline}"
            </p>
          )}

          {/* Movie Info */}
          <div className="flex flex-wrap items-center gap-4 text-gray-300 animate-fadeIn">
            {/* Genres */}
            {movie.genres && movie.genres.length > 0 && (
              <div className="flex items-center gap-1 bg-gray-800/50 px-3 py-1 rounded-full">
                <span className="text-sm">
                  {movie.genres
                    .map((genre) =>
                      typeof genre === "object" ? genre.name : genre,
                    )
                    .slice(0, 3)
                    .join(" | ")}
                </span>
              </div>
            )}

            {/* Release Date */}
            {movie.release_date && (
              <div className="flex items-center gap-1 bg-gray-800/50 px-3 py-1 rounded-full">
                <CalendarIcon className="w-4 h-4" />
                <span className="text-sm">
                  {new Date(movie.release_date).getFullYear()}
                </span>
              </div>
            )}

            {/* Runtime */}
            {movie.runtime && movie.runtime > 0 && (
              <div className="flex items-center gap-1 bg-gray-800/50 px-3 py-1 rounded-full">
                <ClockIcon className="w-4 h-4" />
                <span className="text-sm">{timeFormat(movie.runtime)}</span>
              </div>
            )}
          </div>

          {/* Overview */}
          {movie.overview && (
            <p className="max-w-2xl text-gray-300 text-lg line-clamp-3 animate-fadeIn">
              {movie.overview}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mt-4 animate-fadeIn">
            <button
              onClick={() => {
                navigate(`/movies/tmdb/${movie.id}`);
                window.scrollTo(0, 0);
              }}
              className="flex items-center gap-2 px-8 py-3 text-sm bg-yellow-500 hover:bg-yellow-600 transition rounded-full font-medium cursor-pointer text-black"
            >
              <Play className="w-5 h-5" fill="currentColor" />
              Watch Trailer
            </button>

            <button
              onClick={() => {
                navigate(`/movies/tmdb/${movie.id}`);
                window.scrollTo(0, 0);
              }}
              className="flex items-center gap-2 px-8 py-3 text-sm bg-transparent border-2 border-gray-600 hover:border-white hover:text-white transition rounded-full font-medium cursor-pointer text-gray-300"
            >
              View Details
            </button>
          </div>

          {/* Carousel Dots */}
          {movies.length > 1 && (
            <div className="flex items-center gap-2 mt-6">
              {movies.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? "bg-yellow-500 w-8"
                      : "bg-white/30 w-2 hover:bg-white/50"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Arrows - Only show if more than 1 movie */}
      {movies.length > 1 && (
        <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
          <button
            onClick={handlePrevious}
            className="pointer-events-auto bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition backdrop-blur-sm"
            aria-label="Previous movie"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={handleNext}
            className="pointer-events-auto bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition backdrop-blur-sm"
            aria-label="Next movie"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      )}
    </div>
  );
};

export default HeroSection;
