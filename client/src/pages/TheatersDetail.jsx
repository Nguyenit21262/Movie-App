import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useParams, Outlet, useLocation } from "react-router-dom";
import {
  ArrowRight,
  PlayCircleIcon,
  Clock,
  Calendar,
  Tag,
} from "lucide-react";

import { getTMDBPosterUrl, getTMDBBackdropUrl } from "../lib/tmdb/tmdbConfig";
import timeFormat from "../lib/timeFormat";
import DataSelect from "../components/DataSelect";
import TheatersCard from "../components/TheatersCard";
import Loading from "../components/Loading";
import { getMovieDetails } from "../api/movieApi";
import { getShowMovieById } from "../api/showApi";

const TheatersDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isTmdbRoute = location.pathname.includes("/theaters/tmdb/");
  const hash = location.hash;

  const [data, setData] = useState({
    movie: null,
    videos: [],
    recommendations: [],
  });

  const [dateTime, setDateTime] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchTmdbMovie = useCallback(async (controller) => {
    const response = await getMovieDetails(id, { signal: controller.signal });

    const res = response.data;

    if (res?.success) {
      setData({
        movie: res.movie,
        videos: res.videos || [],
        recommendations: res.recommendations || [],
      });

      setDateTime({});
    }
  }, [id]);

  const fetchLocalMovie = useCallback(async (controller) => {
    const [showResponse] = await Promise.all([
      getShowMovieById(id, { signal: controller.signal }),
    ]);

    const res = showResponse.data;

    if (res?.success) {
      const normalizedGenres =
        res.movie.genres?.map((genre) =>
          typeof genre === "string" ? { name: genre } : genre,
        ) || [];

      let tmdbExtras = {
        videos: [],
        recommendations: [],
      };

      if (res.movie.tmdb_id) {
        try {
          const tmdbResponse = await getMovieDetails(res.movie.tmdb_id, {
            signal: controller.signal,
          });

          if (tmdbResponse.data?.success) {
            tmdbExtras = {
              videos: tmdbResponse.data.videos || [],
              recommendations: tmdbResponse.data.recommendations || [],
            };
          }
        } catch (error) {
          if (error?.name !== "CanceledError") {
            console.error("Failed to fetch TMDB trailer data:", error);
          }
        }
      }

      setData({
        movie: {
          ...res.movie,
          genres: normalizedGenres,
        },
        videos: tmdbExtras.videos,
        recommendations: tmdbExtras.recommendations,
      });

      setDateTime(res.dateTime || {});
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();

    const fetchMovieData = async () => {
      try {
        setLoading(true);

        if (isTmdbRoute) {
          await fetchTmdbMovie(controller);
        } else {
          await fetchLocalMovie(controller);
        }
      } catch (error) {
        if (error?.name !== "CanceledError") {
          console.error("Failed to fetch movie detail:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMovieData();

    return () => {
      controller.abort();
    };
  }, [fetchLocalMovie, fetchTmdbMovie, id, isTmdbRoute]);

  useEffect(() => {
    if (loading || !data.movie) return;

    if (hash) {
      const targetElement = document.getElementById(hash.replace("#", ""));
      targetElement?.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [hash, loading, data.movie, id]);

  const movie = data.movie;

  const trailerVideo = useMemo(() => {
    if (!data.videos.length) return null;

    const youtubeTrailer = data.videos.find(
      (video) => video.type === "Trailer" && video.site === "YouTube",
    );

    const youtubeTeaser = data.videos.find(
      (video) => video.type === "Teaser" && video.site === "YouTube",
    );

    const firstYoutubeVideo = data.videos.find(
      (video) => video.site === "YouTube" && video.key,
    );

    return youtubeTrailer || youtubeTeaser || firstYoutubeVideo || null;
  }, [data.videos]);

  const displayedRecs = useMemo(() => {
    return data.recommendations.slice(0, 4);
  }, [data.recommendations]);

  const hasShowtime = Object.keys(dateTime).length > 0;
  const hasRecommendations = displayedRecs.length > 0;

  if (loading) {
    return <Loading />;
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center text-white">
        Movie not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <div className="relative w-full h-[600px] md:h-[700px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={getTMDBBackdropUrl(movie.backdrop_path, "w1280")}
            alt=""
            className="w-full h-full object-cover opacity-40 scale-105 blur-[2px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/60 to-transparent" />
        </div>

        <div className="relative h-full flex items-end px-6 md:px-16 lg:px-40 pb-16">
          <div className="flex flex-col md:flex-row gap-10 max-w-7xl mx-auto w-full items-center md:items-end">
            <div className="shrink-0 group relative">
              <img
                src={getTMDBPosterUrl(movie.poster_path, "w500")}
                alt={movie.title}
                className="rounded-2xl h-[400px] md:h-[480px] w-auto object-cover shadow-2xl border border-white/10 transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </div>

            <div className="flex flex-col gap-4 flex-1">
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold tracking-widest uppercase">
                  {movie.original_language}
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight drop-shadow-lg">
                {movie.title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-gray-300 text-sm md:text-base font-medium">
                {movie.runtime > 0 && (
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-yellow-500" />
                    {timeFormat(movie.runtime)}
                  </span>
                )}

                {movie.release_date && (
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-yellow-500" />
                    {new Date(movie.release_date).getFullYear()}
                  </span>
                )}

                {movie.genres?.length > 0 && (
                  <span className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-yellow-500" />
                    {movie.genres
                      .map((genre) => genre.name ?? genre)
                      .join(", ")}
                  </span>
                )}
              </div>

              <p className="text-gray-400 max-w-3xl line-clamp-4 md:line-clamp-none text-base md:text-lg leading-relaxed">
                {movie.overview}
              </p>

              <div className="flex items-center gap-4 mt-6">
                {trailerVideo && (
                  <button
                    onClick={() => navigate("trailer")}
                    className="flex items-center gap-3 px-8 py-4 bg-yellow-500 hover:bg-yellow-600 text-black rounded-2xl font-bold transition-all active:scale-95 shadow-lg shadow-yellow-500/20"
                  >
                    <PlayCircleIcon className="w-6 h-6" />
                    Watch Trailer
                  </button>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="booking" className="px-6 md:px-16 lg:px-40 py-16 bg-neutral-900">
        <div className="max-w-7xl mx-auto border-t border-white/5 pt-16">
          <h2 className="text-3xl font-bold mb-8">Select Showtimes</h2>

          {hasShowtime ? (
            <DataSelect dateTime={dateTime} id={id} />
          ) : (
            <p className="text-gray-500 italic">
              {isTmdbRoute
                ? "This movie is not yet scheduled."
                : "No upcoming shows available."}
            </p>
          )}
        </div>
      </div>

      {hasRecommendations && (
        <div className="max-w-7xl mx-auto px-6 md:px-16 lg:px-40 pb-32">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-2xl font-bold">You May Also Like</h3>

            <button
              onClick={() => {
                navigate("/theaters");
                window.scrollTo(0, 0);
              }}
              className="group flex items-center gap-2 text-gray-400 hover:text-yellow-500 transition-colors font-medium"
            >
              View All
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {displayedRecs.map((item) => (
              <TheatersCard
                key={item.id}
                movie={item}
                onClick={() => navigate(`/theaters/tmdb/${item.id}`)}
              />
            ))}
          </div>
        </div>
      )}

      <Outlet
        context={{
          showData: {
            ...movie,
            videoUrl: trailerVideo
              ? `https://www.youtube.com/embed/${trailerVideo.key}`
              : null,
          },
        }}
      />
    </div>
  );
};

export default TheatersDetail;
