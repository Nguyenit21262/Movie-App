import React, { useRef } from "react";
import MovieCard from "./MovieCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

const HorizontalScollCard = ({
  data = [],
  heading = "",
  media_type,
  onItemClick,
}) => {
  const contaierRef = useRef();

  const handleNext = () => {
    contaierRef.current.scrollLeft += 245;
  };
  
  const handlePrevious = () => {
    contaierRef.current.scrollLeft -= 245;
  };

  // Add console logging to debug
  console.log(`${heading} - Data:`, data);

  // Check if data is valid
  if (!Array.isArray(data)) {
    console.error(`${heading} - Data is not an array:`, data);
    return null;
  }

  return (
    <section className="px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 mt-2">
      {/* Heading */}
      <h2 className="text-xl lg:text-2xl font-bold mb-4 text-white capitalize">
        {heading}
      </h2>

      <div className="relative">
        {/* Scroll container */}
        <div
          ref={contaierRef}
          className="
            grid grid-flow-col auto-cols-[230px]
            gap-2
            overflow-x-scroll
            scrollbar-none
            pb-2
            scroll-smooth
          "
        >
          {data.length > 0 ? (
            data.map((item, index) => {
              // Skip if item is undefined or null
              if (!item) {
                console.warn(`${heading} - Item at index ${index} is undefined`);
                return null;
              }

              return (
                <MovieCard
                  key={item.id || item._id || index}
                  movie={item}
                  media_type={media_type}
                  onClick={() => onItemClick?.(item)}
                />
              );
            })
          ) : (
            <div className="text-gray-400 py-8">No movies available</div>
          )}
        </div>

        {/* Navigation Buttons */}
        {data.length > 0 && (
          <div className="absolute inset-0 hidden lg:flex items-center justify-between pointer-events-none">
            <button
              onClick={handlePrevious}
              className="pointer-events-auto bg-white p-1 text-black rounded-full -ml-2 shadow hover:bg-gray-200 transition"
              aria-label="Scroll left"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              onClick={handleNext}
              className="pointer-events-auto bg-white p-1 text-black rounded-full -mr-2 shadow hover:bg-gray-200 transition"
              aria-label="Scroll right"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default HorizontalScollCard;