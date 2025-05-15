"use client";

import { useState, useEffect, useCallback, ComponentProps } from "react";
import { twMerge } from "tailwind-merge";
import { FaArrowUp } from "react-icons/fa6";

// ✅ 컴포넌트 prop 타입 정의
interface Props extends ComponentProps<"button"> {
  buttonClassName?: string; // 커스텀 버튼 클래스 이름 (옵션)
}

// ✅ TopButton 컴포넌트 정의
const TopButton = ({ buttonClassName, ...props }: Props) => {
  const [isVisible, setIsVisible] = useState(false); // 버튼 표시 여부 상태

  // ✅ 스크롤 이벤트로 버튼 노출 제어
  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 100); // 스크롤 위치가 100px 넘으면 표시
    };

    window.addEventListener("scroll", handleScroll); // 스크롤 이벤트 등록
    return () => window.removeEventListener("scroll", handleScroll); // 언마운트 시 제거
  }, []);

  // ✅ 클릭 시 페이지 상단으로 부드럽게 스크롤 이동
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // 버튼 숨김 상태이면 아무것도 렌더링하지 않음
  if (!isVisible) return null;

  return (
    <button
      {...props}
      onClick={scrollToTop}
      className={twMerge(
        "fixed z-40 bottom-30 right-1 px-4 py-2 bg-primary text-white rounded-full shadow-lg hover:bg-emerald-500 transition cursor-pointer sm:right-1 h-10 dark:bg-emerald-500 ",

        props?.className
      )}
    >
      <FaArrowUp />
    </button>
  );
};

export default TopButton;
