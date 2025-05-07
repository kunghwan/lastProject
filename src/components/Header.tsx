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

// 초기 로딩 시 다크 모드 적용
const storedDarkMode =
  typeof window !== "undefined" ? localStorage.getItem("darkMode") : null;
if (storedDarkMode === "true") {
  document.documentElement.classList.add("dark");
}

const Header = () => {
  const [isDarkMode, setIsDarkMode] = useState(
    storedDarkMode === "true" || false
  ); //  초기 상태 설정
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, signout } = AUTH.use();
  const isAuthPage = useMemo(
    () => ["/signin", "/signup"].includes(pathname!),
    [pathname]
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    localStorage.setItem("darkMode", isDarkMode.toString());
  }, [isDarkMode]);

  const toggleDarkMode = useCallback(() => setIsDarkMode((prev) => !prev), []);
  const logout = useCallback(() => {
    if (confirm("로그아웃 하시겠습니까?")) {
      signout();
      alert("로그아웃 되었습니다.");
      router.push("/");
    }
  }, [signout, router]);

  const headerButtons = useMemo(() => {
    const buttons = [];
    if (user) {
      buttons.push(
        {
          icon: <IoBookmarkOutline />,
          onClick: () => router.push("/bookmark"),
        },
        {
          icon: (
            <div className="relative text-2xl">
              <IoNotificationsOutline />
              {hasUnread && (
                <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-red-600 border border-white" />
              )}
            </div>
          ),
          onClick: () => setTimeout(() => router.push("/notification"), 100),
        }
      );
    }
    buttons.push({
      icon: isDarkMode ? <IoMoon /> : <IoSunny />,
      onClick: toggleDarkMode,
      className: twMerge(
        headBtn,
        isDarkMode ? "text-gray-800" : "text-white bg-black"
      ),
    });
    if (!isAuthPage) {
      buttons.push({
        label: user ? "로그아웃" : "로그인",
        onClick: () => (user ? logout() : router.push("/signin")),
        className: "text-2xl font-bold h-14 ",
      });
    }
    return buttons;
  }, [user, isDarkMode, toggleDarkMode, logout, isAuthPage, router, hasUnread]);

  useEffect(() => {
    if (!user) return;
    const checkUnread = async () => {
      try {
        const snapshot = await dbService
          .collection("users")
          .doc(user.uid)
          .collection("notification")
          .where("isRead", "==", false)
          .limit(1)
          .get();
        setHasUnread(!snapshot.empty);
      } catch (error) {
        console.error("알림 체크 에러:", error);
      }
    };
    window.checkUnreadNotifications = checkUnread;
    checkUnread();
  }, [user]);

  return (
    <>
      <header className="flex items-center justify-between my-4 px-4 lg:max-w-300 mx-auto border-b-2 border-gray-300 pb-4">
        <Link
          href="/"
          className="hover:opacity-80 flex justify-center items-center gap-x-2"
        >
          <Image
            src={isDarkMode ? "/image/whitelogo1.PNG" : "/image/logo1.PNG"}
            alt="logo"
            height={80}
            width={80}
          />
          <div>
            <p className="text-2xl font-bold">방방</p>
            <p className="text-2xl font-bold">콕콕</p>
          </div>
        </Link>

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

        <div className="sm:hidden">
          {isAuthPage ? (
            <button
              onClick={toggleDarkMode}
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
