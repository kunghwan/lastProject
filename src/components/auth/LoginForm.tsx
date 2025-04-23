"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { AUTH } from "@/contextapi/context";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const { signin } = AUTH.use();

  const handleLogin = async () => {
    if (!email && !password) {
      alert("아이디와 비밀번호를 입력해주세요.");
      return;
    }
    if (!email) {
      alert("아이디를 입력해주세요.");
      return;
    }
    if (!password) {
      alert("비밀번호를 입력해주세요.");
      return;
    }

    const result = await signin(email, password);

    if (!result.success) {
      const message = result.message?.toLowerCase();
      if (message?.includes("password")) {
        alert("비밀번호가 일치하지 않습니다");
      } else if (message?.includes("user")) {
        alert("아이디가 일치하지 않습니다");
      } else {
        alert("아이디와 비밀번호가 일치하지 않습니다");
      }
      return;
    }

    router.push("/");
  };

  return (
    <>
      <div className=" flex flex-col gap-y-2.5 items-center justify-center h-screen">
        <div className="flex flex-col gap-y-2.5">
          <input
            type="text"
            className={InputStyle}
            placeholder="아이디"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            className={InputStyle}
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="flex gap-x-20 justify-start  w-100 lg:w-200">
          <Link href="/idfind" className="cursor-pointer">
            아이디찾기
          </Link>
          <Link href="/pwfind" className="cursor-pointer">
            비밀번호찾기
          </Link>
        </div>
        <button className={LoginButton} onClick={handleLogin}>
          로그인
        </button>
        <Link href="/signup" className={SignUserButton}>
          회원가입
        </Link>
      </div>
    </>
  );
};

export default LoginForm;

const InputStyle =
  "rounded-2xl p-4 bg-pink-50 w-100 placeholder:text-black outline-none lg:w-200";
const LoginButton = "p-3 rounded w-100 cursor-pointer bg-green-400 lg:w-200";
const SignUserButton =
  "p-3 rounded w-100 cursor-pointer bg-lime-300 text-center lg:w-200";
