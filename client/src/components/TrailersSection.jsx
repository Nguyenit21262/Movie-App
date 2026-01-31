import React from "react";
import ReactPlayer from "react-player";

const TrailersSection = ({ videos = [], movieTitle = "" }) => {
  // Filter for trailers and teasers
  const trailers = videos.filter(
    (video) => 
      video.type === "Trailer" || 
      video.type === "Teaser"
  );

  // Get the official trailer or first available video
  const mainTrailer = 
    trailers.find(video => video.name.toLowerCase().includes("official")) ||
    trailers[0];

  if (!mainTrailer) {
    return null; // Don't show section if no trailers
  }

  // Construct YouTube URL
  const getYouTubeUrl = (key) => `https://www.youtube.com/watch?v=${key}`;

  return (
    <div
      id="trailer"
      className="px-6 md:px-16 lg:px-24 xl:px-44 py-20 overflow-hidden"
    >
      <p className="text-white font-semibold text-xl mb-2 max-w-[960px] mx-auto">
        Trailers & Videos
      </p>
      
      <p className="text-gray-400 text-sm mb-6 max-w-[960px] mx-auto">
        {movieTitle}
      </p>

      {/* Main Trailer */}
      <div className="relative mt-6 max-w-[960px] mx-auto">
        <ReactPlayer
          src={getYouTubeUrl(mainTrailer.key)}
          controls
          width="100%"
          height="540px"
          className="rounded-lg overflow-hidden"
          config={{
            youtube: {
              playerVars: { 
                modestbranding: 1,
                rel: 0 
              }
            }
          }}
        />
      </div>

      {/* Additional Trailers */}
      {trailers.length > 1 && (
        <div className="mt-8 max-w-[960px] mx-auto">
          <p className="text-white font-medium mb-4">More Videos</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trailers.slice(1, 5).map((video) => (
              <div key={video.id} className="bg-neutral-900 rounded-lg overflow-hidden">
                <ReactPlayer
                  url={getYouTubeUrl(video.key)}
                  controls
                  width="100%"
                  height="240px"
                  light={`https://img.youtube.com/vi/${video.key}/hqdefault.jpg`}
                  config={{
                    youtube: {
                      playerVars: { 
                        modestbranding: 1,
                        rel: 0 
                      }
                    }
                  }}
                />
                <div className="p-3">
                  <p className="text-white text-sm font-medium line-clamp-1">
                    {video.name}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    {video.type}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrailersSection;