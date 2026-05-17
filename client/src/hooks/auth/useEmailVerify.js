import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { resendVerifyOtp, verifyAccount } from "../../api/authApi";
import { useOtpInput } from "./useOtpInput";

const normalizeEmail = (email = "") => String(email).trim().toLowerCase();

export const useEmailVerify = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setRef, handleInput, handleKeyDown, handlePaste, getValue } =
    useOtpInput(6);
  const [email, setEmail] = useState(() =>
    normalizeEmail(
      searchParams.get("email") || localStorage.getItem("verifyEmail") || "",
    ),
  );

  useEffect(() => {
    if (!email) {
      localStorage.removeItem("verifyEmail");
      return;
    }

    localStorage.setItem("verifyEmail", email);
  }, [email]);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    const otp = getValue();
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      return toast.error("Please enter your email.");
    }
    if (otp.length !== 6) {
      return toast.error("Please enter a valid 6-digit OTP");
    }

    const loadingToast = toast.loading("Verifying your email...");

    try {
      const { data } = await verifyAccount({ email: normalizedEmail, otp });

      if (data.success) {
        toast.update(loadingToast, {
          render: "Email verified successfully! Please login to continue.",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        localStorage.removeItem("verifyEmail");
        navigate("/login");
      } else {
        toast.update(loadingToast, {
          render: data.message || "Verification failed",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      }
    } catch (error) {
      toast.update(loadingToast, {
        render: error.response?.data?.message || "Verification failed",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  const onResendHandler = async () => {
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      return toast.error("Please enter your email first.");
    }

    const loadingToast = toast.loading("Sending a new OTP...");

    try {
      const { data } = await resendVerifyOtp({ email: normalizedEmail });

      toast.update(loadingToast, {
        render: data.message || "A new verification OTP has been sent.",
        type: data.success ? "success" : "error",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (error) {
      toast.update(loadingToast, {
        render: error.response?.data?.message || "Failed to resend OTP",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  return {
    email,
    setEmail,
    otpProps: { setRef, handleInput, handleKeyDown, handlePaste },
    onSubmitHandler,
    onResendHandler,
  };
};
