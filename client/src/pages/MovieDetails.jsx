import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  ArrowRight,
  Heart,
  PlayCircleIcon,
  StarIcon,
  Tag,
  MessageCircle,
} from "lucide-react";

import timeFormat from "../lib/timeFormat";
import MovieCard from "../components/MovieCard";
import Loading from "../components/Loading";
import TrailersSection from "../components/TrailersSection";
import MovieReview from "../components/MovieReview";
import { getTMDBPosterUrl, getTMDBBackdropUrl } from "../lib/tmdbConfig";
import { AppContent } from "../context/AppContext"; // Fixed: AppContext not AppContent

const MovieDetails = () => {
  const { backendUrl } = useContext(AppContent);
  const { id } = useParams(); // TMDB ID
  const navigate = useNavigate();
  
  const [movie, setMovie] = useState(null);
  const [credits, setCredits] = useState(null);
  const [videos, setVideos] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMovieDetails = async () => {
    try {
      setLoading(true);
      
      const res = await axios.get(`${backendUrl}/api/movies/tmdb/${id}`);

      console.log("Movie Details Response:", res.data);

      if (res.data.success) {
        setMovie(res.data.movie);
        setCredits(res.data.credits);
        setVideos(res.data.videos || []);
        setRecommendations(res.data.recommendations || []);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Fetch movie detail error:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && backendUrl) {
      fetchMovieDetails();
      window.scrollTo(0, 0);
    }
  }, [id, backendUrl]);

  if (loading || !movie) return <Loading />;

  return (
    <div className="bg-black min-h-screen">
      {/* ===== HERO SECTION ===== */}
      <div className="relative">
        <div className="absolute inset-0 z-0">
          <img
            src={getTMDBBackdropUrl(movie.backdrop_path, "original")}
            alt={movie.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = getTMDBPosterUrl(movie.poster_path, "original");
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/60 to-black" />
          <div className="absolute inset-0 bg-black/30" />
        </div>

        <div className="relative z-10 px-8 md:px-16 lg:px-36 pt-28 lg:pt-44 pb-20">
          <div className="flex flex-col md:flex-row gap-10 max-w-6xl mx-auto">
            {/* Poster */}
            <img
              src={getTMDBPosterUrl(movie.poster_path, "w500")}
              alt={movie.title}
              className="rounded-lg h-[440px] w-[300px] object-cover shadow-2xl mx-auto md:mx-0"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/300x440/1a1a1a/ffffff?text=No+Image";
              }}
            />

            {/* Info */}
            <div className="flex flex-col gap-4">
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                {movie.title}
              </h1>

              {movie.tagline && (
                <p className="text-xl text-gray-300 italic">"{movie.tagline}"</p>
              )}

              <div className="flex items-center gap-3 text-gray-300">
                <div className="flex items-center gap-1">
                  <StarIcon className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="font-semibold">
                    {(movie.vote_average/2).toFixed(1)}
                  </span>
                </div>
                <span>•</span>
                {movie.runtime > 0 && (
                  <>
                    <span>{timeFormat(movie.runtime)}</span>
                    <span>•</span>
                  </>
                )}
                {movie.release_date && (
                  <span>{new Date(movie.release_date).getFullYear()}</span>
                )}
              </div>

              {movie.genres && movie.genres.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Tag className="w-4 h-4" />
                  <span>
                    {movie.genres.map((g) => g.name || g).join(", ")}
                  </span>
                </div>
              )}

              <p className="text-gray-300 mt-4 leading-7 max-w-2xl">
                {movie.overview}
              </p>

              <div className="flex gap-4 mt-6">
                <a
                  href="#trailer"
                  className="flex items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 rounded-lg font-semibold text-black transition"
                >
                  <PlayCircleIcon className="w-5 h-5" />
                  Watch Trailer
                </a>

                <button className="p-3 bg-gray-800 hover:bg-gray-700 rounded-full transition">
                  <Heart className="text-white" />
                </button>

                <a 
                  href="#comment" 
                  className="p-3 bg-gray-800 hover:bg-gray-700 rounded-full transition"
                >
                  <MessageCircle className="text-white" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== CAST ===== */}
      {credits && credits.cast && credits.cast.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 mt-24">
          <p className="text-lg font-semibold mb-6 text-white">Cast</p>
          <div className="flex gap-5 overflow-x-auto pb-6 scrollbar-none">
            {credits.cast.slice(0, 10).map((cast, index) => (
              <div key={cast.id || index} className="text-center min-w-[120px]">
                <img
                  src={
                    cast.profile_path
                      ? getTMDBPosterUrl(cast.profile_path, "w185")
                      : "https://via.placeholder.com/80x80/1a1a1a/ffffff?text=No+Image"
                  }
                  alt={cast.name}
                  className="rounded-full h-20 w-20 object-cover mx-auto"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/80x80/1a1a1a/ffffff?text=No+Image";
                  }}
                />
                <p className="text-xs mt-2 text-white font-medium">{cast.name}</p>
                <p className="text-xs text-gray-400">{cast.character}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== TRAILERS ===== */}
      <TrailersSection videos={videos} movieTitle={movie.title} />

      {/* ===== RECOMMENDATIONS ===== */}
      {recommendations && recommendations.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 mt-20 mb-16">
          <div className="flex justify-between items-center mb-8">
            <p className="text-lg text-white font-semibold">You May Also Like</p>
            <button
              onClick={() => navigate("/movies")}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition"
            >
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {recommendations.slice(0, 5).map((m) => (
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

      {/* ===== REVIEWS ===== */}
      <MovieReview movieId={id} />
    </div>
  );
};

export default MovieDetails;