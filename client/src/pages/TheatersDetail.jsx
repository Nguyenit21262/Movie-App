import React, { useState, useEffect, useContext, useMemo } from "react";
import { useNavigate, useParams, Outlet, useLocation } from "react-router-dom";
import axios from "axios";
import {
  ArrowRight,
  Heart,
  PlayCircleIcon,
  Clock,
  Calendar,
  Tag,
  Star,
} from "lucide-react";
import { AppContent } from "../context/AppContext";
import { getTMDBPosterUrl, getTMDBBackdropUrl } from "../lib/tmdb/tmdbConfig";
import timeFormat from "../lib/timeFormat";
import DataSelect from "../components/DataSelect";
import TheatersCard from "../components/TheatersCard";
import Loading from "../components/Loading";

const mockShowtimes = {
  "2026-02-05": [
    { id: 1, time: "10:30", roomId: 1, price: 8 },
    { id: 2, time: "14:00", roomId: 2, price: 10 },
  ],
  "2026-02-06": [{ id: 3, time: "18:30", roomId: 1, price: 12 }],
};

const TheatersDetail = () => {
  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContent);
  const { id } = useParams();
  const { hash } = useLocation();

  const [data, setData] = useState({
    movie: null,
    videos: [],
    recommendations: [],
  });
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  // Fetch Data tập trung
  useEffect(() => {
    if (!backendUrl || !id) return;

    const controller = new AbortController();
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: res } = await axios.get(
          `${backendUrl}/api/movies/tmdb/${id}`,
          { signal: controller.signal }
        );

        if (res?.success) {
          setData({
            movie: res.movie,
            videos: res.videos || [],
            recommendations: res.recommendations || [],
          });
        }
      } catch (e) {
        if (!axios.isCancel(e)) console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, [id, backendUrl]);

  // Xử lý Scroll và Hash
  useEffect(() => {
    if (!loading && data.movie) {
      if (hash) {
        const el = document.getElementById(hash.replace("#", ""));
        el?.scrollIntoView({ behavior: "smooth" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  }, [hash, loading, data.movie, id]);

  // Memoize Trailer và Recommendations
  const trailerVideo = useMemo(() => {
    return data.videos.find((v) => v.type === "Trailer" && v.site === "YouTube") || data.videos[0];
  }, [data.videos]);

  const displayedRecs = useMemo(() => data.recommendations.slice(0, 4), [data.recommendations]);

  if (loading) return <Loading />;
  if (!data.movie) return <div className="min-h-screen bg-neutral-900 flex items-center justify-center text-white">Movie not found.</div>;

  const { movie } = data;

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      {/* Hero Section */}
      <div className="relative w-full h-[600px] md:h-[700px] overflow-hidden">
        {/* Backdrop Image with Overlay */}
        <div className="absolute inset-0">
          <img
            src={getTMDBBackdropUrl(movie.backdrop_path, "w1280")}
            alt=""
            className="w-full h-full object-cover opacity-40 scale-105 blur-[2px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/60 to-transparent" />
        </div>

        {/* Content Info */}
        <div className="relative h-full flex items-end px-6 md:px-16 lg:px-40 pb-16">
          <div className="flex flex-col md:flex-row gap-10 max-w-7xl mx-auto w-full items-center md:items-end">
            {/* Poster */}
            <div className="shrink-0 group relative">
              <img
                src={getTMDBPosterUrl(movie.poster_path, "w500")}
                alt={movie.title}
                className="rounded-2xl h-[400px] md:h-[480px] w-auto object-cover shadow-2xl border border-white/10 transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </div>

            {/* Meta Detail */}
            <div className="flex flex-col gap-4 flex-1">
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold tracking-widest uppercase">
                  {movie.original_language}
                </span>
                {movie.vote_average > 0 && (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-yellow-500 text-black rounded-full text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    {(movie.vote_average / 2).toFixed(1)} / 5
                  </span>
                )}
              </div>

              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight drop-shadow-lg">
                {movie.title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-gray-300 text-sm md:text-base font-medium">
                {movie.runtime > 0 && (
                  <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-yellow-500" />{timeFormat(movie.runtime)}</span>
                )}
                {movie.release_date && (
                  <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-yellow-500" />{new Date(movie.release_date).getFullYear()}</span>
                )}
                {movie.genres?.length > 0 && (
                  <span className="flex items-center gap-2"><Tag className="w-4 h-4 text-yellow-500" />{movie.genres.map(g => g.name).join(", ")}</span>
                )}
              </div>

              <p className="text-gray-400 max-w-3xl line-clamp-4 md:line-clamp-none text-base md:text-lg leading-relaxed">
                {movie.overview}
              </p>

              <div className="flex items-center gap-4 mt-6">
                {trailerVideo && (
                  <button
                    onClick={() => navigate("trailer")}
                    className="flex items-center gap-3 px-8 py-4 bg-yellow-500 hover:bg-yellow-600 text-black rounded-2xl font-bold transition-all active:scale-95 shadow-lg shadow-yellow-500/20"
                  >
                    <PlayCircleIcon className="w-6 h-6" />
                    Watch Trailer
                  </button>
                )}
                <button 
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`p-4 rounded-2xl transition-all border ${isFavorite ? 'bg-red-500 border-red-500 text-white' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
                >
                  <Heart className={isFavorite ? "fill-current" : ""} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Section */}
      <div id="booking" className="px-6 md:px-16 lg:px-40 py-16 bg-neutral-900">
        <div className="max-w-7xl mx-auto border-t border-white/5 pt-16">
          <h2 className="text-3xl font-bold mb-8">Select Showtimes</h2>
          <DataSelect dateTime={mockShowtimes} id={movie.id} />
        </div>
      </div>

      {/* Recommendations */}
      {displayedRecs.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 md:px-16 lg:px-40 pb-32">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-2xl font-bold">You May Also Like</h3>
            <button
              onClick={() => { navigate("/theaters"); window.scrollTo(0, 0); }}
              className="group flex items-center gap-2 text-gray-400 hover:text-yellow-500 transition-colors font-medium"
            >
              View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {displayedRecs.map((item) => (
              <TheatersCard
                key={item.id}
                movie={item}
                onClick={() => navigate(`/theaters/tmdb/${item.id}`)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Trailer Modal / Sub-routes */}
      <Outlet
        context={{
          showData: {
            ...movie,
            videoUrl: trailerVideo ? `https://www.youtube.com/embed/${trailerVideo.key}` : null,
          },
        }}
      />
    </div>
  );
};

export default TheatersDetail;