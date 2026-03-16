import { useRef, useCallback } from "react";

/**
 * useOtpInput
 * Quản lý toàn bộ logic cho OTP input gồm nhiều ô riêng lẻ.
 *
 * @param {number} length - số ô OTP (mặc định 6)
 * @returns {{ setRef, handleInput, handleKeyDown, handlePaste, getValue, reset }}
 */
export const useOtpInput = (length = 6) => {
  const inputRefs = useRef([]);

  const setRef = useCallback((el, index) => {
    inputRefs.current[index] = el;
  }, []);

  const handleInput = useCallback(
    (e, index) => {
      if (e.target.value && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [length]
  );

  const handleKeyDown = useCallback((e, index) => {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }, []);

  const handlePaste = useCallback(
    (e) => {
      const paste = e.clipboardData.getData("text").slice(0, length);
      paste.split("").forEach((char, i) => {
        if (inputRefs.current[i]) {
          inputRefs.current[i].value = char;
        }
      });
    },
    [length]
  );

  const getValue = useCallback(
    () => inputRefs.current.map((el) => el?.value ?? "").join(""),
    []
  );

  const reset = useCallback(() => {
    inputRefs.current.forEach((el) => {
      if (el) el.value = "";
    });
    inputRefs.current[0]?.focus();
  }, []);

  return { setRef, handleInput, handleKeyDown, handlePaste, getValue, reset };
};