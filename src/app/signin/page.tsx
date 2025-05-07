"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AUTH } from "@/contextapi/context";
import AlertModal from "@/components/AlertModal";
import { twMerge } from "tailwind-merge";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alertMsg, setAlertMsg] = useState("");
  const router = useRouter();
  const { signin } = AUTH.use();

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedEmail = sessionStorage.getItem("login_email");
    if (savedEmail) setEmail(savedEmail);
    emailRef.current?.focus(); // 최초 포커스
  }, []);

  // const closeAlert = () => setAlertMsg("");

  const handleLogin = useCallback(async () => {
    if (!email && !password) {
      setAlertMsg("아이디와 비밀번호를 입력해주세요.");
      emailRef.current?.focus(); // 최초 포커스
      return;
    }
    if (!email) {
      setAlertMsg("아이디를 입력해주세요.");

      return;
    }
    if (!password) {
      setAlertMsg("비밀번호를 입력해주세요.");
      return;
    }

    const result = await signin(email, password);
    console.log(result);

    if (!result.success) {
      if (result.reason === "wrong-password") {
        setAlertMsg("비밀번호가 일치하지 않습니다");
      } else if (result.reason === "user-not-found") {
        setAlertMsg("아이디가 존재하지 않습니다");
      } else {
        setAlertMsg("아이디와 비밀번호가 일치하지 않습니다");
      }
      return;
    }

    router.push("/");
  }, [email, password, signin, router]);

  return (
    <>
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="flex flex-col gap-y-2.5 items-center justify-center h-120">
          <div className="flex flex-col gap-y-2.5">
            <input
              type="text"
              ref={emailRef}
              className={twMerge("ykhInputButton", "dark:text-black")}
              placeholder="아이디"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                sessionStorage.setItem("login_email", e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  passwordRef.current?.focus();
                }
              }}
            />
            <input
              type="password"
              ref={passwordRef}
              className={twMerge("ykhInputButton", "dark:text-black")}
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleLogin();
                }
              }}
            />
          </div>
          <div className="flex gap-x-20 justify-start w-100 lg:w-120">
            <Link href="/idfind" className={Find}>
              아이디찾기
            </Link>
            <Link href="/pwfind" className={Find}>
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
      </form>

      {alertMsg && (
        <AlertModal
          message={alertMsg}
          onClose={() => {
            setAlertMsg("");

            // 🔽 특정 메시지일 때 이메일 input에 포커스
            if (alertMsg === "아이디가 존재하지 않습니다") {
              setTimeout(() => emailRef.current?.focus(), 0);
            }
            if (alertMsg === "아이디를 입력해주세요.") {
              setTimeout(() => emailRef.current?.focus(), 0);
            }
            if (alertMsg === "비밀번호를 입력해주세요.") {
              setTimeout(() => passwordRef.current?.focus(), 0);
            }
            if (alertMsg === "아이디와 비밀번호를 입력해주세요.") {
              setTimeout(() => emailRef.current?.focus(), 0);
            }
            if (alertMsg === "비밀번호를 입력해주세요.") {
              setTimeout(() => passwordRef.current?.focus(), 0);
            }
            if (alertMsg === "비밀번호를 입력해주세요.") {
              setTimeout(() => passwordRef.current?.focus(), 0);
            }
            if (alertMsg === "비밀번호가 일치하지 않습니다") {
              setTimeout(() => passwordRef.current?.focus(), 0);
            }
          }}
        />
      )}
    </>
  );
};

export default LoginForm;

const Find = "cursor-pointer dark:text-[#C5E3DB]";
const LoginButton =
  "p-3 rounded w-100 cursor-pointer bg-green-400 lg:w-120 dark:text-gray-900";
const SignUserButton =
  "p-3 rounded w-100 cursor-pointer bg-lime-300 text-center lg:w-120 dark:text-gray-900";
