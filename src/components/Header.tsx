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
      <header className="flex items-center justify-between my-4 max-w-full px-4 lg:max-w-300 mx-auto">
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
          {user && (
            <div className="hidden sm:flex text-base sm:text-2xl font-bold items-end max-w-[100px] truncate whitespace-nowrap overflow-hidden">
              {user.name}
              <p className="font-light text-sm sm:text-base ml-1">님</p>
            </div>
          )}

          <button
            onClick={() => setIsDarkMode((prev) => !prev)}
            className={twMerge(
              "grayButton text-white text-xl sm:text-2xl p-2 rounded-full",
              isDarkMode ? "bg-blue-400 text-amber-300" : "bg-red-400"
            )}
          >
            {isDarkMode ? <IoMoon /> : <IoSunny />}
          </button>

          {user && (
            <div className="flex gap-x-2 sm:gap-x-4">
              <button className="grayButton p-2 text-xl sm:text-2xl">
                <IoBookmarkOutline />
              </button>
              <button className="grayButton p-2 text-xl sm:text-2xl">
                <VscBell />
              </button>
            </div>
          )}

          {!["/signin", "/signup"].includes(pathname) && (
            <>
              {user ? (
                <button
                  className="grayButton text-sm sm:text-base font-bold p-2"
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
                  className="grayButton text-sm sm:text-base font-bold p-2"
                  onClick={() => router.push("/signin")}
                >
                  로그인
                </button>
              )}
            </>
          )}
        </ul>
      </header>
      <div className="w-full h-0.5 bg-teal-100 mx-auto" />
    </>
  );
};

export default Header;
