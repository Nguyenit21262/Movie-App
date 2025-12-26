import React from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";

const Register = () => {
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

      {/* LOGO */}
      <div className="absolute top-6 left-6 z-20">
        <img src={assets.logo} alt="Cinema Logo" className="h-12 w-auto" />
      </div>

      {/* FORM */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <form
          className="
            md:w-[400px] w-[320px]
            bg-black/70 backdrop-blur-md
            border border-white/10
            rounded-2xl
            px-8 py-10
            shadow-[0_0_60px_rgba(234,179,8,0.15)]
            flex flex-col items-center
          "
        >
          {/* TITLE */}
          <h2 className="text-4xl font-semibold text-white tracking-wide">
            Sign up
          </h2>
          <p className="text-sm text-gray-400 mt-3 text-center">
            Create your cinema account
          </p>

          {/* NAME */}
          <div className="w-full mt-8">
            <input
              type="text"
              placeholder="Full name"
              className="
                w-full h-12 rounded-full
                bg-black/40
                border border-white/10
                px-5
                text-sm text-gray-200
                placeholder-gray-400
                outline-none
              "
            />
          </div>

          {/* EMAIL */}
          <div className="w-full mt-5">
            <input
              type="email"
              placeholder="Email"
              className="
                w-full h-12 rounded-full
                bg-black/40
                border border-white/10
                px-5
                text-sm text-gray-200
                placeholder-gray-400
                outline-none
              "
            />
          </div>

          {/* PHONE */}
          <div className="w-full mt-5">
            <input
              type="text"
              placeholder="Phone number"
              className="
                w-full h-12 rounded-full
                bg-black/40
                border border-white/10
                px-5
                text-sm text-gray-200
                placeholder-gray-400
                outline-none
              "
            />
          </div>

          {/* PASSWORD */}
          <div className="w-full mt-5">
            <input
              type="password"
              placeholder="Password"
              className="
                w-full h-12 rounded-full
                bg-black/40
                border border-white/10
                px-5
                text-sm text-gray-200
                placeholder-gray-400
                outline-none
              "
            />
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="w-full mt-5">
            <input
              type="password"
              placeholder="Confirm password"
              className="
                w-full h-12 rounded-full
                bg-black/40
                border border-white/10
                px-5
                text-sm text-gray-200
                placeholder-gray-400
                outline-none
              "
            />
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            className="
              mt-8 w-full h-11
              rounded-full
              bg-gray-800
              text-white font-semibold
              tracking-wide
              hover:opacity-90 transition
            "
          >
            Create account
          </button>

          {/* LOGIN LINK */}
          <p className="text-gray-400 text-sm mt-4">
            Already have an account?
            <span
              onClick={() => {navigate("/login"); scrollTo(0,0)}}
              className="ml-1 text-yellow-400 hover:underline cursor-pointer"
            >
              Sign in
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
