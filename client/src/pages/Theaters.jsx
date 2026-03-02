import React, { useContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContent } from "../context/AppContext";
import Loading from "../components/Loading";
import TheatersCard from "../components/TheatersCard";
import LazySection from "../components/LazySection";

const Theaters = () => {
  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContent);

  const [theaters, setTheaters] = useState({
    nowPlaying: [],
    upcoming: [],
  });

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [error, setError] = useState(null);

  // Hàm fetch phim theo category để tái sử dụng
  const fetchCategory = useCallback(
    async (category, endpoint) => {
      try {
        const res = await axios.get(
          `${backendUrl}/api/movies/tmdb/${endpoint}`,
          {
            params: { page: 1 },
          },
        );
        const results = res.data.results || [];
        setTheaters((prev) => ({ ...prev, [category]: results }));
      } catch (err) {
        console.error(`Error fetching ${category}:`, err);
        if (category === "nowPlaying") setError("Failed to load theater data");
      } finally {
        if (category === "nowPlaying") setLoadingInitial(false);
      }
    },
    [backendUrl],
  );

  // Khởi tạo: Chỉ tải Now Playing trước
  useEffect(() => {
    if (backendUrl) {
      fetchCategory("nowPlaying", "now-playing");
    }
  }, [backendUrl, fetchCategory]);

  const handleTheaterClick = useCallback(
    (id) => {
      navigate(`/theaters/tmdb/${id}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [navigate],
  );

  if (loadingInitial) return <Loading />;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-900">
        <div className="text-center p-8 bg-neutral-800 rounded-2xl border border-red-500/20">
          <p className="text-red-500 text-xl mb-6 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all active:scale-95"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-16 py-8 mt-10 bg-neutral-900 min-h-screen">
      <section className="px-6 md:px-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-white text-3xl font-bold tracking-tight">
            Now Playing
          </h2>
          <span className="h-px flex-1 bg-neutral-800 ml-6 hidden md:block"></span>
        </div>

        {theaters.nowPlaying.length > 0 ? (
          <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {theaters.nowPlaying.map((movie) => (
              <TheatersCard
                key={movie.id}
                movie={movie}
                onClick={() => handleTheaterClick(movie.id)}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No movies currently playing</p>
        )}
      </section>

      <LazySection fetchData={() => fetchCategory("upcoming", "upcoming")}>
        <section className="px-6 md:px-12 animate-in fade-in duration-1000">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-white text-3xl font-bold tracking-tight">
              Upcoming Movies
            </h2>
            <span className="h-px flex-1 bg-neutral-800 ml-6 hidden md:block"></span>
          </div>

          {theaters.upcoming.length > 0 ? (
            <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {theaters.upcoming.map((movie) => (
                <TheatersCard
                  key={movie.id}
                  movie={movie}
                  onClick={() => handleTheaterClick(movie.id)}
                />
              ))}
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 opacity-20">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-[2/3] bg-neutral-800 rounded-xl"
                />
              ))}
            </div>
          )}
        </section>
      </LazySection>
    </div>
  );
};

export default Theaters;
