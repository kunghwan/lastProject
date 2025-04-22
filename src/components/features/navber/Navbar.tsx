"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  FaCircleQuestion,
  FaRegStar,
  FaRegMessage,
  FaPencil,
} from "react-icons/fa6";
import { IoPersonSharp, IoCloseOutline } from "react-icons/io5";
import { twMerge } from "tailwind-merge";

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isShowModal, setIsShowModal] = useState(false);

  const modalClick = (btn: (typeof NavBtns)[number]) => {
    if (btn.modal) {
      setIsShowModal(true);
    } else if (btn.path) {
      router.push(btn.path);
    }
  };

  return (
    <>
      <div className="flex relative lg:max-w-300 lg:mx-auto">
        <nav
          className={twMerge(
            "absolute top-25 h-130 w-15 justify-center flex bg-teal-100 z-30 rounded-2xl left-[-80px] ",
            pathname !== "/" && "hidden"
          )}
        >
          <ul className="flex flex-col justify-between py-5 ">
            {NavBtns.map((btn, index) => (
              <li key={index}>
                <button
                  className="themeButton text-3xl "
                  onClick={() => modalClick(btn)}
                >
                  {btn.icon}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {isShowModal && (
          <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-50">
            <div className="p-6 rounded-xl shadow-lg w-80 relative bg-white text-black dark:text-black dark:bg-white ">
              <button
                onClick={() => setIsShowModal(false)}
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
  { icon: <FaCircleQuestion />, path: "/customer" },
  { icon: <FaRegStar />, path: "/upplace" },
  { icon: <FaRegMessage />, modal: true },
  { icon: <FaPencil />, path: "/profile/create" },
  { icon: <IoPersonSharp />, path: "/profile" },
];
