"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useCallback, useMemo } from "react";
import { twMerge } from "tailwind-merge";
import { AUTH } from "@/contextapi/context";
import { IoPersonSharp, IoStar, IoMenu } from "react-icons/io5";
import {
  FaMessage,
  FaPencil,
  FaCircleQuestion,
  FaCaretUp,
} from "react-icons/fa6";
import { useAlertModal } from "@/components/AlertStore";

const Navbar = () => {
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
  const [isGridMenuVisible, setIsGridMenuVisible] = useState(true);

  const router = useRouter();
  const pathname = usePathname();
  const { user } = AUTH.use();
  const { openAlert } = useAlertModal(); // AlertModal 전역 제어

  const NavBtns = useMemo(
    () => [
      { name: "Q&A", icon: <FaCircleQuestion />, path: "/customer" },
      { name: "추천", icon: <IoStar />, path: "/upplace" },
      { name: "피드", icon: <FaMessage />, path: "/feed" },
      { name: "글쓰기", icon: <FaPencil />, path: "/profile/create" },
      { name: "MY", icon: <IoPersonSharp />, path: "/profile" },
    ],
    []
  );

  // 버튼 클릭 시 로그인 여부 확인 및 모달 호출
  const navBtnClick = useCallback(
    (btn: (typeof NavBtns)[0], index: number) => {
      const needsAuth = [3, 4].includes(index); //글쓰기, MY는 로그인 필요
      if (!user && needsAuth) {
        openAlert(
          "유저만 이용 가능한 기능입니다.\n로그인 하시겠습니까?",
          [
            { text: "아니요" },
            {
              text: "네",
              isGreen: true,
              autoFocus: true,
              onClick: () => router.push("/signin"),
            },
          ],
          "로그인이 필요 필요합니다."
        );
        return;
      }
      if (btn.path) router.push(btn.path);
    },
    [user, router, openAlert]
  );

  const handleToggleNavMenu = useCallback(() => {
    setIsNavMenuOpen((prev) => !prev);
    setIsGridMenuVisible((prev) => !prev);
  }, []);

  const closeNavMenu = useCallback(() => {
    setIsNavMenuOpen(false);
    setTimeout(() => setIsGridMenuVisible(true), 100);
  }, []);

  const baseNavStyle =
    "[@media(min-width:1402px)]:flex absolute w-17 top-45 -left-[125%] bg-gray-50 z-30 rounded-full duration-400 ease-in-out transform dark:bg-[#444444] dark:text-white";

  return (
    <>
      <div className="flex relative">
        {/* 로그인/회원가입 페이지에서는 네비게이션 숨김 */}
        {!["/signin", "/signup", "/idfind", "/pwfind"].includes(pathname!) && (
          <div className="mx-auto max-w-100">
            <div className="fixed w-full max-w-100 left-1/2 transform -translate-x-1/2">
              {/* 데스크탑용 메뉴 토글 버튼 */}
              <div className="hidden [@media(min-width:1402px)]:block">
                {!isNavMenuOpen && isGridMenuVisible && (
                  <button
                    className={twMerge(
                      baseNavStyle,
                      "opacity-100 scale-100 translate-y-0 items-center justify-center h-17 transition-none"
                    )}
                    onClick={handleToggleNavMenu}
                  >
                    <IoMenu className="hover:animate-pulse text-3xl text-primary" />
                  </button>
                )}
              </div>

              {/* 데스크탑용 메뉴 리스트 */}
              <nav
                className={twMerge(
                  baseNavStyle,
                  "flex-col justify-between items-center py-5 h-140 overflow-hidden origin-top hidden [@media(min-width:1402px)]:block",
                  isNavMenuOpen
                    ? "scale-100 opacity-100 translate-y-0 transition-transform duration-300"
                    : "scale-0 opacity-0 -translate-y-0 pointer-events-none"
                )}
              >
                <ul className="flex flex-col justify-between items-center w-full h-full transition-opacity duration-300">
                  <li className="flex justify-center text-4xl dark:text-white">
                    <button onClick={closeNavMenu}>
                      <FaCaretUp className="hover:animate-pulse text-3xl hover:text-primary " />
                    </button>
                  </li>
                  {NavBtns.map((btn, index) => (
                    <li
                      key={index}
                      className="dark:bg-[#444444] dark:text-[#E5E7EB]"
                    >
                      <button
                        className={twMerge(
                          "flex flex-col gap-y-1.5 items-center justify-center text-3xl p-3 hover:opacity-80 hover:text-primary",
                          pathname === btn.path &&
                            "text-primary dark:text-primary"
                        )}
                        onClick={() => navBtnClick(btn, index)}
                      >
                        {btn.icon}
                        <p className="text-sm font-normal">{btn.name}</p>
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        )}

        {/* 모바일 하단 네비게이션 */}
        {pathname !== "/signin" && pathname !== "/signup" && (
          <nav className="dark:bg-[#444444] h-20 dark:text-[#F1F5F9] fixed bottom-0 left-0 right-0 bg-gray-50 z-20 flex justify-around items-center [@media(min-width:1402px)]:hidden rounded-t-2xl  mx-auto ">
            <ul className="flex justify-around w-full">
              {NavBtns.map((btn, index) => (
                <li key={index}>
                  <button
                    className={twMerge(
                      " justify-center text-3xl flex flex-col gap-y-1.5 items-center bg-gray-50 dark:bg-[#444444] dark:text-[#E5E7EB] hover:text-primary hover:opacity-80",
                      pathname === btn.path && "text-primary dark:text-primary"
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
    </>
  );
};

export default Navbar;
