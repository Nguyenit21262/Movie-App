import React, {
  useEffect,
  useState,
  useContext,
  useCallback,
  useRef,
} from "react";
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
  fetchTrending,
} from "../services/movieService";
import { fetchPersonalRecommendations } from "../api/movieApi";
import { getCurrentTimeContextBucket } from "../lib/timeContext";

const Home = () => {
  const navigate = useNavigate();
  const { backendUrl, isLoggedIn, topPicksRefreshToken } = useContext(AppContent);

  const [movieData, setMovieData] = useState({
    nowPlaying: [],
    topRated: [],
    popular: [],
    upcoming: [],
    trending: [],
  });

  const [loading, setLoading] = useState({ nowPlaying: true });
  const [topPicks, setTopPicks] = useState([]);
  const [topPicksLoaded, setTopPicksLoaded] = useState(false);
  const topPicksTimeBucketRef = useRef(getCurrentTimeContextBucket());

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
      } catch (error) {
        console.error(`Error fetching ${category}:`, error);
      } finally {
        if (category === "nowPlaying") {
          setLoading({ nowPlaying: false });
        }
      }
    },
    [backendUrl, movieData],
  );

  useEffect(() => {
    if (backendUrl) {
      loadCategory("nowPlaying", fetchNowPlaying);
    }
  }, [backendUrl, loadCategory]);

  const loadTopPicksPreview = useCallback(async (forceRefresh = false) => {
    if (!isLoggedIn) return;

    try {
      const { data } = await fetchPersonalRecommendations(8, forceRefresh);
      if (data.success) {
        topPicksTimeBucketRef.current =
          data.timeContext?.bucket ?? getCurrentTimeContextBucket();
        const normalized = (data.recommendations || []).map((rec, idx) => ({
          ...rec,
          id: rec.tmdb_id ?? idx,
        }));
        setTopPicks(normalized);
      } else {
        setTopPicks([]);
      }
    } catch {
      // Top Picks preview is optional on the home page.
      setTopPicks([]);
    } finally {
      setTopPicksLoaded(true);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) {
      setTopPicks([]);
      setTopPicksLoaded(false);
      return;
    }

    if (topPicksLoaded) return;
    loadTopPicksPreview();
  }, [isLoggedIn, topPicksLoaded, loadTopPicksPreview]);

  useEffect(() => {
    if (!isLoggedIn || topPicksRefreshToken === 0) return;

    loadTopPicksPreview(true);
  }, [isLoggedIn, topPicksRefreshToken, loadTopPicksPreview]);

  useEffect(() => {
    if (!isLoggedIn) return;

    topPicksTimeBucketRef.current = getCurrentTimeContextBucket();
    const intervalId = setInterval(() => {
      const currentBucket = getCurrentTimeContextBucket();

      if (currentBucket !== topPicksTimeBucketRef.current) {
        topPicksTimeBucketRef.current = currentBucket;
        loadTopPicksPreview(true);
      }
    }, 60000);

    return () => clearInterval(intervalId);
  }, [isLoggedIn, loadTopPicksPreview]);

  const sections = [
    { key: "trending", title: "Trending This Week", fetchFn: fetchTrending },
    { key: "topRated", title: "Top Pick", fetchFn: fetchTopRated },
    { key: "popular", title: "Popular Movies", fetchFn: fetchPopular },
    { key: "upcoming", title: "Upcoming Movies", fetchFn: fetchUpcoming },
  ];

  return (
    <div className="min-h-screen bg-neutral-900">
      <HeroSection />

      <div className="flex flex-col gap-10 pb-10">
        {isLoggedIn && topPicks.length > 0 && (
          <HorizontalScollCard
            heading="Recommended for you"
            actionLabel="See All ->"
            onAction={() => {
              navigate("/top-picks");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            data={topPicks}
            onItemClick={(movie) => handleNavigate(movie.tmdb_id ?? movie.id)}
          />
        )}

        {loading.nowPlaying ? (
          <Loading />
        ) : (
          <HorizontalScollCard
            heading="Now Playing"
            data={movieData.nowPlaying}
            onItemClick={(movie) => handleNavigate(movie.id)}
          />
        )}

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
