import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { StarIcon, PlayIcon, HeartIcon } from "lucide-react";
import timeFormat from "../lib/timeFormat";

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFavorite = (e) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const handleWatchNow = (e) => {
    e.stopPropagation();
    navigate(`/movies/${movie._id}`);
    scrollTo(0, 0);
  };

  return (
    <div
      className="relative flex flex-col bg-gray-900 rounded-sm overflow-hidden hover:-translate-y-2 transition-all duration-300 shadow-lg hover:shadow-xl group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Rating badge */}
      <div className="absolute top-3 left-3 z-10 bg-gray-900/80 backdrop-blur-sm text-white px-2 py-1 rounded-full flex items-center gap-1">
        <StarIcon className="w-3 h-3 text-yellow-400 fill-yellow-400" />
        <span className="text-xs font-bold">
          {movie.vote_average.toFixed(1)}
        </span>
      </div>

      {/* Hình ảnh phim và thông tin */}
      <div className="relative overflow-hidden h-70">
        <img
          onClick={() => {
            navigate(`/movies/${movie._id}`);
            scrollTo(0, 0);
          }}
          src={movie.backdrop_path}
          alt={movie.title}
          className="w-full h-full object-cover cursor-pointer transition-transform duration-500 group-hover:scale-105"
        />

        {/* Thông tin phim  */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-black/90 via-black/50 to-transparent backdrop-blur-md">
          <h3
            onClick={() => {
              navigate(`/movies/${movie._id}`);
              scrollTo(0, 0);
            }}
            className="font-semibold text-sm truncate text-white cursor-pointer hover:text-yellow"
          >
            {movie.title}
          </h3>
          <div className="flex items-center gap-3 text-xs text-gray-300 mt-1">
            <span>{new Date(movie.release_date).getFullYear()}</span>
            <span className="flex items-center gap-1">
              <span>|</span>
              <span>{timeFormat(movie.runtime)}</span>
            </span>
          </div>
        </div>

        {/* Overlay khi hover (các nút) */}
        {/* <div
          className={`absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300 flex items-end justify-center pb-16 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="flex gap-3">
            <button
              onClick={handleWatchNow}
              className="flex items-center gap-2 px-3 py-0 mb-5 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-200 transition-colors transform hover:scale-105"
            >
              <PlayIcon className="w-4 h-4" />
              <span className="text-sm">Watch</span>
            </button>
            <button
              onClick={toggleFavorite}
              className="p-3 bg-white/20 backdrop-blur-sm mb-5 rounded-full hover:bg-white/30 transition-colors transform hover:scale-105"
            >
              <HeartIcon
                className={`w-5 h-5 transition-colors ${
                  isFavorite ? "text-red-500 fill-red-500" : "text-white"
                }`}
              />
            </button>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default MovieCard;
