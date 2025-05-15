"use client";

import { useCallback } from "react";
import {
  IoMoon,
  IoSunny,
  IoCloseSharp,
  IoBookmarkOutline,
  IoNotificationsOutline,
} from "react-icons/io5";
import { useRouter } from "next/navigation";
import { AUTH } from "@/contextapi/context";
import { twMerge } from "tailwind-merge";
import { useAlertModal } from "@/components/AlertStore";

// 모바일 전용 헤더 메뉴 (모달 기반)
interface MobileHeaderProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  hasUnread: boolean;
}

const MobileHeader = ({
  isDarkMode,
  toggleDarkMode,
  isMenuOpen,
  setIsMenuOpen,
  hasUnread,
}: MobileHeaderProps) => {
  const router = useRouter();
  const { user, signout } = AUTH.use();
  const { openAlert } = useAlertModal();

  // 메뉴 닫기 공통 함수
  const closeMenu = () => setIsMenuOpen(false);

  // 버튼 클릭 시 해당 경로로 이동 및 메뉴 닫기
  const handleNavigate = useCallback(
    (path: string) => {
      router.push(path);
      closeMenu();
    },
    [router]
  );

  // 로그아웃 버튼 클릭 시 모달 표시
  const handleLogoutClick = () => {
    openAlert("정말로 로그아웃 하시겠습니까?", [
      { text: "아니요" },
      {
        text: "네",
        isGreen: true,
        autoFocus: true,
        onClick: performLogout,
      },
    ]);
    closeMenu();
  };

  // 로그아웃 실행: 유저 상태 제거 + 메인페이지 이동
  const performLogout = () => {
    signout();
    router.push("/");
    closeMenu();
  };

  // 버튼 스타일 공통 클래스 정의
  const baseBtnClass =
    "w-full grayButton dark:bg-[#333333] dark:text-[#F1F5F9]";
  const largeBtnClass = twMerge(
    baseBtnClass,
    "mb-2 text-xl flex items-center justify-center"
  );
  const smallBtnClass = twMerge(
    baseBtnClass,
    "mt-2 text-lg font-bold sm:hidden"
  );

  // 알림 아이콘, 읽지 않은 알림 표시
  const notificationIcon = (
    <div className="relative text-3xl">
      <IoNotificationsOutline />
      {hasUnread && (
        <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-red-600 border border-white" />
      )}
    </div>
  );

  // 다크모드 전환 아이콘
  const themeIcon = (
    <span className="text-3xl">{isDarkMode ? <IoMoon /> : <IoSunny />}</span>
  );

  // 로그인된 유저를 위한 버튼 목록
  const loggedInButtons = [
    {
      onClick: () => handleNavigate("/bookmark"),
      icon: <IoBookmarkOutline className="text-3xl" />,
    },
    {
      onClick: () => setTimeout(() => handleNavigate("/notification"), 100),
      icon: notificationIcon,
    },
    { onClick: handleLogoutClick, label: "로그아웃", className: smallBtnClass },
  ];

  // 비로그인 유저를 위한 버튼 목록
  const loggedOutButtons = [
    {
      onClick: () => handleNavigate("/signin"),
      label: "로그인",
      className: smallBtnClass,
    },
    {
      onClick: () => handleNavigate("/signup"),
      label: "회원가입",
      className: smallBtnClass,
    },
  ];

  const isUserBtn = user ? loggedInButtons : loggedOutButtons;

  return (
    <>
      {/* 모바일 메뉴 오픈 시 표시되는 전체 메뉴 */}
      {isMenuOpen && (
        <div className="fixed h-screen w-full bg-gray-500/50 z-50 flex items-center justify-center sm:hidden">
          <div className="bg-white dark:bg-gray-300 p-6 rounded-xl shadow-lg w-[65vw] max-w-sm text-center flex flex-col justify-center">
            {/* 닫기 버튼 */}
            <div className="flex justify-end mb-2">
              <button onClick={closeMenu} className="text-2xl">
                <IoCloseSharp className="dark:text-black m-1 text-3xl" />
              </button>
            </div>

            {/* 로그인된 유저 닉네임 표시 */}
            {user && (
              <div className="text-3xl font-bold whitespace-nowrap flex justify-center mb-4 text-black">
                <div className="max-w-40 truncate">{user.nickname}</div>
                <p className="font-medium">님</p>
              </div>
            )}

            {/* 버튼 목록 렌더링 */}
            <div>
              {isUserBtn.map((btn, index) => (
                <button
                  key={index}
                  onClick={btn.onClick}
                  className={twMerge(btn.className ?? largeBtnClass)}
                >
                  {btn.label ?? btn.icon}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileHeader;
