"use client";

import Image from "next/image";
import Link from "next/link";
import { PropsWithChildren, useEffect, useState } from "react";
import { IoMoon, IoSunny, IoBookmarkOutline } from "react-icons/io5";
import { VscBell } from "react-icons/vsc";
import { useRouter } from "next/navigation";
import Navbar from "@/components/features/navber/Navbar";
import { AUTH } from "@/contextapi/context";

const ProjectLayout = ({ children }: PropsWithChildren) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const router = useRouter();
  const { user } = AUTH.use();

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
        {!isDarkMode ? (
          <Link href={"/"} className="hover:opacity-80">
            <Image src="/image/logoc.PNG" alt="logo" height={100} width={100} />
          </Link>
        ) : (
          <Link href={"/"} className="hover:opacity-80">
            <Image
              src="/image/whiteLogo.png"
              alt="logo"
              height={100}
              width={100}
            />
          </Link>
        )}

        <ul className="flex-row gap-x-5 flex">
          <button
            onClick={() => setIsDarkMode((prev) => !prev)}
            className="themeButton h-15 w-15"
          >
            {isDarkMode ? <IoSunny className="text-red-400 " /> : <IoMoon />}
          </button>

          {user && (
            <div className="flex gap-x-5">
              <button className="themeButton h-15 w-15">
                <IoBookmarkOutline />
              </button>
              <button className="themeButton h-15 w-15">
                <VscBell />
              </button>
            </div>
          )}

          {user ? (
            <button className="themeButton font-bold text-xl">로그아웃</button>
          ) : (
            <button
              className="themeButton font-bold text-xl"
              onClick={() => router.push("/signin")}
            >
              로그인
            </button>
          )}
        </ul>
      </header>

      <div className="w-300 h-0.5 bg-teal-100 mx-auto" />

      <Navbar />

      <main>{children}</main>
    </>
  );
};

export default ProjectLayout;
