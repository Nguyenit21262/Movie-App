import React, { useState, useEffect, useRef } from "react";

const LazySection = ({ children, fetchData }) => {
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect(); // Chỉ fetch 1 lần duy nhất
        }
      },
      { rootMargin: "200px" }, // Kích hoạt sớm 200px trước khi hiện ra
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isInView) fetchData();
  }, [isInView, fetchData]);

  return (
    <div ref={containerRef} className="min-h-[300px]">
      {children}
    </div>
  );
};

export default LazySection;
