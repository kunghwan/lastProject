"use client";

import Image from "next/image";
import Link from "next/link";
import { PropsWithChildren, useEffect, useState } from "react";
import { IoMoon, IoSunny, IoBookmarkOutline } from "react-icons/io5";
import { VscBell } from "react-icons/vsc";
import { useRouter } from "next/navigation";
import Navbar from "@/components/features/navber/Navbar";

const ProjectLayout = ({ children }: PropsWithChildren) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLogin, setIsLogin] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <>
      <header className="flex items-center justify-between my-4 lg:max-w-300 lg:mx-auto ">
        <Link href={"/"} className="hover:opacity-80">
          <Image src="/image/logo.png" alt="logo" height={120} width={120} />
        </Link>
        <ul className="flex-row gap-x-5 flex text-2xl">
          <button
            onClick={() => setIsDarkMode((prev) => !prev)}
            className="themeButton w-15 h-15"
          >
            {isDarkMode ? <IoSunny className="text-red-400" /> : <IoMoon />}
          </button>

          {isLogin && (
            <div className="flex gap-x-5">
              <button className="themeButton h-15 w-15">
                <IoBookmarkOutline />
              </button>
              <button className="themeButton h-15 w-15">
                <VscBell />
              </button>
            </div>
          )}

          <button
            className="themeButton"
            onClick={() => router.push("/signin")}
          >
            로그인
          </button>
        </ul>
      </header>

      <div className="w-300 h-0.5 bg-teal-100 mx-auto" />

      <main>{children}</main>

      <Navbar />
    </>
  );
};

export default ProjectLayout;
