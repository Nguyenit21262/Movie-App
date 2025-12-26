import React from "react";
import { useNavigate } from "react-router-dom";
import { PlayCircle, Ticket, Clock, Calendar } from "lucide-react";
import timeFormat from "../lib/timeFormat";

const TheatersCard = ({ theater, onClick }) => {
  const navigate = useNavigate();

  const handleTrailerClick = (e) => {
    e.stopPropagation(); // Ngăn sự kiện onClick của thẻ cha
    navigate(`/theaters/${theater._id}/trailer`);
  };

  const handleTicketsClick = (e) => {
    e.stopPropagation(); // Ngăn sự kiện onClick của thẻ cha
    navigate(`/theaters/${theater._id}#booking-section`);
  };

  return (
    <div onClick={onClick} className="w-[280px] flex flex-col gap-3 group cursor-pointer">
      <div className="relative h-80 rounded-sm overflow-hidden bg-neutral-900 shadow-xl transition-transform duration-300 group-hover:scale-105">
        <img
          src={theater.poster_path}
          alt={theater.title}
          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-50 group-hover:blur-[2px]"
        />

        <div className="absolute inset-0 flex flex-col justify-center gap-3 px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none text-left">
          <p className="text-lg text-white font-semibold line-clamp-2">{theater.title}</p>
          <p className="text-sm text-white font-medium line-clamp-1">
            {theater.genres?.map((g) => g.name).join(", ")}
          </p>
          <div className="flex items-center gap-2 text-sm text-neutral-300">
            <Calendar size={16} />
            <span>{theater.release_date?.split("-")[0]}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-300">
            <Clock size={16} />
            <span>{timeFormat(theater.runtime)}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleTrailerClick}
          className="flex-1 flex items-center justify-center gap-1 rounded-sm border border-white/10 hover:bg-white/10 text-white text-sm py-2 transition underline decoration-gray-500 underline-offset-4"
        >
          <PlayCircle size={16} />
          Trailer
        </button>

        <button
          onClick={handleTicketsClick}
          className="flex-1 flex items-center justify-center gap-1 rounded-sm bg-yellow-600 hover:bg-yellow-500 text-white text-sm py-2 transition font-medium"
        >
          <Ticket size={16} />
          Tickets
        </button>
      </div>
    </div>
  );
};

export default TheatersCard;