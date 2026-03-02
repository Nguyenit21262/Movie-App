import React, { useState, useEffect, useContext } from "react";
import { AppContent } from "../context/AppContext";
import { Film, ChevronDown } from "lucide-react";
import axios from "axios";

const GenreFilter = ({ selectedGenre, onGenreChange }) => {
  const { backendUrl } = useContext(AppContent);
  const [genres, setGenres] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchGenres = async () => {
      const { data } = await axios.get(
        `${backendUrl}/api/movies/genres/stats`
      );
      if (data.success) setGenres(data.genres);
    };
    if (backendUrl) fetchGenres();
  }, [backendUrl]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-6 py-3 bg-neutral-800 rounded-lg border border-neutral-700"
      >
        <Film className="w-5 h-5 text-yellow-500" />
        <span>{selectedGenre === "all" ? "All Genres" : selectedGenre}</span>
        <ChevronDown className={`w-5 h-5 ${isOpen && "rotate-180"}`} />
      </button>

      {isOpen && (
        <div className="absolute mt-2 w-full bg-neutral-800 rounded-lg border border-neutral-700 z-50">
          <div
            onClick={() => onGenreChange("all")}
            className="px-4 py-2 cursor-pointer hover:bg-neutral-700"
          >
            All Genres
          </div>

          {genres.map((g) => (
            <div
              key={g.name}
              onClick={() => onGenreChange(g.name)}
              className="px-4 py-2 cursor-pointer hover:bg-neutral-700 flex justify-between"
            >
              <span>{g.name}</span>
              <span className="text-gray-400">{g.count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GenreFilter;
