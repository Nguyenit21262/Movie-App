import React, { useState, useContext } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const Register = () => {
  const navigate = useNavigate();
  const { backendUrl, setIsLoggedIn, getUserData } = useContext(AppContent);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra dữ liệu đầu vào
    if (!name || !email || !password || !confirmPassword) {
      return toast.error("Please fill in all required fields");
    }

    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters long");
    }

    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    const loadingToast = toast.loading("Creating your account...");

    try {
      axios.defaults.withCredentials = true;

      // Gửi request đăng ký
      const { data } = await axios.post(`${backendUrl}/api/auth/register`, {
        name,
        email,
        password,
      });

      if (data.success) {
        toast.update(loadingToast, {
          render: "Account created successfully! Please verify your email",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });

        setIsLoggedIn(true);
        await getUserData();

        // Điều hướng sang trang xác thực email
        navigate("/email-verify");
      } else {
        toast.update(loadingToast, {
          render: data.message || "Registration failed",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      }
    } catch (error) {
      toast.update(loadingToast, {
        render:
          error.response?.data?.message ||
          "Server error. Please try again later",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      {/* BACKGROUND IMAGE */}
      <img
        src="image.png"
        alt="cinema-bg"
        className="absolute inset-0 w-full h-full object-cover opacity-60"
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/40 backdrop-blur-[2px]" />

      {/* LOGO */}
      <div className="absolute top-6 left-6 z-20 flex items-center">
        <img src={assets.logo} alt="Cinema Logo" className="h-12 w-auto" />
      </div>

      <div className="relative z-10 flex items-center justify-center h-full">
        <form
          onSubmit={handleSubmit}
          className="md:w-[400px] w-[320px] bg-black/75 backdrop-blur-md border border-white/10 rounded-2xl px-8 py-10 shadow-[0_0_60px_rgba(99,102,241,0.2)] flex flex-col items-center"
        >
          <h2 className="text-4xl font-bold text-white tracking-wide">
            Sign up
          </h2>
          <p className="text-sm text-gray-400 mt-3 text-center">
            Create your cinema account to start watching
          </p>

          <div className="w-full mt-8 flex flex-col gap-4">
            {/* Full Name */}
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-12 rounded-full bg-black/40 border border-white/10 px-5 text-sm text-gray-200 placeholder-gray-500 focus:border-indigo-500 outline-none transition-all"
            />

            {/* Email */}
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 rounded-full bg-black/40 border border-white/10 px-5 text-sm text-gray-200 placeholder-gray-500 focus:border-indigo-500 outline-none transition-all"
            />

            {/* Password */}
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 rounded-full bg-black/40 border border-white/10 px-5 text-sm text-gray-200 placeholder-gray-500 focus:border-indigo-500 outline-none transition-all"
            />

            {/* Confirm Password */}
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full h-12 rounded-full bg-black/40 border border-white/10 px-5 text-sm text-gray-200 placeholder-gray-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            className="mt-8 w-full h-11 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold tracking-wide shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
          >
            Create Account
          </button>

          <p className="text-gray-400 text-sm mt-6">
            Already have an account?
            <span
              onClick={() => navigate("/login")}
              className="ml-1 text-yellow-500 font-medium hover:underline cursor-pointer"
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
