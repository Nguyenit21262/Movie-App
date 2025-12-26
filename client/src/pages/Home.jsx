import React from "react";
import { useNavigate } from "react-router-dom";
import HeroSection from "../components/HeroSection";
import ChatButton from "../components/ChatButton";
import HorizontalScollCard from "../components/HorizontalScollCard";
import { dummyShowsData } from "../assets/assets";

const Home = () => {
  const navigate = useNavigate();

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

      <ChatButton/>
    </>
  );
};

export default Home;
