"use client";

import Image from "next/image";
import Link from "next/link";
import { PropsWithChildren, useEffect, useState } from "react";
import { IoMoon, IoSunny, IoBookmarkOutline } from "react-icons/io5";
import { VscBell } from "react-icons/vsc";
import { useRouter } from "next/navigation";
import Navbar from "@/components/features/navber/Navbar";
import { AUTH } from "@/contextapi/context";

const BodyLayout = ({ children }: PropsWithChildren) => {
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
        <Link href={"/"} className="hover:opacity-80 mx-5">
          <Image src="/image/logo1.PNG" alt="logo" height={100} width={100} />
        </Link>

        <ul className="flex-row gap-x-5 flex mx-5">
          <button
            onClick={() => setIsDarkMode((prev) => !prev)}
            className="navButton h-15 w-15"
          >
            {isDarkMode ? <IoSunny className="text-red-400 " /> : <IoMoon />}
          </button>

          {user && (
            <div className="flex gap-x-5">
              <button className="navButton h-15 w-15">
                <IoBookmarkOutline />
              </button>
              <button className="navButton h-15 w-15">
                <VscBell />
              </button>
            </div>
          )}

          {user ? (
            <button
              className="navButton font-bold text-xl"
              onClick={() => router.push("/")}
            >
              로그아웃
            </button>
          ) : (
            <button
              className="navButton font-bold text-xl"
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

export default BodyLayout;
