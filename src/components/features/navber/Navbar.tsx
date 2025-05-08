"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { FaRegMessage, FaPencil } from "react-icons/fa6";
import { IoPersonSharp, IoStarOutline, IoGridOutline } from "react-icons/io5";
import { twMerge } from "tailwind-merge";
import { AUTH } from "@/contextapi/context";
import { FaRegQuestionCircle } from "react-icons/fa";
import { IoMdArrowDropup } from "react-icons/io";

const navStyle =
  "hidden [@media(min-width:1425px)]:flex absolute w-16 top-10 -left-[125%] bg-gray-200 z-30 rounded-full transition-all duration-300";

const Navbar = () => {
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const { user } = AUTH.use();

  //! 로그인한 유저만 사용가능한 기능 필터
  const navBtnClick = useCallback(
    (btn: (typeof NavBtns)[number], index: number) => {
      const needsAuth = [2, 3, 4].includes(index);

      if (!user && needsAuth) {
        if (confirm("유저만 이용 가능한 기능입니다. 로그인 하시겠습니까?")) {
          router.push("/signin");
        }
        return;
      }

      if (btn.path) {
        router.push(btn.path);
      }
    },
    [user, router]
  );

  //! 토글 기능(키고 끄는 스위치)
  const handleToggleNavMenu = useCallback(() => {
    setIsNavMenuOpen((prev) => !prev);
  }, []);

  //! 무조건 창을 닫아야 하는 경우
  const closeNavMenu = useCallback(() => {
    setIsNavMenuOpen(false);
  }, []);

  return (
    <>
      <div className="flex relative">
        {!["/signin", "/signup"].includes(pathname!) && (
          <div className="mx-auto max-w-100">
            <div className="fixed w-full max-w-100 left-1/2 transform -translate-x-1/2">
              {/* 메뉴 열기 버튼 */}
              {!isNavMenuOpen && (
                <button
                  className={twMerge(
                    "h-16 flex items-center justify-center text-3xl outline-none dark:text-gray-600 ",
                    navStyle
                  )}
                  onClick={handleToggleNavMenu}
                >
                  <IoGridOutline className="hover:animate-pulse" />
                </button>
              )}

              {/* 메뉴 열렸을 때 */}
              {isNavMenuOpen && (
                <nav
                  className={twMerge(
                    navStyle,
                    "opacity-100 h-140 justify-between items-center py-5 overflow-hidden"
                  )}
                >
                  <ul className="flex flex-col justify-between items-center w-full h-full">
                    <li className="flex justify-center text-4xl dark:text-gray-600">
                      <button onClick={closeNavMenu}>
                        <IoMdArrowDropup />
                      </button>
                    </li>
                    {NavBtns.map((btn, index) => (
                      <li key={index}>
                        <button
                          className={twMerge(
                            "grayButton flex flex-col gap-y-1.5 items-center text-gray-600 transition-opacity duration-300",
                            pathname === btn.path && "text-green-500"
                          )}
                          onClick={() => navBtnClick(btn, index)}
                        >
                          {btn.icon}
                          <p className="text-xs">{btn.name}</p>
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}
            </div>
          </div>
        )}

        {/* 모바일 하단 네비게이션 */}
        {!["/signin", "/signup"].includes(pathname!) && (
          <nav className="fixed bottom-0 left-0 h-[10vh] right-0 bg-gray-200 z-[5] flex justify-around items-center [@media(min-width:1425px)]:hidden rounded-t-2xl max-w-300 mx-auto">
            <ul className="flex justify-around w-full">
              {NavBtns.map((btn, index) => (
                <li key={index}>
                  <button
                    className={twMerge(
                      "grayButton text-2xl flex flex-col gap-y-1.5 items-center",
                      pathname === btn.path && "text-green-500"
                    )}
                    onClick={() => navBtnClick(btn, index)}
                  >
                    {btn.icon}
                    <p className="text-black text-xs">{btn.name}</p>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </>
  );
};

export default Navbar;

const NavBtns = [
  { name: "Q&A", icon: <FaRegQuestionCircle />, path: "/customer" },
  { name: "추천", icon: <IoStarOutline />, path: "/upplace" },
  { name: "피드", icon: <FaRegMessage />, path: "/feed" },
  { name: "글쓰기", icon: <FaPencil />, path: "/profile/create" },
  { name: "MY", icon: <IoPersonSharp />, path: "/profile" },
];
