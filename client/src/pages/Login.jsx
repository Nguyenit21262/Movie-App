import React, { useState, useContext } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
  const navigate = useNavigate();
  const { backendUrl, setIsLoggedIn, getUserData } = useContext(AppContent);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate input
    if (!email || !password) {
      return toast.error("Please enter email and password");
    }

    const loadingToast = toast.loading("Signing you in...");

    try {
      axios.defaults.withCredentials = true;

      const { data } = await axios.post(`${backendUrl}/api/auth/login`, {
        email,
        password,
      });

      if (!data.success) {
        return toast.update(loadingToast, {
          render: data.message || "Invalid login credentials",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      }

      // Chưa verify email
      if (!data.isAccountVerified) {
        setIsLoggedIn(true);
        await getUserData();
        await axios.post(`${backendUrl}/api/auth/send-verify-otp`);

        toast.update(loadingToast, {
          render: "Account not verified. OTP has been sent to your email",
          type: "info",
          isLoading: false,
          autoClose: 3000,
        });

        return navigate("/email-verify");
      }

      // Login thành công
      setIsLoggedIn(true);
      await getUserData();

      toast.update(loadingToast, {
        render: "Login successful. Welcome back!",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });

      navigate("/");
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
    <div className="relative h-[700px] w-full overflow-hidden bg-black">
      <img
        src="image.png"
        alt="cinema-bg"
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/40 backdrop-blur-[1px]" />

      <div className="absolute top-6 left-6 z-20 flex items-center">
        <img src={assets.logo} alt="Cinema Logo" className="h-12 w-auto" />
      </div>

      <div className="relative z-10 flex items-center justify-center h-full">
        <form
          onSubmit={handleSubmit}
          className="
            md:w-[380px] w-[320px]
            bg-black/75 backdrop-blur-md
            border border-white/10
            rounded-2xl
            px-8 py-10
            shadow-[0_0_60px_rgba(99,102,241,0.15)]
            flex flex-col items-center
          "
        >
          <h2 className="text-4xl font-semibold text-white tracking-wide">
            Sign in
          </h2>

          <p className="text-sm text-gray-400 mt-3 text-center">
            Book your favorite movies instantly
          </p>

          <div className="flex items-center w-full h-12 mt-8 rounded-full bg-black/40 border border-white/10 pl-5 gap-2">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-full bg-transparent outline-none text-sm text-gray-200 placeholder-gray-400"
            />
          </div>

          <div className="flex items-center w-full h-12 mt-6 rounded-full bg-black/40 border border-white/10 pl-5 gap-2">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-full bg-transparent outline-none text-sm text-gray-200 placeholder-gray-400"
            />
          </div>

          <div className="w-full flex items-center justify-between mt-7 text-gray-400 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-indigo-500" />
              Remember me
            </label>
            <div
              onClick={() => navigate("/reset-password")}
              className="hover:text-white underline cursor-pointer"
            >
              Forgot?
            </div>
          </div>

          <button
            type="submit"
            className="
              mt-8 w-full h-11
              rounded-full
              bg-indigo-600
              text-white font-medium
              tracking-wide
              hover:bg-indigo-700 transition-all
            "
          >
            Login
          </button>

          <p className="text-gray-400 text-sm mt-4">
            New to Cinema?
            <span
              onClick={() => {
                navigate("/register");
                scrollTo(0, 0);
              }}
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
