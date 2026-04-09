import React from "react";
import { assets } from "../assets/assets";

const Footer = () => {
  return (
    <footer className="mt-24 flex w-full flex-col items-center justify-around bg-gray-800 px-4 py-16 text-sm text-white">
      <img src={assets.logo} alt="" className="w-36" />
      <p className="mt-4 text-center">
        Copyright Â© 2025 <a href="/">Movie</a>. All
        rights reservered.
      </p>
    </footer>
  );
};

export default Footer;
