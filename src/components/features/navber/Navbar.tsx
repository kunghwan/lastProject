"use client";
import { usePathname, useRouter } from "next/navigation";
import { useState, useCallback } from "react";
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
  const [isGridMenuVisible, setIsGridMenuVisible] = useState(true); // Grid 메뉴 버튼 표시 여부 상태
  const [showLoginModal, setShowLoginModal] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const { user } = AUTH.use();

  const navBtnClick = useCallback(
    (btn: (typeof NavBtns)[number], index: number) => {
      const needsAuth = [2, 3, 4].includes(index);
      if (!user && needsAuth) {
        setShowLoginModal(true);
        return;
      }
      if (btn.path) {
        router.push(btn.path);
        setIsNavMenuOpen(false); // 이동 시 메뉴 닫기
      }
    },
    [user, router]
  );

  //! 메뉴열고 닫는 기능
  const handleToggleNavMenu = useCallback(() => {
    setIsNavMenuOpen((prev) => !prev);
    setIsGridMenuVisible(!isNavMenuOpen); // 메뉴 열리고 닫히면 그리드 버튼 상태 변경
  }, [isNavMenuOpen]);

  //! nav메뉴 닫기 기능
  const closeNavMenu = useCallback(() => {
    setIsNavMenuOpen(false);
    setIsGridMenuVisible(true); // 메뉴가 닫히면 그리드 버튼 다시 보이도록
  }, []);

  const baseNavStyle =
    "[@media(min-width:1425px)]:flex absolute w-17 top-40 -left-[125%] bg-gray-200 z-30 rounded-full transition-all duration-400 ease-in-out transform";

  return (
    <>
      <div className="flex relative">
        {/* 로그인 및 회원가입 페이지가 아니면 네비게이션 표시 */}
        {pathname !== "/signin" && pathname !== "/signup" && (
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
                    <IoGridOutline className="hover:animate-pulse text-3xl dark:text-gray-600" />
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
                  <li className="flex justify-center text-4xl dark:text-gray-600">
                    <button onClick={closeNavMenu}>
                      <FaCaretUp className="hover:animate-pulse text-3xl" />
                    </button>
                  </li>
                  {NavBtns.map((btn, index) => (
                    <li key={index}>
                      <button
                        className={twMerge(
                          "grayButton flex flex-col gap-y-1.5 items-center transition-all duration-200",
                          pathname === btn.path && "text-green-500"
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
          <nav className="fixed bottom-0 left-0 h-auto right-0 bg-gray-200 z-20 flex justify-around items-center [@media(min-width:1425px)]:hidden rounded-t-2xl max-w-300 mx-auto">
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

      {/* 로그인 유도 모달 */}
      {showLoginModal && (
        <AlertModal
          message="유저만 이용 가능한 기능입니다. 로그인 하시겠습니까?"
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

const NavBtns = [
  { name: "Q&A", icon: <FaCircleQuestion />, path: "/customer" },
  { name: "추천", icon: <IoStarOutline />, path: "/upplace" },
  { name: "피드", icon: <FaRegMessage />, path: "/feed" },
  { name: "글쓰기", icon: <FaPencil />, path: "/profile/create" },
  { name: "MY", icon: <IoPersonSharp />, path: "/profile" },
];
