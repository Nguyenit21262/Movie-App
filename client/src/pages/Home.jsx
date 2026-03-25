import React, { useEffect, useState, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContent";
import HeroSection from "../components/HeroSection";
import HorizontalScollCard from "../components/HorizontalScollCard";
import Loading from "../components/Loading";
import LazySection from "../components/LazySection";
import {
  fetchNowPlaying,
  fetchTopRated,
  fetchPopular,
  fetchUpcoming,
} from "../services/movieService";

const Home = () => {
  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContent);

  const [movieData, setMovieData] = useState({
    nowPlaying: [],
    topRated: [],
    popular: [],
    upcoming: [],
  });

  const [loading, setLoading] = useState({ nowPlaying: true });

  // Hàm điều hướng dùng chung
  const handleNavigate = useCallback(
    (id) => {
      navigate(`/movies/tmdb/${id}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [navigate],
  );

  const loadCategory = useCallback(
    async (category, fetchFn) => {
      if (movieData[category].length > 0) return;
      try {
        const res = await fetchFn(backendUrl);
        if (res.data.success) {
          setMovieData((prev) => ({ ...prev, [category]: res.data.results }));
        }
      } catch (err) {
        console.error(`Error fetching ${category}:`, err);
      } finally {
        if (category === "nowPlaying") setLoading({ nowPlaying: false });
      }
    },
    [backendUrl, movieData],
  );

  useEffect(() => {
    if (backendUrl) loadCategory("nowPlaying", fetchNowPlaying);
  }, [backendUrl, loadCategory]);

  // Cấu trúc các Section để render bằng map
  const sections = [
    { key: "topRated", title: "Top Pick", fetchFn: fetchTopRated },
    { key: "popular", title: "Popular Movies", fetchFn: fetchPopular },
    { key: "upcoming", title: "Upcoming Movies", fetchFn: fetchUpcoming },
  ];

  return (
    <div className="bg-neutral-900 min-h-screen">
      <HeroSection />

      <div className="flex flex-col gap-10 pb-10">
        {loading.nowPlaying ? (
          <Loading />
        ) : (
          <HorizontalScollCard
            heading="Now Playing"
            data={movieData.nowPlaying}
            onItemClick={(movie) => handleNavigate(movie.id)}
          />
        )}

        {/* Các Section Lazy Load tiếp theo */}
        {sections.map((section) => (
          <LazySection
            key={section.key}
            fetchData={() => loadCategory(section.key, section.fetchFn)}
          >
            {movieData[section.key].length > 0 && (
              <HorizontalScollCard
                heading={section.title}
                data={movieData[section.key]}
                onItemClick={(movie) => handleNavigate(movie.id)}
              />
            )}
          </LazySection>
        ))}
      </div>
    </div>
  );
};

export default Home;
