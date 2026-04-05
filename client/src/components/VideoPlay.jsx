import React, { useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Clapperboard, ExternalLink, X } from "lucide-react";
import Loading from "./Loading";

const VideoPlay = () => {
  const navigate = useNavigate();
  const { showData } = useOutletContext();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  if (!showData) return <Loading />;

  const youtubeWatchUrl = showData.videoUrl?.replace("/embed/", "/watch?v=");

  return (
    <section
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 transition-all duration-300 p-4"
      onClick={() => navigate(-1)}
    >
      <div
        className="relative w-full max-w-4xl overflow-hidden rounded-sm border border-white/10 bg-black"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-0 " />

        <div className="relative flex items-center justify-between border-b border-white/10 px-5 py-4 text-white">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs uppercase text-yellow-400">
              Trailer
            </div>
            <h2 className="mt-2 text-lg tracking-tight md:text-2xl">
              {showData.title}
            </h2>
          </div>

          <div className="ml-4 flex items-center gap-2">
            {youtubeWatchUrl && (
              <a
                href={youtubeWatchUrl}
                target="_blank"
                rel="noreferrer"
                className="hidden rounded-full border border-white/10 px-4 py-2 text-sm text-gray-300 transition hover:bg-white/5 hover:text-white md:flex md:items-center md:gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                YouTube
              </a>
            )}
            <button
              onClick={() => navigate(-1)}
              className="rounded-full p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {showData.videoUrl ? (
          <div className="relative aspect-video bg-black">
            <iframe
              src={showData.videoUrl}
              title={showData.title}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="flex aspect-video items-center justify-center bg-[linear-gradient(135deg,#0a0a0a,#171717)] px-6">
            <div className="max-w-md text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
                <Clapperboard className="h-8 w-8 text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">
                Trailer not ready
              </h3>
              <p className="mt-3 text-sm leading-6 text-gray-400">
                This movie does not have a YouTube trailer available in the system.
                You can go back to the details page or try another movie.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default VideoPlay;
