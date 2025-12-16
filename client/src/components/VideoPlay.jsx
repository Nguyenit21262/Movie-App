import React from "react";
import Loading from "./Loading";
import { X } from "lucide-react";

const VideoPlay = ({ showData, onClose }) => {
  if (!showData) return <Loading />;

  return (
    <section
      className="
      fixed inset-0 z-[999]
      flex items-center justify-center
      bg-black/70 backdrop-blur-sm
    "
    >
      {/* Modal */}
      <div
        className="
        relative w-full max-w-4xl
        mx-4
        bg-neutral-900
        rounded-xl
        shadow-2xl
        overflow-hidden
      "
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h2 className="text-white text-lg font-semibold truncate">
            {showData.title}
          </h2>

          <button
            onClick={onClose}
            className="
              text-white/70 hover:text-white
              transition
            "
          >
            <X size={22} />
          </button>
        </div>

        {/* Video */}
        <div className="aspect-video bg-black">
          <iframe
            src={showData.videoUrl}
            title={`Trailer for ${showData.title}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      </div>
    </section>
  );
};

export default VideoPlay;
