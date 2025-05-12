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

  //! 로그아웃 하는 기능
  const handleLogout = useCallback(() => {
    signout();
    router.push("/");
    setIsMenuOpen(false); // 로그아웃 후 메뉴 닫기
  }, [signout, router, setIsMenuOpen]);

  //! 버튼 클릭 시 해당 경로로 이동하는 기능
  const handleNavigate = useCallback(
    (path: string) => {
      router.push(path);
      setIsMenuOpen(false); // 해당 경로로 가면 메뉴가 꺼지게 하는 기능
    },
    [router, setIsMenuOpen]
  );

  // 긴 tailwind css 따로 변수화
  const largeButtonClass =
    "w-full mb-2 grayButton dark:bg-[#333333] dark:text-[#F1F5F9] text-xl flex items-center justify-center";
  const smallButtonClass =
    "w-full mt-2 text-lg font-bold sm:hidden grayButton dark:bg-[#333333] dark:text-[#F1F5F9]";
  const notificationRedDot =
    "absolute top-0 right-0 h-3 w-3 rounded-full bg-red-600 border border-white";

  //! map으로 뿌릴 객체
  const commonItems = [
    {
      icon: isDarkMode ? <IoMoon /> : <IoSunny />,
      onClick: toggleDarkMode,
      className: isDarkMode
        ? "text-gray-800"
        : "text-black bg-gray-200 dark:bg-[#333333] dark:text-[#F1F5F9]",
    },
  ];

  return (
    <>
      {isMenuOpen && (
        <div className="fixed h-screen w-full bg-gray-500/50 z-50 flex items-center justify-center sm:hidden">
          <div className="bg-white dark:bg-gray-300 p-6 rounded-xl shadow-lg w-[65vw] max-w-sm text-center">
            <div className="flex justify-end mb-1 ">
              <button onClick={() => setIsMenuOpen(false)} className="text-2xl">
                <IoCloseSharp className="dark:text-black m-1 text-3xl" />
              </button>
            </div>

            {user && (
              <div className="text-3xl font-bold whitespace-nowrap flex justify-center mb-3 text-black">
                <div className="max-w-40 truncate">{user.nickname}</div>
                <p className="font-medium">님</p>
              </div>
            )}

            {user ? (
              <>
                <button
                  onClick={() => handleNavigate("/bookmark")}
                  className={largeButtonClass}
                >
                  <IoBookmarkOutline className="text-3xl" />
                </button>
                <button
                  onClick={() =>
                    setTimeout(() => handleNavigate("/notification"), 100)
                  }
                  className={largeButtonClass}
                >
                  <div className="relative text-3xl">
                    <IoNotificationsOutline />
                    {hasUnread && <span className={notificationRedDot} />}
                  </div>
                </button>
              </>
            ) : null}

            {commonItems.map((item, idx) => (
              <button
                key={idx}
                onClick={item.onClick}
                className={twMerge(largeButtonClass, item.className)}
              >
                <span className="text-3xl">{item.icon}</span>
              </button>
            ))}

            <button
              onClick={user ? handleLogout : () => handleNavigate("/signin")}
              className={smallButtonClass}
            >
              {user ? "로그아웃" : "로그인"}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileHeader;
