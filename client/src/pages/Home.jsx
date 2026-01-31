import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import HeroSection from "../components/HeroSection";
import ChatButton from "../components/ChatButton";
import HorizontalScollCard from "../components/HorizontalScollCard";
import { AppContent } from "../context/AppContext";
import axios from "axios";

const Home = () => {
  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContent);
  
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch movies from your backend API
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        
        console.log("Fetching from:", backendUrl);
        
        // Fetch all movie categories in parallel

        const [topRatedRes ,nowPlayingRes, popularRes, upcomingRes] = await Promise.all([
          axios.get(`${backendUrl}/api/movies/tmdb/top-rated`, {
            params: { page: 1 }
          }),
          axios.get(`${backendUrl}/api/movies/tmdb/now-playing`, {
            params: { page: 1 }
          }),
          axios.get(`${backendUrl}/api/movies/tmdb/popular`, {
            params: { page: 1 }
          }),
          axios.get(`${backendUrl}/api/movies/tmdb/upcoming`, {
            params: { page: 1 }
          })
        ]);

        // Debug logging
        console.log("Top Rated Response:", topRatedRes.data);
        console.log("Now Playing Response:", nowPlayingRes.data);
        console.log("Popular Response:", popularRes.data);
        console.log("Upcoming Response:", upcomingRes.data);

        if(topRatedRes.data.success) {
          console.log("Top Rated Results:", topRatedRes.data.results);
           setTopRatedMovies(topRatedRes.data.results || []);
        }

        if (nowPlayingRes.data.success) {
          console.log("Now Playing Results:", nowPlayingRes.data.results);
          console.log("First Now Playing Movie:", nowPlayingRes.data.results[0]);
          setNowPlayingMovies(nowPlayingRes.data.results || []);
        }

        if (popularRes.data.success) {
          console.log("Popular Results:", popularRes.data.results);
          setPopularMovies(popularRes.data.results || []);
        }

        if (upcomingRes.data.success) {
          console.log("Upcoming Results:", upcomingRes.data.results);
          setUpcomingMovies(upcomingRes.data.results || []);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching movies:", err);
        console.error("Error details:", err.response?.data);
        setError(err.message);
        setLoading(false);
      }
    };

    if (backendUrl) {
      fetchMovies();
    } else {
      console.error("backendUrl is not defined!");
    }
  }, [backendUrl]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-900">
        <div className="text-white text-xl">Loading movies...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900">
        <div className="text-xl text-red-500 mb-4">Error: {error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <HeroSection />

      <HorizontalScollCard
        heading="Top Pick"
        data={topRatedMovies}
        onItemClick={(movie) => {
          console.log("Clicked top rated movie:", movie);
          navigate(`/movies/tmdb/${movie.id}`);
          window.scrollTo(0, 0);
        }}
      />

      <HorizontalScollCard
        heading="Now Playing"
        data={nowPlayingMovies}
        onItemClick={(movie) => {
          console.log("Clicked movie:", movie);
          navigate(`/movies/tmdb/${movie.id}`);
          window.scrollTo(0, 0);
        }}
      />

      <HorizontalScollCard
        heading="Popular Movies"
        data={popularMovies}
        onItemClick={(movie) => {
          navigate(`/movies/tmdb/${movie.id}`);
          window.scrollTo(0, 0);
        }}
      />

      <HorizontalScollCard
        heading="Upcoming Movies"
        data={upcomingMovies}
        onItemClick={(movie) => {
          navigate(`/movies/tmdb/${movie.id}`);
          window.scrollTo(0, 0);
        }}
      />

      <ChatButton />
    </>
  );
};

export default Home;