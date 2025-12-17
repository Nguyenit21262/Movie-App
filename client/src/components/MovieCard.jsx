import React from "react";
import { StarIcon } from "lucide-react";
import timeFormat from "../lib/timeFormat";

const MovieCard = ({ movie, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="
        w-[230px]
        aspect-[2/3.2]
        rounded-sm
        overflow-hidden
        relative
        cursor-pointer
        transition
        hover:scale-[1.04]
        shadow-lg hover:shadow-2xl
      "
    >
      {/* Rating */}
      <div className="absolute top-3 left-3 z-10 bg-black/70 backdrop-blur text-white px-2 py-1 rounded-full flex items-center gap-1">
        <StarIcon className="w-3 h-3 text-yellow-400 fill-yellow-400" />
        <span className="text-xs font-bold">
          {movie.vote_average?.toFixed(1)}
        </span>
      </div>

      {/* Poster */}
      <img
        src={movie.backdrop_path}
        alt={movie.title}
        className="w-full h-full object-cover"
      />

      {/* Info */}
      <div className="absolute bottom-0 w-full bg-black/65 backdrop-blur p-3">
        <h3 className="line-clamp-1 text-base font-semibold text-white">
          {movie.title}
        </h3>

        <div className="mt-1 text-xs text-neutral-300 flex justify-between">
          <span>{movie.release_date}</span>
          <span>{timeFormat(movie.runtime)}</span>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
