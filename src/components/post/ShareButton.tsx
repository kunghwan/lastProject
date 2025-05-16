"use client";

import { GoShareAndroid } from "react-icons/go";
import { usePathname } from "next/navigation";
import { useAlertModal } from "../AlertStore";

interface ShareButtonProps {
  userNickname: string; // 게시물 작성자 닉네임
}

const ShareButton = ({ userNickname }: ShareButtonProps) => {
  const { openAlert } = useAlertModal();
  const pathname = usePathname();

  const handleShare = async () => {
    const profileUrl = `${window.location.origin}/profile/${encodeURIComponent(
      userNickname
    )}`;

    openAlert("해당 유저의 프로필 링크를 \n복사할까요?", [
      {
        text: "확인",
        isGreen: true,
        autoFocus: true,
        onClick: async () => {
          try {
            await navigator.clipboard.writeText(profileUrl);
            openAlert("📋 프로필 링크가 복사되었습니다!");
          } catch (err) {
            openAlert("❌ 복사 실패. 브라우저가 클립보드를 지원하지 않습니다.");
          }
        },
      },
      {
        text: "취소",
        isGreen: false,
      },
    ]);
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
