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
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      return toast.error("Please fill in all fields");
    }

    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters long");
    }

    const loadingToast = toast.loading("Logging in...");

    try {
      axios.defaults.withCredentials = true;

      const { data } = await axios.post(`${backendUrl}/api/auth/login`, {
        email,
        password,
      });

      if (data.success && data.require2FA) {
        toast.update(loadingToast, {
          render: "OTP sent to your email. Please check your inbox.",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        setShowOtpInput(true);
      } else {
        toast.update(loadingToast, {
          render: data.message || "Login failed",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      }
    } catch (error) {
      toast.update(loadingToast, {
        render:
          error.response?.data?.message || "Login failed. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      return toast.error("Please enter a valid 6-digit OTP");
    }

    const loadingToast = toast.loading("Verifying OTP...");

    try {
      axios.defaults.withCredentials = true;

      const { data } = await axios.post(
        `${backendUrl}/api/auth/verify-login-otp`,
        { email, otp },
        { withCredentials: true },
      );

      if (data.success) {
        toast.update(loadingToast, {
          render: "Login successful!",
          type: "success",
          isLoading: false,
          autoClose: 2000,
        });

        // Fetch user data and set logged in state
        await getUserData();
        setIsLoggedIn(true);

        navigate("/");
      } else {
        toast.update(loadingToast, {
          render: data.message || "Invalid OTP",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      }
    } catch (error) {
      toast.update(loadingToast, {
        render: error.response?.data?.message || "OTP verification failed",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      <img
        src="image.png"
        alt="cinema-bg"
        className="absolute inset-0 w-full h-full object-cover opacity-60"
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/40 backdrop-blur-[2px]" />

      <div className="absolute top-6 left-6 z-20 flex items-center">
        <img src={assets.logo} alt="Cinema Logo" className="h-12 w-auto" />
      </div>

      <div className="relative z-10 flex items-center justify-center h-full">
        {!showOtpInput ? (
          // Login Form
          <form
            onSubmit={handleLogin}
            className="w-[400px] bg-black/75 backdrop-blur-md border border-white/10 rounded-2xl px-8 py-10 shadow-[0_0_60px_rgba(99,102,241,0.2)] flex flex-col items-center"
          >
            <h2 className="text-4xl font-bold text-white tracking-wide mb-8">
              Sign in
            </h2>

            <div className="w-full flex flex-col gap-4">
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 rounded-full bg-black/40 border border-white/10 px-5 text-sm text-gray-200 placeholder-gray-500 focus:border-white outline-none transition-all"
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 rounded-full bg-black/40 border border-white/10 px-5 text-sm text-gray-200 placeholder-gray-500 focus:border-white outline-none transition-all"
              />

              <div className="flex justify-end">
                <span
                  onClick={() => navigate("/reset-password")}
                  className="text-sm text-indigo-400 hover:underline cursor-pointer"
                >
                  Forgot Password?
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="mt-6 w-full h-11 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold tracking-wide shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
            >
              Continue
            </button>

            <p className="text-gray-400 text-sm mt-6">
              Don't have an account?
              <span
                onClick={() => navigate("/register")}
                className="ml-1 text-yellow-500 font-medium hover:underline cursor-pointer"
              >
                Sign up
              </span>
            </p>
          </form>
        ) : (
          // OTP Verification Form
          <form
            onSubmit={handleVerifyOtp}
            className="w-[400px] bg-black/75 backdrop-blur-md border border-white/10 rounded-2xl px-8 py-10 shadow-[0_0_60px_rgba(99,102,241,0.2)] flex flex-col items-center"
          >
            <h2 className="text-3xl font-bold text-white tracking-wide mb-4">
              Verify 2FA
            </h2>

            <p className="text-center text-indigo-300 text-sm mb-8">
              Enter the 6-digit OTP sent to {email}
            </p>

            <div className="w-full flex flex-col gap-4">
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                maxLength={6}
                className="w-full h-12 rounded-full bg-black/40 border border-white/10 px-5 text-sm text-gray-200 text-center placeholder-gray-500 focus:border-indigo-500 outline-none transition-all tracking-widest text-xl"
              />
            </div>

            <button
              type="submit"
              className="mt-6 w-full h-11 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold tracking-wide shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
            >
              Verify & Login
            </button>

            <p className="text-gray-400 text-sm mt-6">
              Didn't receive the code?
              <span
                onClick={() => {
                  setShowOtpInput(false);
                  setOtp("");
                }}
                className="ml-1 text-indigo-400 font-medium hover:underline cursor-pointer"
              >
                Back to Login
              </span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
