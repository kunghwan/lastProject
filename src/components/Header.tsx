"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  IoMoon,
  IoSunny,
  IoBookmarkOutline,
  IoMenu,
  IoCloseSharp,
  IoNotificationsOutline,
} from "react-icons/io5";
import { usePathname, useRouter } from "next/navigation";
import { AUTH } from "@/contextapi/context";
import { twMerge } from "tailwind-merge";
import Navbar from "./features/navber/Navbar";
import { dbService } from "@/lib";

const headBtn = "grayButton text-xl sm:text-2xl";
const darkText = "grayButton w-full dark:bg-[#333333] dark:text-[#F1F5F9]";

const Header = () => {
  const [isDarkMode, setIsDarkMode] = useState(false); //! 다크모드
  const [isMenuOpen, setIsMenuOpen] = useState(false); //! 메뉴 오픈
  const [hasUnread, setHasUnread] = useState(false); //! 알림창 읽음 여부

  const router = useRouter();
  const pathname = usePathname();
  const { user, signout } = AUTH.use();

  const isAuthPage = useMemo(() => {
    return ["/signin", "/signup"].includes(pathname!);
  }, [pathname]);

  useEffect(() => {
    const storedDarkMode = localStorage.getItem("darkMode");
    if (storedDarkMode === "true") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    localStorage.setItem("darkMode", isDarkMode.toString());
  }, [isDarkMode]);

  const handleDarkModeToggle = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  const handleLogout = useCallback(() => {
    if (confirm("로그아웃 하시겠습니까?")) {
      signout();
      alert("로그아웃 되었습니다.");
      router.push("/");
    }
  }, [signout, router]);

  // 데스크탑 + 모바일 버튼 목록 정리
  const headerButtons = useMemo(() => {
    const buttons = [];

    //! 로그인 했을때 보이는 버튼
    if (user) {
      buttons.push(
        {
          icon: <IoBookmarkOutline />,
          onClick: () => router.push("/map"),
        },
        {
          icon: (
            <div className="relative">
              <IoNotificationsOutline />
              {hasUnread && pathname !== "/notification" && (
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500" />
              )}
            </div>
          ),
          onClick: () => {
            setHasUnread(false);
            router.push("/notification");
          },
        }
      );
    }

    // 다크모드 구현 버튼
    buttons.push({
      icon: isDarkMode ? <IoMoon /> : <IoSunny />,
      onClick: handleDarkModeToggle,
      className: twMerge(
        headBtn,
        isDarkMode ? "text-gray-800" : "text-white bg-black"
      ),
    });

    // 로그인/로그아웃 버튼
    if (!isAuthPage) {
      buttons.push({
        label: user ? "로그아웃" : "로그인",
        onClick: () => (user ? handleLogout() : router.push("/signin")),
        className: "text-2xl font-bold h-14 ",
      });
    }

    return buttons;
  }, [
    user,
    isDarkMode,
    handleDarkModeToggle,
    handleLogout,
    isAuthPage,
    router,
  ]);

  useEffect(() => {
    if (!user) return;

    const checkUnreadNotifications = async () => {
      const snapshot = await dbService
        .collection("users")
        .doc(user.uid)
        .collection("notification")
        .where("isRead", "==", false) // 읽지 않은 것만
        .limit(1) // 하나만 찾아도 있으면 true로 설정
        .get();

      setHasUnread(!snapshot.empty);
    };

    checkUnreadNotifications();

    // 선택: 일정 시간마다 새로 체크할 수도 있어요 (ex. 30초마다)
    // const interval = setInterval(checkUnreadNotifications, 30000);
    // return () => clearInterval(interval);
  }, [user]);

  return (
    <>
      <header className="flex items-center justify-between my-4 px-4 lg:max-w-300 mx-auto border-b-2 border-gray-300 pb-4">
        <Link
          href="/"
          className="hover:opacity-80 flex justify-center items-center"
        >
          <Image
            src={isDarkMode ? "/image/whitelogo1.PNG" : "/image/logo1.PNG"}
            alt="logo"
            height={80}
            width={80}
          />
        </Link>

        {/* 데스크탑 메뉴 */}
        <ul className="hidden sm:flex items-center gap-x-4">
          {user && (
            <div className="text-2xl font-bold whitespace-nowrap flex">
              <div className="max-w-40 truncate">{user.nickname}</div>
              <p>님</p>
            </div>
          )}
          {headerButtons.map((btn, index) => (
            <li key={index}>
              <button
                onClick={btn.onClick}
                className={btn.className || headBtn}
              >
                {btn.icon || btn.label}
              </button>
            </li>
          ))}
        </ul>

        {/* 모바일 메뉴 버튼 */}
        <div className="sm:hidden">
          {isAuthPage ? (
            <button
              onClick={handleDarkModeToggle}
              className={twMerge(
                "grayButton text-xl",
                isDarkMode ? "text-gray-800" : "text-white bg-black"
              )}
            >
              {isDarkMode ? <IoMoon /> : <IoSunny />}
            </button>
          ) : (
            <button
              onClick={() => setIsMenuOpen(true)}
              className="text-4xl mx-2"
            >
              <IoMenu />
            </button>
          )}
        </div>
      </header>

      {/* 모바일 팝업 메뉴 */}
      {isMenuOpen && !isAuthPage && (
        <div className="fixed inset-0 bg-gray-500/50 z-50 flex items-center justify-center sm:hidden">
          <div className="bg-white dark:bg-gray-300 p-6 rounded-xl shadow-lg w-[65vw] max-w-sm text-center">
            <div className="flex justify-end mb-1">
              <button onClick={() => setIsMenuOpen(false)} className="text-2xl">
                <IoCloseSharp className="dark:text-black" />
              </button>
            </div>

            {user && (
              <div className="text-2xl font-bold whitespace-nowrap flex justify-center mb-3 text-black">
                <div className="max-w-40 truncate">{user.nickname}</div>
                <p>님</p>
              </div>
            )}
            {headerButtons.map((btn, idx) => (
              <button
                key={idx}
                onClick={() => {
                  btn.onClick();
                  setIsMenuOpen(false);
                }}
                className={twMerge(
                  "w-full mb-2 ",
                  darkText,
                  btn.icon ? darkText : "mt-2 text-2xl font-bold sm:hidden"
                )}
              >
                {btn.icon || btn.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <Navbar />
    </>
  );
};

export default Header;
