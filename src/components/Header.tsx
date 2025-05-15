"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  IoMoon,
  IoSunny,
  IoBookmarkOutline,
  IoMenu,
  IoNotificationsOutline,
} from "react-icons/io5";
import { usePathname, useRouter } from "next/navigation";
import { AUTH } from "@/contextapi/context";
import { twMerge } from "tailwind-merge";
import Navbar from "./features/navber/Navbar";
import { dbService } from "@/lib";
import MobileHeader from "./MobileHeader";
import { useAlertModal } from "@/components/AlertStore";

const headBtn = "grayButton text-xl sm:text-2xl";

//! 초기 로딩 시 다크 모드 설정
const storedDarkMode =
  typeof window !== "undefined" ? localStorage.getItem("darkMode") : null;
if (storedDarkMode === "true") {
  document.documentElement.classList.add("dark");
}

const Header = () => {
  const [isDarkMode, setIsDarkMode] = useState(
    storedDarkMode === "true" || false
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false); // 모바일 메뉴 상태 관리
  const [hasUnread, setHasUnread] = useState(false); // 읽지 않은 알림 존재 여부 상태

  const router = useRouter();
  const pathname = usePathname();

  const { user, signout } = AUTH.use(); //! Context API를 통해 사용자 인증 상태 및 로그아웃 함수 가져오기
  const { openAlert } = useAlertModal(); //! AlertModal 오픈 함수 가져오기

  //! 현재 경로가 로그인 또는 회원가입 페이지인지 확인
  const isAuthPage = useMemo(
    () => ["/signin", "/signup"].includes(pathname!),
    [pathname]
  );

  //! 다크 모드 토글 함수
  const toggleDarkMode = useCallback(() => setIsDarkMode((prev) => !prev), []);

  //! 로그아웃 버튼 클릭 시 AlertModal 표시
  const handleLogout = useCallback(() => {
    openAlert("정말로 로그아웃 하시겠습니까?", [
      {
        text: "예",
        isGreen: true,
        autoFocus: true,
        onClick: () => {
          signout();
          router.push("/");
        },
      },
      {
        text: "아니오",
        isGreen: false,
      },
    ]);
  }, [openAlert, signout, router]);

  //! isDarkMode 상태가 변경될 때마다 실행
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    localStorage.setItem("darkMode", isDarkMode.toString()); // localStorage에 다크 모드 상태 저장
  }, [isDarkMode]);

  //! 헤더에 표시될 버튼들을 정의
  const isSigninPage = pathname === "/signin";
  const isSignupPage = pathname === "/signup";

  const headerButtons = useMemo(() => {
    const buttons = [];

    if (user) {
      buttons.push(
        {
          icon: <IoBookmarkOutline />,
          onClick: () => router.push("/bookmark"),
        },
        {
          icon: (
            <div className="relative text-2xl">
              <IoNotificationsOutline />
              {hasUnread && (
                <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-red-600 border border-white" />
              )}
            </div>
          ),
          onClick: () => setTimeout(() => router.push("/notification"), 100),
        }
      );
    }

    buttons.push({
      icon: isDarkMode ? <IoMoon /> : <IoSunny />,
      onClick: toggleDarkMode,
      className: twMerge(
        headBtn,
        isDarkMode ? "text-gray-800" : "text-white bg-black"
      ),
    });

    if (!isSigninPage) {
      if (user) {
        buttons.push({
          label: "로그아웃",
          onClick: handleLogout,
          className: "text-2xl font-bold h-14 hover:opacity-80",
        });
      } else {
        if (isSignupPage) {
          buttons.push({
            label: "로그인",
            onClick: () => router.push("/signin"),
            className: "text-2xl font-bold h-14 hover:opacity-80",
          });
        } else {
          buttons.push(
            {
              label: "로그인",
              onClick: () => router.push("/signin"),
              className: "text-2xl font-bold h-14 hover:opacity-80",
            },
            {
              label: "회원가입",
              onClick: () => router.push("/signup"),
              className: "text-2xl font-bold h-14 hover:opacity-80",
            }
          );
        }
      }
    }

    return buttons;
  }, [
    user,
    isDarkMode,
    toggleDarkMode,
    handleLogout,
    isSigninPage,
    isSignupPage,
    router,
    hasUnread,
  ]);

  //! 읽지 않은 알림이 있는지 확인하는 useEffect
  useEffect(() => {
    if (!user) return; // 사용자가 로그인하지 않았으면 실행하지 않음

    const checkUnreadNotifications = async () => {
      try {
        // Firestore에서 현재 사용자의 알림 컬렉션 조회
        const snapshot = await dbService
          .collection("users")
          .doc(user.uid)
          .collection("notification")
          .where("isRead", "==", false) // 읽지 않은 알림만 필터링
          .limit(1) // 최대 1개만 가져옴 (존재 여부만 확인)
          .get();

        setHasUnread(!snapshot.empty); // 읽지 않은 알림이 하나라도 있으면 true
      } catch (error) {
        console.error("알림 체크 에러:", error);
      }
    };

    window.checkUnreadNotifications = checkUnreadNotifications; //외부에서 호출할 수 있도록 전역 등록
    checkUnreadNotifications(); // 컴포넌트 마운트 시 실행
  }, [user]);

  return (
    <>
      <div className="fixed top-0 left-1/2 translate-x-[-50%] h-[13vh] w-full z-50 flex justify-center shadow-sm dark:border-b-2 dark:border-emerald-100">
        <header className="bg-white dark:bg-[#333333] w-full flex items-center justify-between px-4 py-4 lg:max-w-300 mx-auto">
          {/* 로고 영역 */}
          <Link href="/" className="hover:opacity-80 flex items-center gap-x-2">
            <Image
              src={
                isDarkMode
                  ? "/image/darkmode_logo.png"
                  : "/image/normal_logo.png"
              }
              alt="logo"
              height={80}
              width={80}
            />
            <span className="font-bold text-2xl whitespace-pre-line">
              방방{"\n"}콕콕
            </span>
          </Link>

          {/* 데스크탑 메뉴 */}
          <ul className="hidden sm:flex items-center gap-x-4">
            {user && (
              <div className="text-2xl font-bold whitespace-nowrap flex">
                <div className="truncate max-w-40">{user.nickname}</div>
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

          {/* 모바일 햄버거 메뉴 + 다크모드 버튼 */}
          <div className="sm:hidden flex items-center gap-x-3">
            {/* 다크모드 버튼 항상 표시 */}
            <button
              onClick={toggleDarkMode}
              className={twMerge(
                "grayButton text-xl",
                isDarkMode ? "text-gray-800" : "text-white bg-black"
              )}
            >
              {isDarkMode ? <IoMoon /> : <IoSunny />}
            </button>

            {/* 로그인/회원가입 페이지가 아닐 때 햄버거 메뉴 표시 */}
            {!isAuthPage && (
              <button onClick={() => setIsMenuOpen(true)} className="text-4xl">
                <IoMenu />
              </button>
            )}
          </div>
        </header>

        {/* 모바일 메뉴 컴포넌트 */}
        <MobileHeader
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          hasUnread={hasUnread}
        />
      </div>

      {/* 하단 네비게이션 */}
      <Navbar />
    </>
  );
};

export default Header;
