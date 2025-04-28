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

const Header = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  const { user, signout } = AUTH.use();

  const isAuthPage = ["/signin", "/signup"].includes(pathname!);

  const headBtn = "grayButton text-xl sm:text-2xl";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const handleLogout = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
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
        <ul className="hidden sm:flex items-center gap-x-4">
          {user && (
            <>
              <div className="text-2xl font-bold whitespace-nowrap flex">
                <div className="max-w-40 truncate">{user.nickname}</div>
                <p>님</p>
              </div>

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
              onClick={() => setIsDarkMode(!isDarkMode)}
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
                className="grayButton text-sm font-bold h-14"
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
              onClick={() => setIsDarkMode(!isDarkMode)}
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
          <div className="bg-white dark:bg-gray-400 p-6 rounded-xl shadow-lg w-[65vw] max-w-sm text-center">
            <div className="flex justify-end mb-1">
              <button onClick={() => setIsMenuOpen(false)} className="text-2xl">
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
                  className="grayButton w-full mb-2"
                  onClick={() => {
                    router.push("/map");
                    setIsMenuOpen(false);
                  }}
                >
                  <IoBookmarkOutline />
                </button>
                <button
                  className="grayButton w-full mb-2"
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
              className="grayButton w-full mb-2"
              onClick={() => {
                setIsDarkMode(!isDarkMode);
                setIsMenuOpen(false);
              }}
            >
              {isDarkMode ? <IoMoon /> : <IoSunny />}
            </button>

            <button
              className="grayButton w-full mt-2 text-lg"
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
