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
import AlertModal from "@/components/AlertModal";
import MobileHeader from "./MobileHeader";

const HEAD_BUTTON_CLASS = "grayButton text-xl sm:text-2xl";

//! 초기 로딩 시 다크 모드 설정 (localStorage에서 값을 읽어와 적용)
const storedDarkMode =
  typeof window !== "undefined" ? localStorage.getItem("darkMode") : null;
if (storedDarkMode === "true") {
  document.documentElement.classList.add("dark"); // HTML 요소에 'dark' 클래스 추가
}

const Header = () => {
  const [isDarkMode, setIsDarkMode] = useState(
    storedDarkMode === "true" || false
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false); // 모바일 메뉴 상태 관리
  const [hasUnread, setHasUnread] = useState(false); // 읽지 않은 알림 존재 여부 상태
  const [showLogoutModal, setShowLogoutModal] = useState(false); // 로그아웃 모달 상태

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

  //! 로그아웃 처리 함수 (AlertModal 표시)
  const handleLogout = useCallback(() => setShowLogoutModal(true), []);

  //! AlertModal에서 로그아웃을 최종 확인한 경우 실행
  const handleConfirmLogout = useCallback(() => {
    signout();
    router.push("/");
  }, [signout, router]);

  //! isDarkMode 상태가 변경될 때마다 실행
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    localStorage.setItem("darkMode", isDarkMode.toString()); // localStorage에 다크 모드 상태 저장
  }, [isDarkMode]);

  //! 헤더에 표시될 버튼들을 정의
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
                // 읽지 않은 알림이 있을 경우 생기는 표시
                <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-red-600 border border-white" />
              )}
            </div>
          ),
          onClick: () => setTimeout(() => router.push("/notification"), 100), // 알림 버튼
        }
      );
    }

    //! 다크 모드 토글 버튼
    buttons.push({
      icon: isDarkMode ? <IoMoon /> : <IoSunny />, // 현재 모드에 따라 달 또는 해 아이콘 표시
      onClick: toggleDarkMode, // 다크 모드 토글 함수 호출
      className: twMerge(
        HEAD_BUTTON_CLASS,
        isDarkMode ? "text-gray-800" : "text-white bg-black"
      ),
    });

    //! 로그인/로그아웃 버튼 (인증 페이지가 아닐 경우에만 표시)
    if (!isAuthPage) {
      buttons.push({
        label: user ? "로그아웃" : "로그인", // 로그인 상태에 따라 텍스트 변경
        onClick: () => (user ? handleLogout() : router.push("/signin")), // 클릭 시 로그아웃 또는 로그인 페이지로 이동
        className: "text-2xl font-bold h-14 hover:opacity-80",
      });
    }
    return buttons;
  }, [
    user,
    isDarkMode,
    toggleDarkMode,
    handleLogout,
    isAuthPage,
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
        setHasUnread(!snapshot.empty); // 스냅샷이 비어있지 않으면 읽지 않은 알림이 있다고 상태 업데이트
      } catch (error) {
        console.error("알림 체크 에러:", error);
      }
    };

    window.checkUnreadNotifications = checkUnreadNotifications; // 전역 스코프에 함수 등록 (필요시 외부에서 호출 가능)
    checkUnreadNotifications(); // 컴포넌트 마운트 시 읽지 않은 알림 확인
  }, [user]);

  return (
    <>
      <div className="fixed top-0 left-1/2 translate-x-[-50%] w-full z-50 flex justify-center shadow-sm">
        <header className="bg-white dark:bg-[#333333] w-full flex items-center justify-between px-4 py-4 lg:max-w-300 mx-auto">
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
                  className={btn.className || HEAD_BUTTON_CLASS}
                >
                  {btn.icon || btn.label}
                </button>
              </li>
            ))}
          </ul>

          {/* 모바일 햄버거 메뉴 */}
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

        {/* 모바일 헤더 메뉴창 */}
        <MobileHeader
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          hasUnread={hasUnread}
        />

        {/* 로그아웃 확인 모달 */}
        {showLogoutModal && (
          <AlertModal
            message="정말로 로그아웃 하시겠습니까?"
            onClose={() => setShowLogoutModal(false)}
            onConfirm={handleConfirmLogout}
            showCancel
          />
        )}
      </div>

      <Navbar />
    </>
  );
};

export default Header;
