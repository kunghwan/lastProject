"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  IoMoon,
  IoSunny,
  IoBookmarkOutline,
  IoMenu,
  IoCloseSharp,
  IoNotificationsOutline,
} from "react-icons/io5";
import { usePathname, useRouter } from "next/navigation";
import { AUTH } from "@/contextapi/context";
import { twMerge } from "tailwind-merge";
import Navbar from "./features/navber/Navbar";
import { dbService } from "@/lib";

const headBtn = "grayButton text-xl sm:text-2xl";
const darkText = "grayButton w-full dark:bg-[#333333] dark:text-[#F1F5F9]";

//! 초기 로딩 시 다크 모드 설정 (localStorage에서 값을 읽어와 적용)
const storedDarkMode =
  typeof window !== "undefined" ? localStorage.getItem("darkMode") : null;
if (storedDarkMode === "true") {
  document.documentElement.classList.add("dark"); // HTML 요소에 'dark' 클래스 추가
}

const Header = () => {
  //! 다크 모드 상태 관리, 초기값은 localStorage에 저장된 값이거나 false
  const [isDarkMode, setIsDarkMode] = useState(
    storedDarkMode === "true" || false
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false); // 모바일 메뉴 상태 관리
  const [hasUnread, setHasUnread] = useState(false); // 읽지 않은 알림 존재 여부 상태

  const router = useRouter();
  const pathname = usePathname();

  const { user, signout } = AUTH.use(); //! Context API를 통해 사용자 인증 상태 및 로그아웃 함수 가져오기
  //! 현재 경로가 로그인 또는 회원가입 페이지인지 확인
  const isAuthPage = useMemo(
    () => ["/signin", "/signup"].includes(pathname!),
    [pathname]
  );

  //! 다크 모드 토글 함수
  const toggleDarkMode = useCallback(() => setIsDarkMode((prev) => !prev), []);

  //! isDarkMode 상태가 변경될 때마다 실행
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    localStorage.setItem("darkMode", isDarkMode.toString()); // localStorage에 다크 모드 상태 저장
  }, [isDarkMode]);

  //! 로그아웃 처리 함수
  const logout = useCallback(() => {
    if (confirm("로그아웃 하시겠습니까?")) {
      signout(); // Context API의 로그아웃 함수 호출
      alert("로그아웃 되었습니다.");
      router.push("/"); // 홈페이지로 리디렉션
    }
  }, [signout, router]);

  //! 헤더에 표시될 버튼들을 정의
  const headerButtons = useMemo(() => {
    const buttons = [];
    // 사용자가 로그인한 경우
    if (user) {
      buttons.push(
        {
          icon: <IoBookmarkOutline />, // 북마크 아이콘
          onClick: () => router.push("/bookmark"), // 북마크 페이지로 이동하는 함수
        },
        {
          icon: (
            <div className="relative text-2xl">
              <IoNotificationsOutline />
              {hasUnread && (
                // 읽지 않은 알림이 있을 경우 생기는 표시
                <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-red-600 border border-white" />
              )}
            </div>
          ),
          onClick: () => setTimeout(() => router.push("/notification"), 100), // 알림 페이지로 이동하는 함수
        }
      );
    }

    //! 다크 모드 토글 버튼
    buttons.push({
      icon: isDarkMode ? <IoMoon /> : <IoSunny />, // 현재 모드에 따라 달 또는 해 아이콘 표시
      onClick: toggleDarkMode, // 다크 모드 토글 함수 호출
      className: twMerge(
        headBtn,
        isDarkMode ? "text-gray-800" : "text-white bg-black" // 다크 모드에 따른 스타일 변경
      ),
    });

    //! 로그인/로그아웃 버튼 (인증 페이지가 아닐 경우에만 표시)
    if (!isAuthPage) {
      buttons.push({
        label: user ? "로그아웃" : "로그인", // 로그인 상태에 따라 텍스트 변경
        onClick: () => (user ? logout() : router.push("/signin")), // 클릭 시 로그아웃 또는 로그인 페이지로 이동
        className: "text-2xl font-bold h-14 hover:opacity-80",
      });
    }
    return buttons;
  }, [user, isDarkMode, toggleDarkMode, logout, isAuthPage, router, hasUnread]);

  //! 읽지 않은 알림이 있는지 확인하는 useEffect
  useEffect(() => {
    if (!user) return; // 사용자가 로그인하지 않았으면 실행하지 않음

    const checkUnread = async () => {
      try {
        // Firestore에서 현재 사용자의 알림 컬렉션 조회
        const snapshot = await dbService
          .collection("users")
          .doc(user.uid)
          .collection("notification")
          .where("isRead", "==", false) // 읽지 않은 알림만 필터링
          .limit(1) // 최대 1개만 가져옴 (존재 여부만 확인)
          .get();
        setHasUnread(!snapshot.empty); // 스냅샷이 비어있지 않으면 읽지 않은 알림이 있다고 상태 업데이트
      } catch (error) {
        console.error("알림 체크 에러:", error);
      }
    };
    // 전역 스코프에 함수를 등록하여 필요할 때 호출할 수 있도록 함
    window.checkUnreadNotifications = checkUnread;
    checkUnread(); // 컴포넌트 마운트 시 읽지 않은 알림 확인
  }, [user]);

  return (
    <>
      <header className="flex items-center justify-between my-4 px-4 lg:max-w-300 mx-auto border-b-2 border-gray-300 pb-4">
        <Link
          href="/"
          className="hover:opacity-80 flex flex-row items-center gap-x-2"
        >
          <Image
            src={isDarkMode ? "/image/whitelogo1.PNG" : "/image/logo1.PNG"}
            alt="logo"
            height={80}
            width={80}
          />
          <span className="font-bold text-2xl whitespace-pre-line">
            방방{"\n"}콕콕
          </span>
        </Link>

        <ul className="hidden sm:flex items-center gap-x-4">
          {user && (
            <div className="text-2xl font-bold whitespace-nowrap flex">
              <div className="max-w-40 truncate">{user.nickname}</div>
              <p>님</p>
            </div>
          )}
          {headerButtons.map((btn, index) => (
            <li key={index}>
              <button
                onClick={btn.onClick}
                className={btn.className || headBtn}
              >
                {btn.icon || btn.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="sm:hidden">
          {isAuthPage ? (
            <button
              onClick={toggleDarkMode}
              className={twMerge(
                "grayButton text-xl",
                isDarkMode ? "text-gray-800" : "text-white bg-black"
              )}
            >
              {isDarkMode ? <IoMoon /> : <IoSunny />}
            </button>
          ) : (
            <button
              onClick={() => setIsMenuOpen(true)}
              className="text-4xl mx-2"
            >
              <IoMenu />
            </button>
          )}
        </div>
      </header>

      {isMenuOpen && !isAuthPage && (
        <div className="fixed inset-0 bg-gray-500/50 z-50 flex items-center justify-center sm:hidden">
          <div className="bg-white dark:bg-gray-300 p-6 rounded-xl shadow-lg w-[65vw] max-w-sm text-center">
            <div className="flex justify-end mb-1">
              <button onClick={() => setIsMenuOpen(false)} className="text-2xl">
                <IoCloseSharp className="dark:text-black" />
              </button>
            </div>

            {user && (
              <div className="text-2xl font-bold whitespace-nowrap flex justify-center mb-3 text-black">
                <div className="max-w-40 truncate">{user.nickname}</div>
                <p>님</p>
              </div>
            )}
            {headerButtons.map((btn, idx) => (
              <button
                key={idx}
                onClick={() => {
                  btn.onClick();
                  setIsMenuOpen(false);
                }}
                className={twMerge(
                  "w-full mb-2 ",
                  darkText,
                  btn.icon ? darkText : "mt-2 text-2xl font-bold sm:hidden"
                )}
              >
                {btn.icon || btn.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <Navbar />
    </>
  );
};

export default Header;
