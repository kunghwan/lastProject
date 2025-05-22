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
  const main = document.querySelector("main");
  useEffect(() => {
    if (!main) return; // main 요소가 없으면 종료
    const handleScroll = () => {
      setIsVisible(main?.scrollTop! > 100); // 스크롤 위치가 100px 넘으면 표시
    };

    main.addEventListener("scroll", handleScroll); // 스크롤 이벤트 등록
    return () => main.removeEventListener("scroll", handleScroll); // 언마운트 시 제거
  }, []);

  // ✅ 클릭 시 페이지 상단으로 부드럽게 스크롤 이동
  const scrollToTop = useCallback(() => {
    main?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // 버튼 숨김 상태이면 아무것도 렌더링하지 않음
  if (!isVisible) return null;

  return (
    <button
      {...props}
      onClick={scrollToTop}
      className={twMerge(
        "fixed z-[30000] bottom-30  sm:right-10 right-3   px-4 py-2 bg-primary text-white rounded-full shadow-lg hover:bg-emerald-500 transition cursor-pointer  h-10 dark:bg-emerald-500 ",
        // "fixed z-40 bottom-10 right-8 md:right-10 lg:right-16 p-3 bg-primary text-white rounded-full shadow-lg hover:bg-emerald-500 transition cursor-pointer h-10  ",

        props?.className
      )}
    >
      <FaArrowUp />
    </button>
  );
};

export default TopButton;
