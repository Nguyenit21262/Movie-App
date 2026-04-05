import React, { useState } from "react";
import { Star, X } from "lucide-react";

const RatingModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialRating = 0,
  submitting = false,
}) => {
  const [hoveredRating, setHoveredRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(initialRating);

  React.useEffect(() => {
    if (isOpen) {
      setSelectedRating(initialRating);
      setHoveredRating(0);
    }
  }, [initialRating, isOpen]);

  if (!isOpen) return null;

  const activeRating = hoveredRating || selectedRating;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md rounded-xl border border-white/10 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-black">
              Your Rating
            </p>
            <h3 className="mt-2 text-2xl font-bold text-white">
              Rate This Movie
            </h3>
            <p className="mt-2 text-sm text-black">Choose from 1 to 5 stars</p>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-8 flex items-center justify-center gap-3">
          {[1, 2, 3, 4, 5].map((star) => {
            const active = star <= activeRating;

            return (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setSelectedRating(star)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`h-10 w-10 ${
                    active ? "fill-yellow-400 text-yellow-400" : "text-gray-600"
                  }`}
                />
              </button>
            );
          })}
        </div>

        <p className="mt-4 text-center text-sm text-gray-400">
          {selectedRating > 0
            ? `You have selected ${selectedRating}/5 stars`
            : "Stars not selected"}
        </p>

        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium text-white hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selectedRating || submitting}
            onClick={() => onSubmit(selectedRating)}
            className="flex-1 rounded-2xl bg-yellow-500 px-4 py-3 text-sm font-semibold text-black hover:bg-yellow-400 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-gray-500"
          >
            {submitting ? "Saving..." : "Submit Rating"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;
