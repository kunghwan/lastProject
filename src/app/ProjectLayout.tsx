"use client";

import Link from "next/link";
import { PropsWithChildren, useCallback, useState } from "react";
import { IoMoon, IoSunny } from "react-icons/io5";

const ProjectLayout = ({ children }: PropsWithChildren) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const signout = useCallback(() => {}, []);

  return (
    <>
      <header className="flex items-center justify-between lg:max-w-300 lg:mx-auto m-5 ">
        <Link href={"/"} className="text-[50px]">
          방방콕콕
        </Link>
        <ul className="flex-row gap-x-5 flex text-2xl">
          <button
            onClick={() => setIsDarkMode((prev) => !prev)}
            className="p-3 rounded-full bg-teal-100 "
          >
            {isDarkMode ? <IoMoon /> : <IoSunny />}
          </button>
          <button>signout</button>
        </ul>
      </header>
      <div className="w-300 h-0.5 bg-[#C4E2DA] mx-auto" />
      <main>{children}</main>
      <nav>nav</nav>
    </>
  );
};

export default ProjectLayout;
