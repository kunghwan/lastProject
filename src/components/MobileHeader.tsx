"use client";

import { useCallback, useState } from "react";
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
import AlertModal from "@/components/AlertModal";

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
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false); // 로그아웃 모달 상태

  //! 버튼 클릭 시 해당 경로로 이동하는 기능
  const handleNavigate = useCallback(
    (path: string) => {
      router.push(path);
      setIsMenuOpen(false); // 해당 경로로 가면 메뉴가 꺼지게 하는 기능
    },
    [router, setIsMenuOpen]
  );

  //! 모달 닫기
  const handleCloseModal = useCallback(() => {
    setIsLogoutModalOpen(false);
  }, [setIsLogoutModalOpen]);

  //! 로그아웃 버튼 클릭 시 모달 열기 및 메뉴 닫기
  const handleLogoutClick = useCallback(() => {
    setIsLogoutModalOpen(true);
    setIsMenuOpen(false); // 메뉴 닫기
  }, [setIsLogoutModalOpen, setIsMenuOpen]);

  //! 로그아웃 처리 함수
  const performLogout = useCallback(() => {
    signout();
    router.push("/");
    setIsMenuOpen(false); // 로그아웃 후 메뉴 닫기
    setIsLogoutModalOpen(false); // 모달 닫기
  }, [signout, router, setIsMenuOpen]);

  // 긴 tailwind css 따로 변수화
  const largeButtonClass =
    "w-full mb-2 grayButton dark:bg-[#333333] dark:text-[#F1F5F9] text-xl flex items-center justify-center";
  const smallButtonClass =
    "w-full mt-2 text-lg font-bold sm:hidden grayButton dark:bg-[#333333] dark:text-[#F1F5F9]";
  const notificationRedDot =
    "absolute top-0 right-0 h-3 w-3 rounded-full bg-red-600 border border-white";

  // 로그인한 사용자를 위한 버튼 목록
  const loggedInButtons = [
    {
      onClick: () => handleNavigate("/bookmark"),
      icon: <IoBookmarkOutline className="text-3xl" />,
    },
    {
      onClick: () => setTimeout(() => handleNavigate("/notification"), 100),
      icon: (
        <div className="relative text-3xl">
          <IoNotificationsOutline />
          {hasUnread && <span className={notificationRedDot} />}
        </div>
      ),
    },
    {
      onClick: toggleDarkMode,
      icon: (
        <span className="text-3xl">
          {isDarkMode ? <IoMoon /> : <IoSunny />}
        </span>
      ),
    },
    {
      onClick: handleLogoutClick,
      label: "로그아웃",
      className: smallButtonClass,
    },
  ];

  // 로그인하지 않은 사용자를 위한 버튼 목록
  const loggedOutButtons = [
    {
      onClick: toggleDarkMode,
      icon: (
        <span className="text-3xl">
          {isDarkMode ? <IoMoon /> : <IoSunny />}
        </span>
      ),
    },
    {
      onClick: () => handleNavigate("/signin"),
      label: "로그인",
      className: smallButtonClass,
    },
  ];

  const buttonsToRender = user ? loggedInButtons : loggedOutButtons;

  return (
    <>
      {isLogoutModalOpen && (
        <AlertModal
          message="정말로 로그아웃 하시겠습니까?"
          onClose={handleCloseModal}
          onConfirm={performLogout}
          showCancel={true}
        />
      )}

      {isMenuOpen && (
        <div className="fixed h-screen w-full bg-gray-500/50 z-50 flex items-center justify-center sm:hidden">
          <div className="bg-white dark:bg-gray-300 p-6 rounded-xl shadow-lg w-[65vw] max-w-sm text-center flex flex-col justify-center">
            <div className="flex justify-end mb-2 ">
              <button onClick={() => setIsMenuOpen(false)} className="text-2xl">
                <IoCloseSharp className="dark:text-black m-1 text-3xl" />
              </button>
            </div>

            {user && (
              <div className="text-3xl font-bold whitespace-nowrap flex justify-center mb-4 text-black">
                <div className="max-w-40 truncate">{user.nickname}</div>
                <p className="font-medium">님</p>
              </div>
            )}

            <div>
              {buttonsToRender.map((button, index) => (
                <button
                  key={index}
                  onClick={button.onClick}
                  className={twMerge(
                    button.className ? button.className : largeButtonClass,
                    button.icon ? largeButtonClass : "" // 아이콘 있는 버튼은 largeButtonClass 적용
                  )}
                >
                  {button.icon ? button.icon : button.label}
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
