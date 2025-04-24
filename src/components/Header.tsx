"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { IoMoon, IoSunny, IoBookmarkOutline } from "react-icons/io5";
import { VscBell } from "react-icons/vsc";
import { usePathname, useRouter } from "next/navigation";
import { AUTH } from "@/contextapi/context";
import { twMerge } from "tailwind-merge";

const Header = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const { user, signout } = AUTH.use();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <>
      <header className="flex items-center justify-between my-4 max-w-full px-4 lg:max-w-300 mx-auto border-b-2 border-gray-300 pb-4 ">
        {/* 다크모드 일때 로고 스타일 변경 */}
        {!isDarkMode ? (
          <Link href="/" className="hover:opacity-80">
            <Image src="/image/logo1.PNG" alt="logo" height={80} width={80} />
          </Link>
        ) : (
          <Link href="/" className="hover:opacity-80">
            <Image
              src="/image/whitelogo1.PNG"
              alt="logo"
              height={80}
              width={80}
            />
          </Link>
        )}

        <ul className="flex items-center gap-x-3 sm:gap-x-5">
          {/* 로그인했을경우 버튼 나오게 및 반응형  */}
          {user && (
            <div className="hidden sm:flex text-base sm:text-2xl font-bold items-end max-w-[100px] truncate whitespace-nowrap overflow-hidden">
              {user.name}
              <p className="font-light text-sm sm:text-base ml-1">님</p>
            </div>
          )}

          {user && (
            <div className="flex gap-x-2 sm:gap-x-4">
              <button className="grayButton text-xl sm:text-2xl">
                <IoBookmarkOutline />
              </button>
              <button className="grayButton text-xl sm:text-2xl">
                <VscBell />
              </button>
            </div>
          )}

          {/*  다크모드 구현 */}
          <button
            onClick={() => setIsDarkMode((prev) => !prev)}
            className={twMerge(
              "grayButton text-white text-xl sm:text-2xl  ",
              isDarkMode ? " text-gray-800" : "bg-black"
            )}
          >
            {isDarkMode ? <IoMoon /> : <IoSunny />}
          </button>

          {/* 로그인과 로그아웃 구현 */}
          {!["/signin", "/signup"].includes(pathname) && (
            <>
              {user ? (
                <button
                  className="grayButton text-sm sm:text-base font-bold h-14"
                  onClick={() => {
                    if (window.confirm("로그아웃하시겠습니까?")) {
                      signout();
                      alert("로그아웃되었습니다.");
                      router.push("/");
                    }
                  }}
                >
                  로그아웃
                </button>
              ) : (
                <button
                  className="grayButton text-sm sm:text-base font-bold h-14 "
                  onClick={() => router.push("/signin")}
                >
                  로그인
                </button>
              )}
            </>
          )}
        </ul>
      </header>
    </>
  );
};

export default Header;
