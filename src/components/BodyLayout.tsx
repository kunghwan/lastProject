"use client";

import Navbar from "@/components/features/navber/Navbar";
import Header from "./Header";
import { PropsWithChildren } from "react";

const BodyLayout = ({ children }: PropsWithChildren) => {
  return (
    <>

      {/* <header className="flex items-center justify-between my-4 lg:max-w-300 lg:mx-auto ">
        <Link href={"/"} className="hover:opacity-80 mx-5">
          <Image src="/image/logo1.PNG" alt="logo" height={100} width={100} />
        </Link>

        <ul className="flex-row gap-x-5 flex mx-5 justify-center items-center">
          {user && (
            <div className="text-4xl flex items-end font-bold">
              {user.name}
              <p className="font-extralight">님</p>
            </div>
          )}
          <button
            onClick={() => setIsDarkMode((prev) => !prev)}
            className={twMerge(
              "navButton h-15 w-15 text-white",
              isDarkMode ? "bg-blue-400" : "bg-red-400"
            )}
          >
            {isDarkMode ? <IoMoon /> : <IoSunny />}
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

          {!["/signin", "/signup"].includes(pathname) && (
            <>
              {user ? (
                <button
                  className="navButton font-bold text-xl"
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
                  className="navButton font-bold text-xl h-15"
                  onClick={() => router.push("/signin")}
                >
                  로그인
                </button>
              )}
            </>
          )}
        </ul>
      </header> */}

      <div className="w-full h-0.5 bg-teal-100 mx-auto" />

      {/* <div className="w-full h-0.5 bg-teal-100 mx-auto" /> */}

      {/* <Navbar />

      <main className="flex-1 overflow-y-auto">{children}</main> */}


      <Header />
      <Navbar />
      <main>{children}</main>
    </>
  );
};

export default BodyLayout;
