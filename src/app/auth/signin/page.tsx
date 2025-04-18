"use client";

import Link from "next/link";
import { useState } from "react";
import { IoHome, IoMoon, IoSunny } from "react-icons/io5";

const Signin = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <>
      <div className=" flex flex-col gap-y-2.5 items-center justify-center h-screen">
        <div className=" w-100 flex justify-end gap-x-2.5 text-2xl lg:w-200">
          <button
            onClick={() => setIsDarkMode((prev) => !prev)}
            className="p-3 rounded-full bg-teal-100 "
          >
            {isDarkMode ? <IoMoon /> : <IoSunny />}
          </button>
          <button className="p-3 rounded-full bg-teal-100">
            <IoHome />
          </button>
        </div>
        <div className="flex flex-col gap-y-2.5">
          <input
            type="text"
            className={InputStyle}
            placeholder="아이디"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="text"
            className={InputStyle}
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="flex gap-x-20 justify-start  w-100 lg:w-200">
          <p className="cursor-pointer">아이디찾기</p>
          <p className="cursor-pointer">비밀번호찾기</p>
        </div>
        <button className={LoginButton}>로그인</button>
        <Link href="/auth/signup" className={SignUserButton}>
          회원가입
        </Link>
      </div>
    </>
  );
};

export default Signin;

const InputStyle =
  "rounded-2xl p-4 bg-pink-50 w-100 placeholder:text-black outline-none lg:w-200";
const LoginButton = "p-3 rounded w-100 cursor-pointer bg-green-400 lg:w-200";
const SignUserButton =
  "p-3 rounded w-100 cursor-pointer bg-lime-300 text-center lg:w-200";
