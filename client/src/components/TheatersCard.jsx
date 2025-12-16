import React from "react";
import { useNavigate } from "react-router-dom";
import { PlayCircle, Ticket, Clock, Calendar } from "lucide-react";
import timeFormat from "../lib/timeFormat";

const TheatersCard = ({ theater }) => {
  const navigate = useNavigate();

  return (
    <div className="w-[280px] flex flex-col gap-3 group">
      {/* Card */}
      <div className="relative h-80 rounded-xl overflow-hidden bg-neutral-900 shadow-xl transition-transform duration-300 group-hover:scale-105">
        {/* Poster */}
        <img
          src={theater.poster_path}
          alt={theater.title}
          onClick={() => {
            navigate(`/theaters/${theater._id}`);
            scrollTo(0, 0);
          }}
          className="
            w-full h-full object-cover cursor-pointer
            transition-all duration-500
            group-hover:scale-110
            group-hover:brightness-50
            group-hover:blur-[2px]
            
          "
        />

        {/* Hover Overlay */}
        <div
          className="
    absolute inset-0
    flex flex-col justify-center
    gap-3
    text-left
    px-4
    opacity-0 group-hover:opacity-100
    transition-opacity duration-300
    pointer-events-none
  "
        >

          {/* title */}
          <p className="text-lg text-white font-semibold">
            {theater.title}
          </p>

          {/* Genre */}
          <p className="text-sm text-white font-medium">
            {theater.genres?.map((g) => g.name).join(", ")}
          </p>

          {/* Release date */}
          <div className="flex items-center gap-2 text-sm text-neutral-300">
            <Calendar size={16} />
            <span>{theater.release_date}</span>
          </div>

          {/* Runtime */}
          <div className="flex items-center gap-2 text-sm text-neutral-300">
            <Clock size={16} />
            <span>{timeFormat(theater.runtime)}</span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => window.open(theater.videoUrl, "_blank")}
          className="
            flex-1 flex items-center justify-center gap-1
    rounded-sm hover:bg-orange-500
    text-white text-sm py-2
    transition
   underline 
          "
        >
          <PlayCircle size={16} />
          Trailer
        </button>

        <button
          onClick={() => navigate(`/theaters/${theater._id}`)}
          className="
            flex-1 flex items-center justify-center gap-1
            rounded-sm bg-yellow hover:bg-orange-500
            text-white text-sm py-2 transition
          "
        >
          <Ticket size={16} />
          Tickets
        </button>
      </div>
    </div>
  );
};

export default TheatersCard;
