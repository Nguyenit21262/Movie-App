import React, { useContext, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight,
  Heart,
  PlayCircleIcon,
  StarIcon,
  Tag,
  MessageCircle,
} from "lucide-react";

import { AppContent } from "../context/AppContext";
import { useMovieDetails } from "../hooks/useMovieDetails";
import { getTMDBPosterUrl, getTMDBBackdropUrl } from "../lib/tmdb/tmdbConfig";
import timeFormat from "../lib/timeFormat";
import MovieCard from "../components/MovieCard";
import TrailersSection from "../components/TrailersSection";
import MovieReview from "../components/MovieReview";
import Loading from "../components/Loading";

const MovieDetails = () => {
  const { backendUrl } = useContext(AppContent);
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    movie,
    credits,
    videos,
    recommendations,
    loading,
  } = useMovieDetails(backendUrl, id);

  const rating = useMemo(
    () => movie?.vote_average ? (movie.vote_average / 2).toFixed(1) : null,
    [movie]
  );

  const castList = useMemo(
    () => credits?.cast?.slice(0, 10) ?? [],
    [credits]
  );

  const recsList = useMemo(
    () => recommendations.slice(0, 5),
    [recommendations]
  );

  if (loading) return <Loading />;
  if (!movie) return null;

  return (
    <div className="bg-neutral-900 min-h-screen">
      {/* HERO */}
      <div className="relative">
        <img
          src={getTMDBBackdropUrl(movie.backdrop_path, "original")}
          alt={movie.title}
          className="w-full h-[600px] object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/50 to-transparent" />

        <div className="absolute bottom-0 px-16 pb-20 flex gap-10">
          <img
            src={getTMDBPosterUrl(movie.poster_path, "w500")}
            className="w-[280px] rounded-xl shadow-2xl"
          />

          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold text-white">{movie.title}</h1>

            <div className="flex items-center gap-4 text-gray-300 mt-4">
              {rating && (
                <span className="flex items-center gap-1">
                  <StarIcon className="text-yellow-400 fill-yellow-400" />
                  {rating}
                </span>
              )}
              {movie.runtime > 0 && <span>{timeFormat(movie.runtime)}</span>}
              {movie.release_date && (
                <span>{new Date(movie.release_date).getFullYear()}</span>
              )}
            </div>

            <div className="flex gap-2 mt-2 text-sm text-gray-300">
              <Tag size={14} />
              {movie.genres?.map((g) => g.name).join(", ")}
            </div>

            <p className="text-gray-300 mt-6 leading-7">
              {movie.overview}
            </p>

            <div className="flex gap-4 mt-6">
              <a
                href="#trailer"
                className="px-6 py-3 bg-yellow-500 rounded-lg font-semibold text-black flex items-center gap-2"
              >
                <PlayCircleIcon /> Watch Trailer
              </a>
              <button className="p-3 bg-gray-800 rounded-full">
                <Heart />
              </button>
              <a href="#comment" className="p-3 bg-gray-800 rounded-full">
                <MessageCircle />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* CAST */}
      {castList.length > 0 && (
        <div className="px-16 mt-16">
          <h2 className="text-white text-xl mb-6">Cast</h2>
          <div className="flex gap-6 overflow-x-auto scrollbar-none pb-2">
            {castList.map((c) => (
              <div key={c.id} className="min-w-[120px] text-center">
                <img
                  src={getTMDBPosterUrl(c.profile_path, "w185")}
                  className="w-20 h-20 rounded-full mx-auto"
                />
                <p className="text-white text-sm mt-2">{c.name}</p>
                <p className="text-gray-400 text-xs">{c.character}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <TrailersSection videos={videos} movieTitle={movie.title} />

      {/* RECOMMEND */}
      {recsList.length > 0 && (
        <div className="px-16 pb-20">
          <div className="flex justify-between mb-8">
            <h2 className="text-white text-xl">You May Also Like</h2>
            <button
              onClick={() => navigate("/movies")}
              className="flex items-center gap-2 text-gray-400 hover:text-white"
            >
              View All <ArrowRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-5 gap-x-10 gap-y-8">

            {recsList.map((m) => (
              <MovieCard
                key={m.id}
                movie={m}
                onClick={() => {
                  navigate(`/movies/tmdb/${m.id}`);
                  window.scrollTo(0, 0);
                }}
              />
            ))}
          </div>
        </div>
      )}

      <div id="comment">
        <MovieReview movieId={id} />
      </div>
    </div>
  );
};

export default MovieDetails;
