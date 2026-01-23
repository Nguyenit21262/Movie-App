import React from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";

const Login = () => {

    const navigate = useNavigate();
  return (
    <div className="relative h-[700px] w-full overflow-hidden bg-black">
      {/* BACKGROUND IMAGE */}
      <img
        src="image.png"
        alt="cinema-bg"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/40 backdrop-blur-[1px]" />

      {/* LOGO TOP LEFT */}
      <div className="absolute top-6 left-6 z-20 flex items-center ">
        <img src={assets.logo} alt="Cinema Logo" className="h-12 w-auto" />
      </div>

      {/* FORM */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <form
          className="
            md:w-[380px] w-[320px]
            bg-black/70 backdrop-blur-md
            border border-white/10
            rounded-2xl
            px-8 py-10
            shadow-[0_0_60px_rgba(99,102,241,0.15)]
            flex flex-col items-center
          "
        >
          {/* TITLE */}
          <h2 className="text-4xl font-semibold text-white tracking-wide">
            Sign in
          </h2>
          <p className="text-sm text-gray-400 mt-3 text-center">
            Book your favorite movies instantly
          </p>

          {/* GOOGLE */}
          {/* <button
            type="button"
            className="
              w-full mt-8 h-12
              flex items-center justify-center
              rounded-full
              bg-white/10 hover:bg-white/20
              transition
            "
          >
            <img
              src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/login/googleLogo.svg"
              alt="google"
            />
          </button> */}

          {/* DIVIDER */}
          {/* <div className="flex items-center gap-4 w-full my-6">
            <div className="w-full h-px bg-white/10"></div>
            <p className="text-sm text-gray-400">or</p>
            <div className="w-full h-px bg-white/10"></div>
          </div> */}

          {/* EMAIL */}
          <div className="flex items-center w-full h-12 rounded-full bg-black/40 border border-white/10 pl-5 gap-2">
            <input
              type="email"
              placeholder="Email"
              className="w-full h-full bg-transparent outline-none text-sm text-gray-200 placeholder-gray-400"
            />
          </div>

          {/* PASSWORD */}
          <div className="flex items-center w-full h-12 mt-6 rounded-full bg-black/40 border border-white/10 pl-5 gap-2">
            <input
              type="password"
              placeholder="Password"
              className="w-full h-full bg-transparent outline-none text-sm text-gray-200 placeholder-gray-400"
            />
          </div>

          {/* OPTIONS */}
          <div className="w-full flex items-center justify-between mt-7 text-gray-400 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-indigo-500" />
              Remember me
            </label>
            <a href="#" className="hover:text-white underline">
              Forgot?
            </a>
          </div>

          {/* LOGIN */}
          <button
            type="submit"
            className="
              mt-8 w-full h-11
              rounded-full
              bg-gray-800
              text-white font-medium
              tracking-wide
              hover:opacity-90 transition
            "
          >
            Login
          </button>

          {/* SIGN UP */}
          <p className="text-gray-400 text-sm mt-4">
            New to Cinema?
            <span
            onClick={() => {navigate("/register"); scrollTo(0,0)}}
            className="ml-1 text-yellow-400 hover:underline cursor-pointer"
          >
            Sign up
          </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
