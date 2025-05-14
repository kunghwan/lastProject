"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AUTH } from "@/contextapi/context";

import Loading from "@/components/Loading";
import { useAlertModal } from "@/components/AlertStore";
import AlertModal from "@/components/AlertModal";
import { twMerge } from "tailwind-merge";

const LoginForm = () => {
  const { openAlert } = useAlertModal();

  const [email, setEmail] = useState(
    () => sessionStorage.getItem("login_email") || ""
  );
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { signin } = AUTH.use();

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setEmail(val);
      sessionStorage.setItem("login_email", val);
    },
    []
  );

  const handlePasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value);
    },
    []
  );

  const handleLogin = useCallback(() => {
    const targetRefs = [emailRef, passwordRef]; // ✅ 전달할 ref 배열

    if (!email && !password) {
      openAlert(
        "아이디와 비밀번호를 입력해주세요",
        [
          {
            text: "확인",

            isGreen: true,
            autoFocus: true,
            target: 0,
          },
          {
            text: "취소",

            isGreen: false,
            autoFocus: false,
          },
        ],
        undefined,
        targetRefs
      );
      return;
    }

    if (!email) {
      openAlert(
        "아이디를 입력해주세요",
        [
          {
            text: "확인",
            isGreen: true,
            autoFocus: true,
            target: 0,
          },
          {
            text: "취소",
            isGreen: false,
            autoFocus: false,
          },
        ],
        undefined,
        targetRefs
      );
      return;
    }

    if (!password) {
      openAlert(
        "비밀번호를 입력해주세요",
        [
          {
            text: "확인",
            isGreen: true,
            autoFocus: true,
            target: 1,
          },
          {
            text: "취소",
            isGreen: false,
            autoFocus: false,
          },
        ],
        undefined,
        targetRefs
      );
      return;
    }

    startTransition(async () => {
      const result = await signin(email, password);

      if (!result.success) {
        if (result.reason === "wrong-password") {
          openAlert(
            "비밀번호가 일치하지 않습니다",
            [
              {
                text: "확인",
                isGreen: true,
                autoFocus: true,
                target: 1,
              },
              {
                text: "취소",
                isGreen: false,
                autoFocus: false,
              },
            ],
            undefined,
            targetRefs
          );
        } else if (result.reason === "user-not-found") {
          openAlert(
            "아이디가 존재하지 않습니다",
            [
              {
                text: "확인",
                isGreen: true,
                autoFocus: true,
                target: 0,
              },
              {
                text: "취소",
                isGreen: false,
                autoFocus: false,
              },
            ],
            undefined,
            targetRefs
          );
        } else {
          openAlert(
            "아이디와 비밀번호가 일치하지 않습니다",
            [
              {
                text: "확인",
                isGreen: true,
                autoFocus: true,
                target: 0,
              },
              {
                text: "취소",
                isGreen: false,
                autoFocus: false,
              },
            ],
            undefined,
            targetRefs
          );
        }
        return;
      }

      router.push("/");
    });
  }, [email, password, signin, router, openAlert]);

  const handleEmailKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        passwordRef.current?.focus();
      }
    },
    []
  );

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
          <div className="flex flex-col gap-y-2.5">
            <input
              type="text"
              ref={emailRef}
              className="ykhInputButton dark:text-gray-500 "
              placeholder="이메일"
              value={email}
              onChange={handleEmailChange}
              onKeyDown={handleEmailKeyDown}
            />
            <input
              type="password"
              ref={passwordRef}
              className="ykhInputButton dark:text-gray-500"
              placeholder="비밀번호"
              value={password}
              onChange={handlePasswordChange}
              onKeyDown={handlePasswordKeyDown}
            />
          </div>
          {/* flex gap-x-20 justify-start w-100 lg:w-120 px-5 */}
          <div className=" border">
            <Link href="/idfind" className={twMerge(Find, "border")}>
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

      {isPending && <Loading message="로그인 중입니다..." />}
      <AlertModal />
    </>
  );
};

export default LoginForm;

const Find = "cursor-pointer dark:text-[#C5E3DB]";
const LoginButton =
  "p-3 rounded w-90 cursor-pointer bg-green-400 lg:w-120 dark:text-gray-700 dark:bg-green-200";
const SignUserButton =
  "p-3 rounded w-90 cursor-pointer bg-gray-200 text-center lg:w-120 dark:text-gray-700 dark:bg-gray-300 ";
