"use client"; // Next.js 클라이언트 컴포넌트 지정

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation"; // 페이지 이동용
import { AUTH } from "@/contextapi/context"; // 로그인 context
import AlertModal from "@/components/AlertModal"; // 커스텀 알림창
import { twMerge } from "tailwind-merge"; // Tailwind 클래스 병합 라이브러리

const LoginForm = () => {
  const [email, setEmail] = useState(""); // 입력된 이메일 상태
  const [password, setPassword] = useState(""); // 입력된 비밀번호 상태
  const [alertMsg, setAlertMsg] = useState(""); // 알림 메시지 상태
  const router = useRouter(); // 페이지 이동 훅
  const { signin } = AUTH.use(); // context로부터 로그인 함수 받아오기

  const emailRef = useRef<HTMLInputElement>(null); // 이메일 input 참조
  const passwordRef = useRef<HTMLInputElement>(null); // 비밀번호 input 참조

  // 컴포넌트 첫 렌더링 시 실행
  useEffect(() => {
    const savedEmail = sessionStorage.getItem("login_email"); // 세션 저장 이메일 불러오기
    if (savedEmail) setEmail(savedEmail);
    emailRef.current?.focus(); // 첫 포커스는 이메일 input
  }, []);

  // 로그인 핸들러
  const handleLogin = useCallback(async () => {
    // 입력값 검증
    if (!email && !password) {
      setAlertMsg("아이디와 비밀번호를 입력해주세요.");
      emailRef.current?.focus();
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

    // 로그인 시도
    const result = await signin(email, password);
    console.log(result); // 콘솔 확인용

    // 실패 시 reason에 따라 분기
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

    // 로그인 성공 시 메인으로 이동
    router.push("/");
  }, [email, password, signin, router]);

  return (
    <>
      {/* 폼 시작 */}
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="flex flex-col gap-y-2.5 items-center justify-center h-120">
          <div className="flex flex-col gap-y-2.5">
            {/* 이메일 입력 */}
            <input
              type="text"
              ref={emailRef}
              className={twMerge("ykhInputButton", "dark:text-black")}
              placeholder="아이디"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                sessionStorage.setItem("login_email", e.target.value); // 세션에 이메일 저장
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  passwordRef.current?.focus(); // Enter 누르면 비번으로 포커스 이동
                }
              }}
            />
            {/* 비밀번호 입력 */}
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
                  handleLogin(); // Enter 누르면 로그인 실행
                }
              }}
            />
          </div>

          {/* 아이디/비번 찾기 링크 */}
          <div className="flex gap-x-20 justify-start w-100 lg:w-120">
            <Link href="/idfind" className={Find}>
              아이디찾기
            </Link>
            <Link href="/pwfind" className={Find}>
              비밀번호찾기
            </Link>
          </div>

          {/* 로그인 버튼 */}
          <button className={LoginButton} onClick={handleLogin}>
            로그인
          </button>

          {/* 회원가입 버튼 */}
          <Link href="/signup" className={SignUserButton}>
            회원가입
          </Link>
        </div>
      </form>

      {/* 알림창 */}
      {alertMsg && (
        <AlertModal
          message={alertMsg}
          onClose={() => {
            setAlertMsg("");

            // 메시지에 따라 포커스를 맞춰줌
            if (alertMsg === "아이디가 존재하지 않습니다") {
              setTimeout(() => emailRef.current?.focus(), 0);
            }
            if (
              alertMsg === "아이디를 입력해주세요." ||
              alertMsg === "아이디와 비밀번호를 입력해주세요."
            ) {
              setTimeout(() => emailRef.current?.focus(), 0);
            }
            if (
              alertMsg === "비밀번호를 입력해주세요." ||
              alertMsg === "비밀번호가 일치하지 않습니다"
            ) {
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
