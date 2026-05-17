import React, { useRef } from "react";
import MovieCard from "./MovieCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

const HorizontalScollCard = ({
  data = [],
  heading = "",
  eyebrow = "",
  subheading = "",
  media_type,
  onItemClick,
  actionLabel = "",
  onAction,
}) => {
  const contaierRef = useRef();

  const getScrollStep = () => {
    const container = contaierRef.current;
    if (!container) return 0;

    const firstCard = container.firstElementChild;
    if (!firstCard) return 0;

    const containerStyles = window.getComputedStyle(container);
    const gap = parseFloat(containerStyles.columnGap || containerStyles.gap || "0");
    const cardWidth = firstCard.getBoundingClientRect().width;

    return cardWidth + gap;
  };

  const handleNext = () => {
    const container = contaierRef.current;
    const step = getScrollStep();
    if (!container || !step) return;

    const currentIndex = Math.round(container.scrollLeft / step);
    container.scrollTo({
      left: (currentIndex + 1) * step,
      behavior: "smooth",
    });
  };

  const handlePrevious = () => {
    const container = contaierRef.current;
    const step = getScrollStep();
    if (!container || !step) return;

    const currentIndex = Math.round(container.scrollLeft / step);
    container.scrollTo({
      left: Math.max(0, (currentIndex - 1) * step),
      behavior: "smooth",
    });
  };

  if (!Array.isArray(data)) {
    console.error(`${heading} - Data is not an array:`, data);
    return null;
  }

  return (
    <section className="mt-2 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
      {(eyebrow || heading || subheading || (actionLabel && onAction)) && (
        <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            {eyebrow && (
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-gray-500">
                {eyebrow}
              </p>
            )}

            {heading && (
              <h2 className="text-xl font-bold text-white capitalize lg:text-2xl">
                {heading}
              </h2>
            )}

            {subheading && (
              <p className="mt-2 max-w-2xl text-sm text-gray-400">
                {subheading}
              </p>
            )}
          </div>

          {actionLabel && onAction && (
            <button
              onClick={onAction}
              className="text-xs font-semibold text-gray-400 transition hover:text-white"
            >
              {actionLabel}
            </button>
          )}
        </div>
      )}

      <div className="relative">
        <div
          ref={contaierRef}
          className="
            grid grid-flow-col auto-cols-[230px]
            gap-2
            overflow-x-auto
            scrollbar-none
            pb-2
            scroll-smooth
            snap-x snap-mandatory
          "
        >
          {data.length > 0 ? (
            data.map((item, index) => {
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
                  className="snap-start"
                />
              );
            })
          ) : (
            <div className="py-8 text-gray-400">No movies available</div>
          )}
        </div>

        {data.length > 0 && (
          <div className="pointer-events-none absolute inset-0 hidden items-center justify-between lg:flex">
            <button
              onClick={handlePrevious}
              className="pointer-events-auto -ml-2 rounded-full bg-white p-1 text-black shadow transition hover:bg-gray-200"
              aria-label="Scroll left"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              onClick={handleNext}
              className="pointer-events-auto -mr-2 rounded-full bg-white p-1 text-black shadow transition hover:bg-gray-200"
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
