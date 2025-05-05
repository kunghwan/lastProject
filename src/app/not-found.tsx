"use client";

import { useRouter } from "next/navigation";
import React from "react";
import { FaArrowLeft } from "react-icons/fa6";

const NotFound = () => {
  const navi = useRouter();

  return (
    <div className="hsecol justify-center items-center  h-100 gap-y-5">
      <p className="dark:text-white font-bold text-xl">
        죄송합니다. 해당 페이지를 찾을 수 없습니다.
      </p>
      <button
        onClick={() => navi.push("/")}
        className=" hover:animate-pulse flex gap-x-2.5 items-center font-bold p-2.5 rounded w-40 bg-[rgba(62,188,154)] dark:bg-[rgba(116,212,186,0.5)] text-white hover:shadow-md"
      >
        <span>
          <FaArrowLeft className="" />
        </span>
        홈으로 돌아가기
      </button>
    </div>
  );
};

export default NotFound;
