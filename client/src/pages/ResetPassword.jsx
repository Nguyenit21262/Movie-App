import React, { useState, useContext } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContent);

  const [email, setEmail] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (!email) {
      return toast.error("Please enter your email");
    }

    const loadingToast = toast.loading("Sending reset OTP...");

    try {
      axios.defaults.withCredentials = true;

      const { data } = await axios.post(
        `${backendUrl}/api/auth/send-reset-otp`,
        { email }
      );

      if (data.success) {
        toast.update(loadingToast, {
          render: "OTP sent to your email. Please check your inbox.",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        setShowOtpInput(true);
      } else {
        toast.update(loadingToast, {
          render: data.message || "Failed to send OTP",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      }
    } catch (error) {
      toast.update(loadingToast, {
        render:
          error.response?.data?.message ||
          "Failed to send OTP. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!otp || !newPassword || !confirmPassword) {
      return toast.error("Please fill in all fields");
    }

    if (otp.length !== 6) {
      return toast.error("Please enter a valid 6-digit OTP");
    }

    if (newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters long");
    }

    if (newPassword !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    const loadingToast = toast.loading("Resetting password...");

    try {
      axios.defaults.withCredentials = true;

      const { data } = await axios.post(
        `${backendUrl}/api/auth/reset-password`,
        { email, otp, newPassword }
      );

      if (data.success) {
        toast.update(loadingToast, {
          render: "Password reset successfully! Please login with your new password.",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });

        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        toast.update(loadingToast, {
          render: data.message || "Failed to reset password",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      }
    } catch (error) {
      toast.update(loadingToast, {
        render:
          error.response?.data?.message ||
          "Failed to reset password. Please try again.",
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
          // Email Input Form
          <form
            onSubmit={handleSendOtp}
            className="w-[400px] bg-black/75 backdrop-blur-md border border-white/10 rounded-2xl px-8 py-10 shadow-[0_0_60px_rgba(99,102,241,0.2)] flex flex-col items-center"
          >
            <h2 className="text-3xl font-bold text-white tracking-wide mb-4">
              Reset Password
            </h2>

            <p className="text-center text-gray-400 text-sm mb-8">
              Enter your email to receive a password reset OTP
            </p>

            <div className="w-full flex flex-col gap-4">
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 rounded-full bg-black/40 border border-white/10 px-5 text-sm text-gray-200 placeholder-gray-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              className="mt-6 w-full h-11 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold tracking-wide shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
            >
              Send OTP
            </button>

            <p className="text-gray-400 text-sm mt-6">
              Remember your password?
              <span
                onClick={() => navigate("/login")}
                className="ml-1 text-yellow-500 font-medium hover:underline cursor-pointer"
              >
                Back to Login
              </span>
            </p>
          </form>
        ) : (
          // OTP and New Password Form
          <form
            onSubmit={handleResetPassword}
            className="w-[400px] bg-black/75 backdrop-blur-md border border-white/10 rounded-2xl px-8 py-10 shadow-[0_0_60px_rgba(99,102,241,0.2)] flex flex-col items-center"
          >
            <h2 className="text-3xl font-bold text-white tracking-wide mb-4">
              Reset Password
            </h2>

            <p className="text-center text-indigo-300 text-sm mb-8">
              Enter OTP sent to {email} and your new password
            </p>

            <div className="w-full flex flex-col gap-4">
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                className="w-full h-12 rounded-full bg-black/40 border border-white/10 px-5 text-sm text-gray-200 text-center placeholder-gray-500 focus:border-indigo-500 outline-none transition-all tracking-widest"
              />

              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full h-12 rounded-full bg-black/40 border border-white/10 px-5 text-sm text-gray-200 placeholder-gray-500 focus:border-indigo-500 outline-none transition-all"
              />

              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-12 rounded-full bg-black/40 border border-white/10 px-5 text-sm text-gray-200 placeholder-gray-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              className="mt-6 w-full h-11 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold tracking-wide shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
            >
              Reset Password
            </button>

            <p className="text-gray-400 text-sm mt-6">
              Didn't receive the code?
              <span
                onClick={() => {
                  setShowOtpInput(false);
                  setOtp("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                className="ml-1 text-indigo-400 font-medium hover:underline cursor-pointer"
              >
                Resend OTP
              </span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
