import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight,
  Heart,
  PlayCircleIcon,
  StarIcon,
  Tag,
  MessageCircle,
} from "lucide-react";
import { toast } from "react-toastify";

import { AppContent } from "../context/AppContent";
import { useMovieDetails } from "../hooks";
import { getTMDBPosterUrl, getTMDBBackdropUrl } from "../lib/tmdb/tmdbConfig";
import timeFormat from "../lib/timeFormat";
import MovieCard from "../components/MovieCard";
import TrailersSection from "../components/TrailersSection";
import MovieReview from "../components/MovieReview";
import Loading from "../components/Loading";
import RatingModal from "../components/RatingModal";
import { getMyMovieRating, submitMovieRating } from "../api/ratingApi";

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useContext(AppContent);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [userRating, setUserRating] = useState(null);
  const [submittingRating, setSubmittingRating] = useState(false);

  const {
    movie,
    credits,
    videos,
    recommendations,
    loading,
  } = useMovieDetails(id);

  const [movieStats, setMovieStats] = useState(null);

  useEffect(() => {
    if (movie) {
      setMovieStats({
        vote_average: movie.vote_average,
        count_rating: movie.count_rating,
      });
    }
  }, [movie]);

  useEffect(() => {
    if (!isLoggedIn || !id) {
      setUserRating(null);
      return;
    }

    const fetchUserRating = async () => {
      try {
        const { data } = await getMyMovieRating(id);
        if (data.success) {
          setUserRating(data.userRating);
          if (data.movieRating) {
            setMovieStats(data.movieRating);
          }
        }
      } catch (error) {
        console.error("Failed to load user rating:", error);
      }
    };

    fetchUserRating();
  }, [id, isLoggedIn]);

  const rating = useMemo(
    () =>
      movieStats?.vote_average
        ? (movieStats.vote_average / 2).toFixed(1)
        : null,
    [movieStats]
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

  const handleOpenRatingModal = () => {
    if (!isLoggedIn) {
      toast.info("Please login to rate this movie");
      navigate("/login");
      return;
    }

    setRatingModalOpen(true);
  };

  const handleSubmitRating = async (selectedRating) => {
    try {
      setSubmittingRating(true);

      const { data } = await submitMovieRating(id, selectedRating);

      if (data.success) {
        setUserRating(data.userRating);
        setMovieStats(data.movieRating);
        setRatingModalOpen(false);
        toast.success(data.message || "Rating saved successfully");

        if (data.mlUpdate?.message) {
          toast.info(data.mlUpdate.message, { autoClose: 2500 });
        }
      } else {
        toast.error(data.message || "Failed to save rating");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save rating");
    } finally {
      setSubmittingRating(false);
    }
  };

  return (
    <div className="bg-neutral-900 min-h-screen">
      {/* HERO */}
      <div className="relative">
        <img
          src={getTMDBBackdropUrl(movie.backdrop_path, "original")}
          alt={movie.title}
          className="h-[320px] w-full object-cover sm:h-[420px] lg:h-[600px]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/50 to-transparent" />

        <div className="relative px-4 pb-8 sm:px-6 sm:pb-12 lg:absolute lg:bottom-0 lg:px-16 lg:pb-20">
          <div className="-mt-20 flex flex-col gap-6 sm:-mt-24 sm:flex-row sm:items-start lg:mt-0 lg:gap-10 lg:items-end">
          <img
            src={getTMDBPosterUrl(movie.poster_path, "w500")}
            className="w-40 rounded-xl shadow-2xl sm:w-52 lg:w-[280px]"
          />

            <div className="max-w-2xl">
              <h1 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">{movie.title}</h1>

              <div className="mt-4 flex flex-wrap items-center gap-3 sm:gap-4 text-gray-300">
              {rating && (
                <span className="flex items-center gap-1">
                  <StarIcon className="text-yellow-400 fill-yellow-400" />
                  {rating}
                </span>
              )}
              {movieStats?.count_rating > 0 && (
                <span>{movieStats.count_rating} ratings</span>
              )}
              {movie.runtime > 0 && <span>{timeFormat(movie.runtime)}</span>}
              {movie.release_date && (
                <span>{new Date(movie.release_date).getFullYear()}</span>
              )}
              </div>

              <div className="mt-2 flex gap-2 text-sm text-gray-300">
                <Tag size={14} className="mt-0.5 shrink-0" />
                <span>{movie.genres?.map((g) => g.name).join(", ")}</span>
              </div>

              <p className="mt-6 leading-7 text-gray-300">
                {movie.overview}
              </p>

              <div className="mt-6 flex flex-wrap gap-3 sm:gap-4">
                <a
                  href="#trailer"
                  className="flex items-center gap-2 rounded-lg bg-yellow-500 px-6 py-3 font-semibold text-black"
                >
                  <PlayCircleIcon /> Watch Trailer
                </a>
                <button
                  onClick={handleOpenRatingModal}
                  className="flex items-center gap-2 rounded-lg bg-gray-800 px-6 py-3 font-semibold text-white transition hover:bg-gray-700"
                >
                  <StarIcon className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  {userRating ? `Your Rating: ${userRating}/5` : "Rate Movie"}
                </button>
                <button className="rounded-full bg-gray-800 p-3">
                  <Heart />
                </button>
                <a href="#comment" className="rounded-full bg-gray-800 p-3">
                  <MessageCircle />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CAST */}
      {castList.length > 0 && (
        <div className="mt-16 px-4 sm:px-6 lg:px-16">
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
        <div className="px-4 pb-20 sm:px-6 lg:px-16">
          <div className="flex justify-between mb-8">
            <h2 className="text-white text-xl">You May Also Like</h2>
            <button
              onClick={() => navigate("/movies")}
              className="flex items-center gap-2 text-gray-400 hover:text-white"
            >
              View All <ArrowRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-10 lg:gap-y-8">

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

      <RatingModal
        isOpen={ratingModalOpen}
        onClose={() => setRatingModalOpen(false)}
        onSubmit={handleSubmitRating}
        initialRating={userRating || 0}
        submitting={submittingRating}
      />
    </div>
  );
};

export default MovieDetails;
