"use client";
import { usePathname, useRouter } from "next/navigation";
import { useState, useCallback, useMemo } from "react";
import { twMerge } from "tailwind-merge";
import { AUTH } from "@/contextapi/context";
import { IoPersonSharp, IoStarOutline, IoGridOutline } from "react-icons/io5";
import {
  FaRegMessage,
  FaPencil,
  FaCircleQuestion,
  FaCaretUp,
} from "react-icons/fa6";
import AlertModal from "@/components/AlertModal";

const Navbar = () => {
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
  const [isGridMenuVisible, setIsGridMenuVisible] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const { user } = AUTH.use();

  const NavBtns = useMemo(
    () => [
      { name: "Q&A", icon: <FaCircleQuestion />, path: "/customer" },
      { name: "추천", icon: <IoStarOutline />, path: "/upplace" },
      { name: "피드", icon: <FaRegMessage />, path: "/feed" },
      { name: "글쓰기", icon: <FaPencil />, path: "/profile/create" },
      { name: "MY", icon: <IoPersonSharp />, path: "/profile" },
    ],
    []
  );

  const navBtnClick = useCallback(
    (btn: (typeof NavBtns)[0], index: number) => {
      const needsAuth = [2, 3, 4].includes(index);
      if (!user && needsAuth) {
        setShowLoginModal(true);
        return;
      }
      if (btn.path) router.push(btn.path);
    },
    [user, router]
  );

  const handleToggleNavMenu = useCallback(() => {
    setIsNavMenuOpen((prev) => !prev);
    setIsGridMenuVisible((prev) => !prev);
  }, []);

  const closeNavMenu = useCallback(() => {
    setIsNavMenuOpen(false);
    setTimeout(() => setIsGridMenuVisible(true), 300);
  }, []);

  const baseNavStyle =
    "[@media(min-width:1425px)]:flex absolute w-17 top-40 -left-[125%] bg-gray-100 z-30 rounded-full transition-all duration-400 ease-in-out transform dark:bg-[#6B6B6B] dark:text-white";

  return (
    <>
      <div className="flex relative">
        {/* 로그인 및 회원가입 페이지가 아니면 네비게이션 표시 */}
        {!["/signin", "/signup", "/idfind", "/pwfind"].includes(pathname!) && (
          <div className="mx-auto max-w-100">
            <div className="fixed w-full max-w-100 left-1/2 transform -translate-x-1/2">
              <div className="hidden [@media(min-width:1425px)]:block">
                {!isNavMenuOpen && isGridMenuVisible && (
                  <button
                    className={twMerge(
                      baseNavStyle,
                      "opacity-100 scale-100 translate-y-0 items-center justify-center h-17"
                    )}
                    onClick={handleToggleNavMenu}
                  >
                    <IoGridOutline className="hover:animate-pulse text-3xl text-green-400" />
                  </button>
                )}
              </div>

              {/* 메뉴 영역 */}
              <nav
                className={twMerge(
                  baseNavStyle,
                  "flex flex-col justify-between items-center py-5 h-140 overflow-hidden origin-top",
                  isNavMenuOpen
                    ? "scale-100 opacity-100 translate-y-0"
                    : "scale-0 opacity-0 -translate-y-0 pointer-events-none"
                )}
              >
                <ul className="flex flex-col justify-between items-center w-full h-full transition-opacity duration-300">
                  <li className="flex justify-center text-4xl dark:text-white ">
                    <button onClick={closeNavMenu}>
                      <FaCaretUp className="hover:animate-pulse text-3xl" />
                    </button>
                  </li>
                  {NavBtns.map((btn, index) => (
                    <li
                      key={index}
                      className="dark:bg-[#6B6B6B] dark:text-[#E5E7EB]"
                    >
                      <button
                        className={twMerge(
                          "flex flex-col gap-y-1.5 items-center transition-all duration-200 hover:text-green-400 justify-center text-3xl p-3",
                          pathname?.startsWith(btn.path) &&
                            "text-green-400 dark:text-green-400"
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
          <nav className="dark:bg-[#6B6B6B] dark:text-white fixed bottom-0 left-0 right-0 bg-gray-100 z-20 flex justify-around items-center [@media(min-width:1425px)]:hidden rounded-t-2xl max-w-300 mx-auto">
            <ul className="flex justify-around w-full">
              {NavBtns.map((btn, index) => (
                <li key={index}>
                  <button
                    className={twMerge(
                      "grayButton text-2xl flex flex-col gap-y-1.5 items-center bg-gray-100 dark:bg-[#6B6B6B] dark:text-[#E5E7EB]",
                      pathname === btn.path && "text-green-400"
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

      {/* 로그인 유도 모달 */}
      {showLoginModal && (
        <AlertModal
          message={"유저만 이용 가능한 기능입니다.\n로그인 하시겠습니까?"}
          onClose={() => setShowLoginModal(false)}
          onConfirm={() => {
            setShowLoginModal(false);
            router.push("/signin");
          }}
          showCancel
        />
      )}
    </>
  );
};

export default Navbar;
