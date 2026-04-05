import React, { useEffect, useState, useContext, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  fetchTrending,
} from "../services/movieService";
import { fetchRecommendations } from "../api/movieApi";

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { backendUrl, isLoggedIn, userData } = useContext(AppContent);

  const [movieData, setMovieData] = useState({
    nowPlaying: [],
    topRated: [],
    popular: [],
    upcoming: [],
    trending: [],
  });

  const [loading, setLoading] = useState({ nowPlaying: true });

  // Recommendations state (chỉ dùng khi đã đăng nhập)
  const [recommendations, setRecommendations] = useState([]);
  const [recLoading, setRecLoading] = useState(false);
  // Dùng ref để track lần fetch cuối — tránh double-fetch nhưng luôn re-fetch khi location thay đổi
  const lastFetchedLocationKey = useRef(null);

  // Hàm điều hướng dùng chung
  const handleNavigate = useCallback(
    (id) => {
      navigate(`/movies/tmdb/${id}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [navigate],
  );

  // Điều hướng từ recommendation (dùng tmdb_id)
  const handleRecNavigate = useCallback(
    (movie) => {
      const id = movie.tmdb_id ?? movie.id;
      if (id) {
        navigate(`/movies/tmdb/${id}`);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
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

  // Fetch recommendations mỗi khi navigate về Home (location.key thay đổi)
  // hoặc khi user vừa đăng nhập
  useEffect(() => {
    if (!isLoggedIn) {
      setRecommendations([]);
      lastFetchedLocationKey.current = null;
      return;
    }

    // Tránh double-fetch cùng một navigation event (React strict mode)
    if (lastFetchedLocationKey.current === location.key) return;
    lastFetchedLocationKey.current = location.key;

    const controller = new AbortController();
    const load = async () => {
      setRecLoading(true);
      try {
        const res = await fetchRecommendations(20, { signal: controller.signal });
        if (res.data.success && res.data.recommendations?.length) {
          setRecommendations(res.data.recommendations);
        }
      } catch (err) {
        if (err?.name !== "CanceledError" && err?.code !== "ERR_CANCELED") {
          console.error("Error fetching recommendations:", err);
        }
      } finally {
        setRecLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, [isLoggedIn, location.key]);

  // Cấu trúc các Section để render bằng map
  const sections = [
    { key: "trending", title: "Trending This Week", fetchFn: fetchTrending },
    { key: "topRated", title: "Top Pick", fetchFn: fetchTopRated },
    { key: "popular", title: "Popular Movies", fetchFn: fetchPopular },
    { key: "upcoming", title: "Upcoming Movies", fetchFn: fetchUpcoming },
  ];

  return (
    <div className="bg-neutral-900 min-h-screen">
      <HeroSection />

      <div className="flex flex-col gap-10 pb-10">
        {/* Recommended For You — chỉ hiện khi đã đăng nhập */}
        {isLoggedIn && recLoading && (
          /* Skeleton loading — cùng layout với HorizontalScollCard */
          <section className="px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 mt-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-7 w-56 bg-neutral-800 rounded animate-pulse" />
              <div className="h-4 w-36 bg-neutral-800/60 rounded animate-pulse" />
            </div>
            <div className="flex gap-2 overflow-hidden">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="w-[230px] shrink-0 aspect-[2/3.2] rounded-sm bg-neutral-800 animate-pulse"
                />
              ))}
            </div>
          </section>
        )}

        {isLoggedIn && !recLoading && recommendations.length > 0 && (
          <HorizontalScollCard
            heading="Recommended For You"
            data={recommendations.map((rec) => ({
              id: rec.tmdb_id,
              tmdb_id: rec.tmdb_id,
              title: rec.title,
              poster_path: rec.poster_path || null,
              vote_average: rec.vote_average,
              release_date: rec.release_date,
            }))}
            onItemClick={handleRecNavigate}
          />
        )}


        {/* Now Playing */}
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
