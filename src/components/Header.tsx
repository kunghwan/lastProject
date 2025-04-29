"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
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

const headBtn = "grayButton text-xl sm:text-2xl";

const darkText = "grayButton w-full dark:bg-[#333333] dark:text-[#F1F5F9]";

const Header = () => {
  // 처음 시작은 라이트 모드 (false) 로 설정
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const { user, signout } = AUTH.use();

  //! useMemo로
  const isAuthPage = ["/signin", "/signup"].includes(pathname!);

  useEffect(() => {
    // 페이지 로드시 로컬 스토리지에서 다크 모드 설정 읽어오기
    const storedDarkMode = localStorage.getItem("darkMode");
    if (storedDarkMode === "true") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []); // 빈 의존성 배열로 초기 로드 시에만 실행

  useEffect(() => {
    // isDarkMode 상태가 변경될 때마다 document 클래스 토글 및 로컬 스토리지 업데이트
    document.documentElement.classList.toggle("dark", isDarkMode);
    localStorage.setItem("darkMode", isDarkMode.toString());
  }, [isDarkMode]);

  //! usecallback으로 하기
  const handleDarkModeToggle = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleLogout = () => {
    if (confirm("로그아웃 하시겠습니까?")) {
      signout();
      alert("로그아웃 되었습니다.");
      router.push("/");
    }
  };

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
          {/* <p className="text-bold">방방콕콕</p> */}
        </Link>

        {/* 데스크탑 메뉴 */}
        <ul className="hidden sm:flex items-center gap-x-4 ">
          {user && (
            <>
              <div className="text-2xl font-bold whitespace-nowrap flex">
                <div className="max-w-40 truncate">{user.nickname}</div>
                <p>님</p>
              </div>
              {/* headButton 컴포넌트로 만들기 */}
              <li>
                <button className={headBtn} onClick={() => router.push("/map")}>
                  <IoBookmarkOutline />
                </button>
              </li>
              <li>
                <button
                  className={headBtn}
                  onClick={() => router.push("/notification")}
                >
                  <IoNotificationsOutline />
                </button>
              </li>
            </>
          )}
          <li>
            <button
              onClick={handleDarkModeToggle}
              className={twMerge(
                headBtn,
                isDarkMode ? "text-gray-800" : "text-white bg-black"
              )}
            >
              {isDarkMode ? <IoMoon /> : <IoSunny />}
            </button>
          </li>
          {!isAuthPage && (
            <li>
              <button
                className="text-2xl font-bold h-14"
                onClick={() => (user ? handleLogout() : router.push("/signin"))}
              >
                {user ? "로그아웃" : "로그인"}
              </button>
            </li>
          )}
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
          <div className="bg-white dark:bg-gray-300  p-6 rounded-xl shadow-lg w-[65vw] max-w-sm text-center ">
            <div className="flex justify-end mb-1">
              <button
                onClick={() => setIsMenuOpen(false)}
                className="text-2xl "
              >
                <IoCloseSharp className="dark:text-black" />
              </button>
            </div>

            {user && (
              <>
                <div className="text-2xl font-bold whitespace-nowrap flex justify-center mb-3 text-black ">
                  <div className="max-w-40 truncate">{user.nickname}</div>
                  <p>님</p>
                </div>

                <button
                  className="grayButton dark:bg-[#333333] dark:text-[#F1F5F9] w-full mb-2"
                  onClick={() => {
                    router.push("/map");
                    setIsMenuOpen(false);
                  }}
                >
                  <IoBookmarkOutline />
                </button>

                <button
                  className="grayButton w-full mb-2 dark:bg-[#333333] dark:text-[#F1F5F9]"
                  onClick={() => {
                    router.push("/notification");
                    setIsMenuOpen(false);
                  }}
                >
                  <IoNotificationsOutline />
                </button>
              </>
            )}

            <button
              className={twMerge("mb-2", darkText)}
              onClick={() => {
                handleDarkModeToggle();
                setIsMenuOpen(false);
              }}
            >
              {isDarkMode ? <IoMoon /> : <IoSunny />}
            </button>

            <button
              className={twMerge("mt-2 text-xl font-bold sm:hidden", darkText)}
              onClick={() => {
                user ? handleLogout() : router.push("/signin");
                setIsMenuOpen(false);
              }}
            >
              {user ? "로그아웃" : "로그인"}
            </button>
          </div>
        </div>
      )}
      <Navbar />
    </>
  );
};

export default Header;
