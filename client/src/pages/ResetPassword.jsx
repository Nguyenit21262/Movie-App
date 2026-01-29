import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { useState, useRef, useContext } from "react";
import { AppContent } from "../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";

const ResetPassword = () => {
  const { backendUrl } = useContext(AppContent);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isOtpSubmitted, setIsOtpSubmitted] = useState(false);

  const inputRefs = useRef([]);

  const handleInput = (e, index) => {
    if (e.target.value && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && e.target.value === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").slice(0, 6);
    paste.split("").forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }
    });
  };

  const onSubmitEmail = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/auth/sent-reset-otp`,
        { email },
        { withCredentials: true }
      );
      if (data.success) {
        toast.success(data.message);
        setIsEmailSent(true);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Send OTP failed");
    }
  };

  const onSubmitOtp = (e) => {
    e.preventDefault();
    const otpValue = inputRefs.current.map((e) => e.value).join("");
    if (otpValue.length !== 6) {
      return toast.error("OTP must be 6 digits");
    }
    setOtp(otpValue);
    setIsOtpSubmitted(true);
  };

  const onSubmitNewPassword = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/auth/reset-password`,
        { email, otp, newPassword },
        { withCredentials: true }
      );
      if (data.success) {
        toast.success(data.message);
        navigate("/login");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Reset password failed");
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden">
      <img
        src="image.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="absolute top-6 left-6 z-20 flex items-center">
        <img src={assets.logo} alt="Cinema Logo" className="h-12 w-auto" />
      </div>

      {!isEmailSent && (
        <form
          onSubmit={onSubmitEmail}
          className="md:w-[400px] w-[320px] bg-black/75 backdrop-blur-md border border-white/10 rounded-2xl px-8 py-10 shadow-[0_0_60px_rgba(99,102,241,0.2)] flex flex-col items-center"
        >
          <h2 className="text-4xl font-bold text-white tracking-wide">
            Reset Password
          </h2>

          <p className="text-sm text-gray-400 mt-3 text-center">
            Enter your email to reset your password
          </p>

          <div className="w-full mt-8 flex flex-col gap-4">
            <input
              type="email"
              placeholder="Type your Email"
              className="w-full h-12 rounded-full bg-black/40 border border-white/10 px-5 text-sm text-gray-200 placeholder-gray-500 focus:border-indigo-500 outline-none transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              className="mt-6 w-full h-11 rounded-full bg-indigo-600 text-white font-medium tracking-wide hover:bg-indigo-700 transition-all"
            >
              Submit
            </button>
          </div>
        </form>
      )}

      {isEmailSent && !isOtpSubmitted && (
        <form
          onSubmit={onSubmitOtp}
          className="relative z-10 bg-black/75 backdrop-blur-md p-8 rounded-lg w-96 text-sm"
        >
          <h1 className="text-white text-2xl font-semibold text-center mb-4">
            Reset password Otp
          </h1>

          <p className="text-center mb-6 text-indigo-300">
            Enter the 6-digit code sent to your email
          </p>

          <div className="flex justify-between mb-8" onPaste={handlePaste}>
            {Array(6)
              .fill(0)
              .map((_, index) => (
                <input
                  key={index}
                  type="tel"
                  inputMode="numeric"
                  maxLength="1"
                  required
                  className="w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md outline-none focus:ring-2 focus:ring-indigo-400"
                  ref={(e) => (inputRefs.current[index] = e)}
                  onInput={(e) => handleInput(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                />
              ))}
          </div>
          <button className="w-full py-3 rounded-full bg-indigo-600 text-white font-medium tracking-wide hover:bg-indigo-700 transition-all">
            Verify Email
          </button>
        </form>
      )}

      {isOtpSubmitted && (
        <form
          onSubmit={onSubmitNewPassword}
          className="md:w-[400px] w-[320px] bg-black/75 backdrop-blur-md border border-white/10 rounded-2xl px-8 py-10 shadow-[0_0_60px_rgba(99,102,241,0.2)] flex flex-col items-center"
        >
          <h2 className="text-4xl font-bold text-white tracking-wide">
            New Password
          </h2>

          <p className="text-sm text-gray-400 mt-3 text-center">
            Enter the new password for your account
          </p>

          <div className="w-full mt-8 flex flex-col gap-4">
            <input
              type="password"
              placeholder="Type your new password"
              className="w-full h-12 rounded-full bg-black/40 border border-white/10 px-5 text-sm text-gray-200 placeholder-gray-500 focus:border-indigo-500 outline-none transition-all"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              className="mt-6 w-full h-11 rounded-full bg-indigo-600 text-white font-medium tracking-wide hover:bg-indigo-700 transition-all"
            >
              Submit
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ResetPassword;
