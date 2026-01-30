import axios from "axios";
import { assets } from "../assets/assets";
import { useRef, useContext } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";

const EmailVerify = () => {
  const { backendUrl } = useContext(AppContent);
  const navigate = useNavigate();
  const inputRefs = useRef([]);

  const email = localStorage.getItem("verifyEmail");

  const handleInput = (e, index) => {
    if (e.target.value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
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

    const otp = inputRefs.current.map((el) => el.value).join("");

    if (!email) {
      return toast.error("Email not found. Please register again.");
    }

    if (otp.length !== 6) {
      return toast.error("Please enter a valid 6-digit OTP");
    }

    const loadingToast = toast.loading("Verifying your email...");

    try {
      axios.defaults.withCredentials = true;

      const { data } = await axios.post(
        `${backendUrl}/api/auth/verify-account`,
        { email, otp },
        { withCredentials: true }
      );

      if (data.success) {
        toast.update(loadingToast, {
          render: "Email verified successfully! Please login to continue.",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });

        localStorage.removeItem("verifyEmail");
        
        // Redirect to login page instead of home
        navigate("/login");
      } else {
        toast.update(loadingToast, {
          render: data.message || "Verification failed",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      }
    } catch (err) {
      toast.update(loadingToast, {
        render: err.response?.data?.message || "Verification failed",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden">
      <img
        src="image.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-black/50"></div>

      <div className="absolute top-6 left-6 z-20">
        <img src={assets.logo} alt="Logo" className="h-12" />
      </div>

      <form
        onSubmit={onSubmitHandler}
        className="relative z-10 bg-slate-900/90 p-8 rounded-lg w-96"
      >
        <h1 className="text-white text-2xl font-semibold text-center mb-4">
          Verify Email
        </h1>

        <p className="text-center mb-6 text-indigo-300">
          Enter the 6-digit OTP sent to your email
        </p>

        <div className="flex justify-between mb-8" onPaste={handlePaste}>
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                className="w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md outline-none"
                ref={(el) => (inputRefs.current[index] = el)}
                onInput={(e) => handleInput(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
              />
            ))}
        </div>

        <button className="w-full py-3 rounded-full bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-all">
          Verify Email
        </button>

        <p className="text-center text-gray-400 text-sm mt-4">
          Didn't receive the code?{" "}
          <span className="text-indigo-400 cursor-pointer hover:underline">
            Resend
          </span>
        </p>
      </form>
    </div>
  );
};

export default EmailVerify;
