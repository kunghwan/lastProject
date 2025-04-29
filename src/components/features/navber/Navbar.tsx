"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { FaRegMessage, FaPencil } from "react-icons/fa6";
import {
  IoPersonSharp,
  IoCloseOutline,
  IoStarOutline,
  IoGridOutline,
} from "react-icons/io5";
import { IoMdArrowDropup } from "react-icons/io";
import { twMerge } from "tailwind-merge";
import { AUTH } from "@/contextapi/context";
import { FaRegQuestionCircle } from "react-icons/fa";

const Navbar = () => {
  const [isShowingModal, setIsShowingModal] = useState(false);
  const [isNavMenuOpen, setisNavMenuOpen] = useState(false);
  const [navDelay, setNavDelay] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user } = AUTH.use();

  const navBtnClick = (
    btn: (typeof NavBtns)[number],
    userfuncIndex: number
  ) => {
    if (
      !user &&
      [2, 3, 4].includes(userfuncIndex) &&
      window.confirm("유저만 이용 가능한 기능입니다. 로그인 하시겠습니까?")
    ) {
      router.push("/signin");
      return;
    }
    btn.modal ? setIsShowingModal(true) : btn.path && router.push(btn.path);
  };

  const handleToggleNavMenu = () => {
    if (!isNavMenuOpen) {
      setisNavMenuOpen(true);
      setTimeout(() => setNavDelay(true), 100);
    } else {
      setisNavMenuOpen(false);
      setNavDelay(false);
    }
  };

  const navStyle =
    "hidden [@media(min-width:1425px)]:flex absolute w-20 -left-[130%] bg-gray-200 z-30 rounded-full transition-opacity duration-300";

  return (
    <>
      <div className="flex relative">
        {pathname !== "/signin" && pathname !== "/signup" && (
          <div className="mx-auto max-w-100 ">
            <div className="fixed w-full max-w-100 left-[50%] translate-x-[-50%]">
              <button
                className={twMerge(
                  "h-20 items-center justify-center text-3xl outline-none dark:text-gray-600",
                  navStyle,
                  isNavMenuOpen && "hidden"
                )}
                onClick={handleToggleNavMenu}
              >
                <IoGridOutline />
              </button>
              <nav
                className={twMerge(
                  " overflow-hidden ",
                  navStyle,
                  isNavMenuOpen && navDelay
                    ? "opacity-100 h-140 justify-between items-center py-5"
                    : "h-0 justify-center"
                )}
              >
                <ul className="flex flex-col justify-between items-center w-full h-full">
                  <li className="flex justify-center text-4xl dark:text-gray-600">
                    <button onClick={() => setisNavMenuOpen(false)}>
                      <IoMdArrowDropup />
                    </button>
                  </li>
                  {NavBtns.map((btn, index) => (
                    <li
                      key={index}
                      className={twMerge(
                        "flex justify-center items-center transition-opacity duration-300"
                      )}
                    >
                      <button
                        className={twMerge(
                          "grayButton flex flex-col gap-y-1.5 items-center",
                          pathname === btn.path
                            ? "text-blue-500"
                            : "text-gray-600"
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
            </div>
          </div>
        )}
        <nav
          className={twMerge(
            "fixed bottom-0 left-0 right-0 bg-gray-200 z-30 flex justify-around [@media(min-width:1425px)]:hidden rounded-t-2xl max-w-300 mx-auto",
            ["/signin", "/signup"].includes(pathname!) && "hidden"
          )}
        >
          <ul className="flex justify-around w-full">
            {NavBtns.map((btn, index) => (
              <li key={index}>
                <button
                  className="grayButton text-2xl flex flex-col gap-y-1.5 items-center"
                  onClick={() => navBtnClick(btn, index)}
                >
                  {btn.icon}
                  <p className="text-black text-xs">{btn.name}</p>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        {isShowingModal && (
          <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-50">
            <div className="p-6 rounded-xl shadow-lg w-80 relative bg-white text-black dark:text-black dark:bg-white">
              <button
                onClick={() => setIsShowingModal(false)}
                className="absolute top-2 right-4 text-gray-500 hover:text-gray-800 text-xl"
              >
                <IoCloseOutline />
              </button>
              <p>feed</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Navbar;

const NavBtns = [
  { name: "Q&A", icon: <FaRegQuestionCircle />, path: "/customer" },
  { name: "추천", icon: <IoStarOutline />, path: "/upplace" },
  { name: "피드", icon: <FaRegMessage />, modal: true },
  { name: "글쓰기", icon: <FaPencil />, path: "/profile/create" },
  { name: "MY", icon: <IoPersonSharp />, path: "/profile" },
];
