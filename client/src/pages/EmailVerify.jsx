import { assets } from "../assets/assets";
import { useEmailVerify } from "../hooks/useEmailVerify";

const EmailVerify = () => {
  const { otpProps, onSubmitHandler } = useEmailVerify();
  const { setRef, handleInput, handleKeyDown, handlePaste } = otpProps;

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
          Enter the OTP sent to your email
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
                ref={(el) => setRef(el, index)}
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
