import React from "react";
import { StarIcon } from "lucide-react";
import { getTMDBPosterUrl, getPlaceholderImage } from "../lib/tmdb/tmdbConfig";

const MovieCard = ({ movie, onClick }) => {
  return (
    <div
      onClick={onClick} 
      className="relative mx-auto w-full max-w-[230px] cursor-pointer overflow-hidden rounded-sm shadow-lg transition hover:scale-[1.04] hover:shadow-2xl aspect-[2/3.2]"
    >
      {/* Rating */}
      {movie.vote_average > 0 && (
        <div className="absolute top-3 left-3 z-10 bg-black/70 text-white px-2 py-1 rounded-full flex items-center gap-1">
          <StarIcon className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          <span className="text-xs font-bold">
            {(movie.vote_average/2).toFixed(1)}
          </span>
        </div>
      )}

      {/* Poster */}
      <img
        src={
          movie.poster_path
            ? getTMDBPosterUrl(movie.poster_path)
            : getPlaceholderImage()
        }
        alt={movie.title || movie.name}
        className="w-full h-full object-cover"
        loading="lazy"
        onError={(e) => {
          e.target.src = getPlaceholderImage();
        }}
      />

      {/* Info */}
      <div className="absolute bottom-0 w-full bg-black/65 p-3">
        <h3 className="line-clamp-1 text-base font-semibold text-white">
          {movie.title || movie.name || "Untitled"}
        </h3>

        <div className="mt-1 text-xs text-neutral-300 flex justify-between">
          <span>
            {movie.release_date
              ? new Date(movie.release_date).getFullYear()
              : "N/A"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
