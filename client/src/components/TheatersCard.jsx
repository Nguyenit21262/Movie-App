import React from "react";
import { useNavigate } from "react-router-dom";
import { StarIcon } from "lucide-react";
import timeFormat from "../lib/timeFormat";

const TheatersCard = ({ theater }) => {
  const navigate = useNavigate();

  return (
    <div className="w-full min-w-[230px] max-w-[230px] h-80 overflow-hidden block rounded relative hover:scale-105 transition-all group">
      {/* Rating badge */}
      <div className="absolute top-3 left-3 z-10 bg-gray-900/80 backdrop-blur-sm text-white px-2 py-1 rounded-full flex items-center gap-1">
        <StarIcon className="w-3 h-3 text-yellow-400 fill-yellow-400" />
        <span className="text-xs font-bold">
          {theater.vote_average.toFixed(1)}
        </span>
      </div>

      {/* Hình ảnh phim và thông tin */}
      <div className="relative overflow-hidden h-full"> {/* Thay đổi h-70 thành h-full để poster lấp đầy */}
        <img
          onClick={() => {
            navigate(`/theaters/${theater._id}`);
            scrollTo(0, 0);
          }}
          // Sửa: Dùng poster_path thay vì backdrop_path để hiển thị poster dọc
          src={theater.poster_path} 
          alt={theater.title}
          className="w-full h-full object-cover cursor-pointer transition-transform duration-500 group-hover:scale-105"
        />

        {/* Thông tin phim  */}
        <div className="absolute bottom-0 h-16 backdrop-blur-3xl w-full bg-black/60 p-2 text-white"> 
          <h3
            onClick={() => {
              navigate(`/theaters/${theater._id}`);
              scrollTo(0, 0);
            }}
            className="text-ellipsis line-clamp-1 text-lg font-semibold cursor-pointer hover:text-yellow-400 transition"
          >
            {theater.title}
          </h3>
          <div className="text-sm text-neutral-400 flex justify-between items-center">
            <span>{theater.release_date}</span>
            <span className="flex items-center gap-1">
              <span>{timeFormat(theater.runtime)}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TheatersCard;