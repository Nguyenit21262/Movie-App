import React from "react";
import HeroSection from "../components/HeroSection";
import FeaturedSection from "../components/FeaturedSection";
import TrailersSection from "../components/TrailersSection";
import SeatLayout from "./SeatLayout";
import ChatButton from "../components/ChatButton";

const Home = () => {
  return (
    <>
      <HeroSection />
      <FeaturedSection />
      {/* <TrailersSection/> */}
      <ChatButton/>
    </>
  );
};

export default Home;
