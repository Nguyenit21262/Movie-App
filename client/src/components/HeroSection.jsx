import React, { useState, useEffect } from "react";
import { assets, dummyShowsData } from "../assets/assets";
import { ArrowRight, CalendarIcon, ClockIcon, Play, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import timeFormat from "../lib/timeFormat";

const HeroSection = () => {
  const navigate = useNavigate();

  const movie = dummyShowsData[1];

  return (
    <div
      // onClick={() => {
      //   navigate(`/movies/${movie._id}`);
      //   scrollTo(0, 0);
      // }}
      className="relative flex flex-col items-start justify-center gap-4 px-6 md:px-16 lg:px-36 bg-cover bg-center h-screen transition-all duration-1000 mb-6"
      style={{
        backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.5)), url(${movie.backdrop_path})`,
      }}
    >
      {/* rating */}
      <div className="flex flex-wrap items-center gap-3">
        {movie.vote_average && (
          <div className="flex items-center gap-1.5 bg-yellow-500/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-yellow-500/30">
            <div className="flex items-center gap-1 text-yellow-500">
              <Star className="w-4 h-4 fill-current" />{" "}
              <span className="font-bold text-sm md:text-base leading-none">
                {movie.vote_average.toFixed(1)}
              </span>
            </div>
            <span className="text-gray-400 text-xs md:text-sm font-medium border-l border-white/20 pl-1.5 ml-0.5">
              10
            </span>
          </div>
        )}
      </div>
      {/* Title */}
      <h1 className="text-5xl md:text-[70px] md:leading-[1.1] font-bold text-white max-w-2xl cursor-pointer">
        {movie.title}
      </h1>
      {/* Tagline (nếu có) */}
      {movie.tagline && (
        <p className="text-xl text-gray-300 italic max-w-2xl">
          "{movie.tagline}"
        </p>
      )}
      {/* Movie Info */}
      <div className="flex flex-wrap items-center gap-4 text-gray-300">
        <div className="flex items-center gap-1 bg-gray-800/50 px-3 py-1 rounded-full">
          <span className="text-sm">
            {movie.genres.map((genre) => genre.name).join(" | ")}
          </span>
        </div>

        <div className="flex items-center gap-1 bg-gray-800/50 px-3 py-1 rounded-full">
          {/* <CalendarIcon className="w-4.5 h-4.5" /> */}
          <span>{movie.release_date}</span>
        </div>

        <div className="flex items-center gap-1 bg-gray-800/50 px-3 py-1 rounded-full">
          {/* <ClockIcon className="w-4.5 h-4.5" /> */}
          <span>{timeFormat(movie.runtime)}</span>
        </div>
      </div>
      {/* Overview */}
      <p className="max-w-2xl text-gray-300 text-lg">{movie.overview}</p>
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mt-4">
        <button
          onClick={() => navigate(`/movies/${movie._id}#trailerMovie`)}
          className="flex items-center gap-2 px-8 py-3 text-sm bg-yellow hover:bg-yellow-dark transition rounded-full font-medium cursor-pointer"
        >
          <Play className="w-5 h-5" fill="currentColor" />
          Watch Trailer
        </button>

        {/* <button
          onClick={() => navigate("/movies")}
          className="flex items-center gap-2 px-8 py-3 text-sm bg-transparent border-2 border-gray-600 hover:border-white hover:text-white transition rounded-full font-medium cursor-pointer text-gray-300"
        >
          Explore All Movies
          <ArrowRight className="w-5 h-5" />
        </button> */}
      </div>
    </div>
  );
};

export default HeroSection;
