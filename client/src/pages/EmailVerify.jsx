import axios from "axios";
import { assets } from "../assets/assets";
import { useRef, useContext } from "react";
import { toast } from "react-toastify";
import { AppContent } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const EmailVerify = () => {
  axios.defaults.withCredentials = true;

  const { backendUrl, isLoggedIn, userData, getUserData } =
    useContext(AppContent);

  const navigate = useNavigate();
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
    const paste = e.clipboardData.getData("text").slice(0, 6);
    paste.split("").forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }
    });
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      const otp = inputRefs.current.map((el) => el.value).join("");

      const { data } = await axios.post(
        `${backendUrl}/api/auth/verify-account`,
        { otp },
      );

      if (!data.success) {
        return toast.error(data.message);
      }

      toast.success(data.message);
      await getUserData();
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Verify failed");
    }
  };

  useEffect(() => {
    if (!isLoggedIn) navigate("/login");
    else if (userData && userData.isAccountVerified) navigate("/");
  }, [isLoggedIn, userData]);

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden">
      {/* BACKGROUND IMAGE */}
      <img
        src="image.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* LOGO */}
      <div className="absolute top-6 left-6 z-20 flex items-center">
        <img src={assets.logo} alt="Cinema Logo" className="h-12 w-auto" />
      </div>

      {/* FORM */}
      <form
        onSubmit={onSubmitHandler}
        className="relative z-10 bg-slate-900/90 p-8 rounded-lg w-96 text-sm"
      >
        <h1 className="text-white text-2xl font-semibold text-center mb-4">
          Email Verify Otp
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
                type="text"
                maxLength="1"
                required
                className="w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md outline-none focus:ring-2 focus:ring-indigo-400"
                ref={(e) => (inputRefs.current[index] = e)}
                onInput={(e) => handleInput(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
              />
            ))}
        </div>
        <button
          className="w-full py-3 rounded-full
              bg-gray-800
              text-white font-medium
              tracking-wide
              hover:opacity-90 transition"
        >
          Verify Email
        </button>
      </form>
    </div>
  );
};

export default EmailVerify;
