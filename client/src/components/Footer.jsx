import React from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();
  return (
    // https://prebuiltui.com/components/footer
    <div className="">
      <footer className="flex flex-col items-center justify-around w-full py-16 mt-24 text-sm bg-gray-900 text-white">
      <img src={assets.logo} alt="" className="w-36" />
        <p class="mt-4 text-center">
          Copyright © 2025 <a href="/">Movie</a>. All
          rights reservered.
        </p>
      </footer>
    </div>
  );
};

export default Footer;
