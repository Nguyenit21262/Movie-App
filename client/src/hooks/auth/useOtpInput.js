import { useRef, useCallback } from "react";

export const useOtpInput = (length = 6) => {
  const inputRefs = useRef([]);

  const setRef = useCallback((element, index) => {
    inputRefs.current[index] = element;
  }, []);

  const handleInput = useCallback(
    (event, index) => {
      if (event.target.value && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [length],
  );

  const handleKeyDown = useCallback((event, index) => {
    if (event.key === "Backspace" && !event.target.value && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }, []);

  const handlePaste = useCallback(
    (event) => {
      const paste = event.clipboardData.getData("text").slice(0, length);
      paste.split("").forEach((char, index) => {
        if (inputRefs.current[index]) {
          inputRefs.current[index].value = char;
        }
      });
    },
    [length],
  );

  const getValue = useCallback(
    () => inputRefs.current.map((element) => element?.value ?? "").join(""),
    [],
  );

  const reset = useCallback(() => {
    inputRefs.current.forEach((element) => {
      if (element) element.value = "";
    });
    inputRefs.current[0]?.focus();
  }, []);

  return { setRef, handleInput, handleKeyDown, handlePaste, getValue, reset };
};
