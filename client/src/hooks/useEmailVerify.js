import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useOtpInput } from "./useOtpInput";
import { verifyAccount } from "../api/authApi";

/**
 * useEmailVerify
 * Toàn bộ logic cho trang EmailVerify:
 * - Lấy email từ localStorage
 * - Xử lý submit OTP
 * - Điều hướng sau khi verify thành công
 *
 * @returns {{ email, otpProps, onSubmitHandler }}
 *   otpProps: { setRef, handleInput, handleKeyDown, handlePaste }
 */
export const useEmailVerify = () => {
  const navigate = useNavigate();
  const { setRef, handleInput, handleKeyDown, handlePaste, getValue } = useOtpInput(6);

  const email = localStorage.getItem("verifyEmail");

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    const otp = getValue();

    if (!email) return toast.error("Email not found. Please register again.");
    if (otp.length !== 6) return toast.error("Please enter a valid 6-digit OTP");

    const loadingToast = toast.loading("Verifying your email...");
    try {
      const { data } = await verifyAccount({ email, otp });

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
    } catch (err) {
      toast.update(loadingToast, {
        render: err.response?.data?.message || "Verification failed",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  return {
    email,
    otpProps: { setRef, handleInput, handleKeyDown, handlePaste },
    onSubmitHandler,
  };
};
