"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { FaRegMessage, FaPencil } from "react-icons/fa6";
import { IoPersonSharp, IoCloseOutline, IoStarOutline } from "react-icons/io5";
import { twMerge } from "tailwind-merge";
import { AUTH } from "@/contextapi/context";
import { FaRegQuestionCircle } from "react-icons/fa";

const Navbar = () => {
  const [isShowingModal, setIsShowingModal] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  const { user } = AUTH.use();

  const navBtnClick = (
    btn: (typeof NavBtns)[number],
    userfuncIndex: number
  ) => {
    const onlyUserIndex = [2, 3, 4]; // 로그인해야만 사용가능한 기능의 인덱스

    if (!user && onlyUserIndex.includes(userfuncIndex)) {
      const confirmLogin = window.confirm(
        "유저만 이용 가능한 기능입니다. 로그인 하시겠습니까?"
      );

      if (confirmLogin) {
        router.push("/signin");
      }

      return;
    }

    if (btn.modal) {
      setIsShowingModal(true);
    } else if (btn.path) {
      router.push(btn.path);
    }
  };

  return (
    <>
      <div className="flex relative lg:max-w-300 lg:mx-auto h-auto ">
        {pathname !== "/signin" && pathname !== "/signup" && (
          <div className="mx-auto max-w-100 ">
            <div className="fixed w-full max-w-100 left-[50%] translate-x-[-50%]">
              <nav className="hidden xl:flex absolute h-140 w-20 -left-[130%] justify-center bg-gray-200 z-30 rounded-full">
                <ul className="flex flex-col justify-between py-5">
                  {NavBtns.map((btn, index) => (
                    <li
                      key={index}
                      className="flex justify-center items-center"
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
            "fixed bottom-0 left-0 right-0 bg-gray-200 z-30 p-3 flex justify-around xl:hidden rounded-t-2xl",
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

        {/* 모달 */}
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
