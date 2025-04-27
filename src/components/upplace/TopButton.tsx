"use client";

import { useState, useEffect } from "react";

const TopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 100); // ✅ window 기준으로 수정
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" }); // ✅ window 기준으로 수정
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed z-50 bottom-8 right-8 px-4 py-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition cursor-pointer"
    >
      Top
    </button>
  );
};

export default TopButton;
