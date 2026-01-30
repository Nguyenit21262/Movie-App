import React, { useState, useContext } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const Register = () => {
  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContent);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [sex, setSex] = useState("");
  const [currentCity, setCurrentCity] = useState("");
  const [occupation, setOccupation] = useState("");

  const handleDobChange = (e) => {
    let value = e.target.value.replace(/[^\d]/g, "");
    if (value.length >= 3 && value.length <= 4) {
      value = value.slice(0, 2) + "/" + value.slice(2);
    } else if (value.length > 4) {
      value =
        value.slice(0, 2) + "/" + value.slice(2, 4) + "/" + value.slice(4, 8);
    }
    setDateOfBirth(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !name ||
      !email ||
      !password ||
      !confirmPassword ||
      !dateOfBirth ||
      !currentCity ||
      !occupation ||
      !sex
    ) {
      return toast.error("Please fill in all required fields");
    }

    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateOfBirth)) {
      return toast.error("Date of birth must be in DD/MM/YYYY format");
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

      const { data } = await axios.post(`${backendUrl}/api/auth/register`, {
        name,
        email,
        password,
        dateOfBirth,
        currentCity,
        occupation,
        sex,
      });

      if (data.success) {
        localStorage.setItem("verifyEmail", email);
        toast.update(loadingToast, {
          render: "Account created successfully! Please verify your email",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
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
        <form
          onSubmit={handleSubmit}
          className="md:w-[700px] w-[340px] bg-black/75 backdrop-blur-md border border-white/10 rounded-2xl px-8 py-10 shadow-[0_0_60px_rgba(99,102,241,0.2)] flex flex-col items-center"
        >
          <h2 className="text-4xl font-bold text-white tracking-wide">
            Sign up
          </h2>

          <div className="w-full mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-12 rounded-full bg-black/40 border border-white/10 px-5 text-sm text-gray-200 placeholder-gray-500 focus:border-indigo-500 outline-none transition-all"
              />

              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 rounded-full bg-black/40 border border-white/10 px-5 text-sm text-gray-200 placeholder-gray-500 focus:border-indigo-500 outline-none transition-all"
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 rounded-full bg-black/40 border border-white/10 px-5 text-sm text-gray-200 placeholder-gray-500 focus:border-indigo-500 outline-none transition-all"
              />

              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-12 rounded-full bg-black/40 border border-white/10 px-5 text-sm text-gray-200 placeholder-gray-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Date of Birth (DD/MM/YYYY)"
                value={dateOfBirth}
                onChange={handleDobChange}
                maxLength={10}
                className="w-full h-12 rounded-full bg-black/40 border border-white/10 px-5 text-sm text-gray-200 placeholder-gray-500 focus:border-indigo-500 outline-none transition-all"
              />

              <select
                value={sex}
                onChange={(e) => setSex(e.target.value)}
                className="w-full h-12 rounded-full bg-black/40 border border-white/10 px-5 text-sm text-gray-300 focus:border-indigo-500 outline-none transition-all appearance-none"
              >
                <option value="" disabled>
                  Select Sex
                </option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>

              <input
                type="text"
                placeholder="Current City"
                value={currentCity}
                onChange={(e) => setCurrentCity(e.target.value)}
                className="w-full h-12 rounded-full bg-black/40 border border-white/10 px-5 text-sm text-gray-200 placeholder-gray-500 focus:border-indigo-500 outline-none transition-all"
              />

              <input
                type="text"
                placeholder="Occupation"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="w-full h-12 rounded-full bg-black/40 border border-white/10 px-5 text-sm text-gray-200 placeholder-gray-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
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
