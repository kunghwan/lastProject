"use client"; // Next.js의 Client Component로 선언

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AUTH } from "@/contextapi/context";
import AlertModal from "@/components/AlertModal";
import Loading from "@/components/Loading";

const LoginForm = () => {
  // ✅ 로그인 이메일 상태 (초기값은 sessionStorage에서 복원)
  const [email, setEmail] = useState(
    () => sessionStorage.getItem("login_email") || ""
  );

  const [password, setPassword] = useState("");

  const [alertMsg, setAlertMsg] = useState("");

  const router = useRouter();

  // ✅ Context API에서 로그인 함수 추출
  const { signin } = AUTH.use();

  // ✅ 입력창에 포커스를 주기 위한 Ref
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const [isPending, startTransition] = useTransition();

  // ✅ 페이지 로드 시 이메일 입력창에 자동 포커스
  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  // ✅ 이메일 변경 시 상태 및 sessionStorage 동기화
  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setEmail(val);
      sessionStorage.setItem("login_email", val);
    },
    []
  );

  // ✅ 비밀번호 입력 핸들러
  const handlePasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value);
    },
    []
  );

  // ✅ 알림 닫기 + 오류 포커스 처리
  const handleCloseAlert = useCallback(() => {
    setAlertMsg("");
    setTimeout(() => {
      if (
        alertMsg === "아이디가 존재하지 않습니다" ||
        alertMsg === "아이디를 입력해주세요." ||
        alertMsg === "아이디와 비밀번호를 입력해주세요."
      ) {
        emailRef.current?.focus();
      } else if (
        alertMsg === "비밀번호를 입력해주세요." ||
        alertMsg === "비밀번호가 일치하지 않습니다"
      ) {
        passwordRef.current?.focus();
      }
    }, 0);
  }, [alertMsg]);

  // ✅ 로그인 실행 함수
  const handleLogin = useCallback(() => {
    // 1. 입력 유효성 검사
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

    // 2. 로그인 시도 (transition으로 로딩 처리)
    startTransition(async () => {
      const result = await signin(email, password);

      if (!result.success) {
        // 3. 에러 코드에 따라 메시지 처리
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
    });
  }, [email, password, signin, router]);

  // ✅ 이메일 입력창에서 Enter → 비밀번호로 포커스 이동
  const handleEmailKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        passwordRef.current?.focus();
      }
    },
    []
  );

  // ✅ 비밀번호 입력창에서 Enter → 로그인 시도
  const handlePasswordKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleLogin();
      }
    },
    [handleLogin]
  );

  return (
    <>
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="flex flex-col gap-y-2.5 items-center justify-center h-120">
          {/* 아이디/비밀번호 입력 영역 */}
          <div className="flex flex-col gap-y-2.5">
            {/* ✅ 아이디 입력 */}
            <input
              type="text"
              ref={emailRef}
              className="ykhInputButton dark:text-black"
              placeholder="아이디"
              value={email}
              onChange={handleEmailChange}
              onKeyDown={handleEmailKeyDown}
            />
            {/* ✅ 비밀번호 입력 */}
            <input
              type="password"
              ref={passwordRef}
              className="ykhInputButton dark:text-black"
              placeholder="비밀번호"
              value={password}
              onChange={handlePasswordChange}
              onKeyDown={handlePasswordKeyDown}
            />
          </div>

          {/* 아이디/비밀번호 찾기 링크 */}
          <div className="flex gap-x-20 justify-start w-100 lg:w-120 px-5">
            <Link href="/idfind" className={Find}>
              아이디찾기
            </Link>
            <Link href="/pwfind" className={Find}>
              비밀번호찾기
            </Link>
          </div>

          <button
            className={LoginButton}
            onClick={handleLogin}
            disabled={isPending}
          >
            로그인
          </button>

          <Link href="/signup" className={SignUserButton}>
            회원가입
          </Link>
        </div>
      </form>

      {/* 알림 모달 */}
      {alertMsg && <AlertModal message={alertMsg} onClose={handleCloseAlert} />}

      {isPending && <Loading message="로그인 중입니다..." />}
    </>
  );
};

export default LoginForm;

const Find = "cursor-pointer dark:text-[#C5E3DB]";
const LoginButton =
  "p-3 rounded w-90 cursor-pointer bg-green-400 lg:w-120 dark:text-gray-900";
const SignUserButton =
  "p-3 rounded w-90 cursor-pointer bg-lime-300 text-center lg:w-120 dark:text-gray-900";

//! 실험 sdfsdfsdfsdfsdfsdfsdfsdfsdf
//!sefsdfsdfsdfsdf
