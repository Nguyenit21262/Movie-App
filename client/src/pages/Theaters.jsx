import React from "react";
import { dummyShowsData } from "../assets/assets";
import TheatersCard from "../components/TheatersCard"; import { ArrowRight } from "lucide-react";

const Theaters = () => {
  return dummyShowsData.length > 0 ? (
    <div className="px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 mt-25 overflow-hidden">
      <h1 className="text-lg font-medium my-4">Theater Movies</h1>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-3">
        {dummyShowsData.map((theaters) => (
          <TheatersCard theater={theaters} key={theaters._id} /> 
        ))}
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold text-center">No movies available</h1>
    </div>
  );
};

export default Theaters;