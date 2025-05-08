"use client";
import { GoShareAndroid } from "react-icons/go";
import { usePathname } from "next/navigation";

const ShareButton = () => {
  const pathname = usePathname(); // 현재 경로 가져오기

  const handleShare = async () => {
    try {
      const url = `${window.location.origin}${pathname}`;
      await navigator.clipboard.writeText(url);
      alert("📋 게시물 링크가 복사되었습니다!");
    } catch (err) {
      alert("❌ 복사 실패. 브라우저가 클립보드를 지원하지 않습니다.");
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="hover:scale-105 cursor-pointer p-0.5 active:text-gray-800 hover:text-blue-400 dark:active:text-blue-500"
    >
      <GoShareAndroid />
    </button>
  );
};

export default ShareButton;
