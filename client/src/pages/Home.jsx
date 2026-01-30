import React, { useEffect,useState } from "react";
import { useNavigate } from "react-router-dom";
import HeroSection from "../components/HeroSection";
import ChatButton from "../components/ChatButton";
import HorizontalScollCard from "../components/HorizontalScollCard";
import { dummyShowsData } from "../assets/assets";
import axios from "axios";

const Home = () => {
  const navigate = useNavigate();
  const [NowPlayingData, setNowPlayingData] = useState([]);

  const fetchNowPlayingData = async () => {
    try {
      const response = await axios.get("/movie/now_playing");
    } catch (error) {
      console.error("Error fetching now playing data:", error);
    }
  };

  useEffect(() => {
    fetchNowPlayingData();
  }, []);
  return (
    <>
      <HeroSection />

      <HorizontalScollCard
        heading="Now Showing"
        data={dummyShowsData}
        onItemClick={(movie) => {
          navigate(`/movies/${movie._id}`);
          scrollTo(0, 0);
        }}
      />

      <HorizontalScollCard
        heading="Theaters"
        data={dummyShowsData}
        onItemClick={(theaters) => {
          navigate(`/theaters/${theaters._id}`);
          scrollTo(0, 0);
        }}
      />

      <ChatButton />
    </>
  );
};

export default Home;
