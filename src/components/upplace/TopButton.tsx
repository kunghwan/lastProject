"use client";

import { useState, useEffect, useCallback, ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

interface Props extends ComponentProps<"button"> {
  buttonClassName?: string;
}

const TopButton = ({ buttonClassName, ...props }: Props) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 100); // ✅ window 기준으로 수정
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (!isVisible) return null;

  return (
    <button
      {...props}
      onClick={scrollToTop}
      className={twMerge(
        "fixed z-40 bottom-30 right-1 px-4 py-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition cursor-pointer  sm:right-1 h-10",
        props?.className
      )}
    >
      Top
    </button>
  );
};

export default TopButton;
