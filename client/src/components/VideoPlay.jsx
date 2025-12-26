import React, { useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { X } from "lucide-react";
import Loading from "./Loading";

const VideoPlay = () => {
  const navigate = useNavigate();
  const { showData } = useOutletContext();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "auto"; };
  }, []);

  if (!showData) return <Loading />;

  return (
    <section
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-md transition-all duration-300"
      onClick={() => navigate(-1)}
    >
      <div
        className="relative w-full max-w-5xl mx-4 bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 bg-neutral-900 border-b border-white/10 text-white">
          <h2 className="text-lg font-bold tracking-tight truncate mr-4">
            {showData.title}
          </h2>
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <div className="aspect-video bg-black">
          <iframe
            src={showData.videoUrl}
            title={showData.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
};

export default VideoPlay;