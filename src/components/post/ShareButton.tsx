"use client";

import { GoShareAndroid } from "react-icons/go";
import { useState } from "react";

interface ShareButtonProps {
  userNickname: string; // 게시물 작성자의 닉네임
}

const ShareButton = ({ userNickname }: ShareButtonProps) => {
  const [modal, setModal] = useState<{
    message: string;
    onConfirm?: () => void;
  } | null>(null);

  const handleShare = async () => {
    try {
      const url = `${window.location.origin}/profile/${encodeURIComponent(
        userNickname
      )}`;
      await navigator.clipboard.writeText(url);

      setModal({
        message: "📋 작성자 프로필 링크가 복사되었습니다!",
      });

      // 모달 닫기: 2초 후 자동 닫기
      setTimeout(() => setModal(null), 2000);
    } catch (err) {
      setModal({
        message: "❌ 복사 실패. 브라우저가 클립보드를 지원하지 않습니다.",
      });
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleShare}
        className="hover:scale-105 cursor-pointer p-0.5 active:text-gray-800 hover:text-blue-400 dark:active:text-blue-500"
      >
        <GoShareAndroid />
      </button>

      {modal && (
        <div className="absolute top-4 right-4 bg-gray-800 text-white text-xs px-3 py-2 rounded shadow-lg z-50">
          {modal.message}
        </div>
      )}
    </>
  );
};

export default ShareButton;
