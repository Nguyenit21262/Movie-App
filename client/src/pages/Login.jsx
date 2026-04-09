import React, { useState, useContext } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { AppContent } from "../context/AppContent";
import { toast } from "react-toastify";
import { loginUser, verifyLoginOtp } from "../api/authApi";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getUserData } = useContext(AppContent);

  const [form, setForm] = useState({ email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateLoginForm = () => {
    if (!form.email.trim() || !form.password.trim()) {
      toast.error("Please fill in all fields");
      return false;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateLoginForm()) return;

    setLoading(true);
    try {
      const { data } = await loginUser(form);

      if (data.success && data.require2FA) {
        toast.success("OTP sent to your email");
        setShowOtpInput(true);
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      return toast.error("Please enter a valid 6-digit OTP");
    }

    setLoading(true);
    try {
      const { data } = await verifyLoginOtp({ email: form.email, otp });

      if (!data.success) {
        toast.error(data.message || "OTP verification failed");
        return;
      }

      const userData = await getUserData(); // cập nhật context

      if (!userData) {
        toast.error("Failed to load user profile");
        return;
      }

      toast.success("Login successful");

      // Phân quyền redirect
      if (userData.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        // Quay về trang trước đó nếu có, không thì về Home
        const from = location.state?.from?.pathname || "/";
        navigate(from, { replace: true });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      {/* Background Image */}
      <img
        src="image.png"
        alt="cinema-bg"
        className="absolute inset-0 w-full h-full object-cover opacity-60"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/40 backdrop-blur-[2px]" />

      {/* Logo */}
      <div className="absolute top-6 left-6 z-20 flex items-center">
        <img src={assets.logo} alt="Cinema Logo" className="h-12 w-auto" />
      </div>

      {/* Form Container */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        {!showOtpInput ? (
          <LoginForm
            form={form}
            loading={loading}
            handleChange={handleChange}
            handleLogin={handleLogin}
            navigate={navigate}
          />
        ) : (
          <OtpForm
            email={form.email}
            otp={otp}
            setOtp={setOtp}
            loading={loading}
            handleVerifyOtp={handleVerifyOtp}
            setShowOtpInput={setShowOtpInput}
          />
        )}
      </div>
    </div>
  );
};

const LoginForm = ({ form, loading, handleChange, handleLogin, navigate }) => (
  <form
    onSubmit={handleLogin}
    className="flex w-full max-w-[400px] flex-col items-center rounded-2xl border border-white/10 bg-black/75 px-6 py-10 backdrop-blur-md shadow-[0_0_60px_rgba(59,130,246,0.25)] sm:px-8"
  >
    <h2 className="text-4xl font-bold text-white tracking-wide mb-8">
      Sign in
    </h2>

    <div className="w-full flex flex-col gap-4">
      <input
        type="email"
        name="email"
        placeholder="Email Address"
        value={form.email}
        onChange={handleChange}
        disabled={loading}
        className="w-full h-12 rounded-full bg-black/40 border border-white/10 px-5 text-sm text-gray-200 placeholder-gray-500 focus:border-blue-500 outline-none transition-all disabled:opacity-50"
      />

      <input
        type="password"
        name="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}
        disabled={loading}
        className="w-full h-12 rounded-full bg-black/40 border border-white/10 px-5 text-sm text-gray-200 placeholder-gray-500 focus:border-blue-500 outline-none transition-all disabled:opacity-50"
      />

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => navigate("/reset-password")}
          className="text-sm text-blue-400 hover:text-blue-300 hover:underline transition-colors"
        >
          Forgot Password?
        </button>
      </div>
    </div>

    <button
      type="submit"
      disabled={loading}
      className="mt-6 w-full h-11 rounded-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-semibold tracking-wide shadow-lg shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? "Loading..." : "Continue"}
    </button>

    <p className="text-gray-400 text-sm mt-6">
      Don't have an account?
      <button
        type="button"
        onClick={() => navigate("/register")}
        className="ml-1 text-yellow-500 font-medium hover:text-yellow-400 hover:underline transition-colors"
      >
        Sign up
      </button>
    </p>
  </form>
);

const OtpForm = ({
  email,
  otp,
  setOtp,
  loading,
  handleVerifyOtp,
  setShowOtpInput,
}) => {
  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(value);
  };

  const handleBackToLogin = () => {
    setShowOtpInput(false);
    setOtp("");
  };

  return (
    <form
      onSubmit={handleVerifyOtp}
      className="flex w-full max-w-[400px] flex-col items-center rounded-2xl border border-white/10 bg-black/75 px-6 py-10 backdrop-blur-md shadow-[0_0_60px_rgba(59,130,246,0.25)] sm:px-8"
    >
      <h2 className="text-3xl font-bold text-white tracking-wide mb-4">
        Verify OTP
      </h2>

      <p className="text-center text-blue-300 text-sm mb-8">
        Enter the OTP sent to{" "}
        <span className="font-semibold text-white">{email}</span>
      </p>

      <input
        type="text"
        placeholder="Enter OTP"
        value={otp}
        onChange={handleOtpChange}
        disabled={loading}
        maxLength={6}
        autoFocus
        className="w-full h-12 rounded-md bg-black/40 border border-white/10 px-5 text-sm text-gray-200 text-center placeholder-gray-500 focus:border-blue-500 outline-none transition-all tracking-widest text-xl disabled:opacity-50"
      />

      <button
        type="submit"
        disabled={loading || otp.length !== 6}
        className="mt-6 w-full h-11 rounded-md bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-semibold tracking-wide shadow-lg shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Verifying..." : "Verify & Login"}
      </button>

      <p className="text-gray-400 text-sm mt-6">
        Didn't receive the code?
        <button
          type="button"
          onClick={handleBackToLogin}
          disabled={loading}
          className="ml-1 text-blue-400 font-medium hover:text-blue-300 hover:underline transition-colors disabled:opacity-50"
        >
          Back to Login
        </button>
      </p>
    </form>
  );
};

export default Login;
