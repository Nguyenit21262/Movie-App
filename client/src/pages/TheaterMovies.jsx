import React, { useState } from 'react'
import { dummyShowsData } from "../assets/assets";
import MovieCard from "../components/MovieCard";
const TheaterMovies = () => {
  return dummyShowsData.length > 0 ? (
    <div className="px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 mt-25 overflow-hidden">
      <h1 className="text-lg font-medium my-4">Theater Movies</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {dummyShowsData.map((movie) => (
          <MovieCard movie={movie} key={movie._id} />
        ))}
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold text-center">No movies available</h1>
    </div>
  );
};

export default TheaterMovies