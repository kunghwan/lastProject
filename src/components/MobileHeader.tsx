"use client";

import { useCallback, useMemo } from "react";
import {
  IoCloseSharp,
  IoBookmark,
  IoPersonSharp,
  IoStar,
  IoLogIn,
  IoLogOut,
  IoPersonAdd,
} from "react-icons/io5";
import { FaCircleQuestion, FaMessage, FaPencil, FaBell } from "react-icons/fa6";
import { useRouter } from "next/navigation";
import { AUTH } from "@/contextapi/context";
import { twMerge } from "tailwind-merge";
import { useAlertModal } from "@/components/AlertStore";

// 버튼 스타일 클래스 정의
const btnClass = twMerge(
  "flex flex-col items-center justify-center gap-1 px-1 py-4 rounded-lg font-semibold text-md",
  "bg-gray-200 dark:bg-[#373737] text-black dark:text-[#F1F5F9]",
  "hover:bg-gray-300 dark:hover:bg-[#444444] w-20 h-20",
  "transition-colors duration-200"
);

// 버튼 데이터 타입 정의
interface BtnType {
  label: string; // 버튼 이름
  icon?: React.ReactNode; // 아이콘
  path?: string; // 이동 경로
  auth?: boolean; // 로그인 여부 필요한 기능인지
  action?: () => void; // 커스텀 액션 함수 (예: 로그아웃)
}

// 모바일 헤더 컴포넌트
const MobileHeader = ({
  isMenuOpen,
  setIsMenuOpen,
  hasUnread,
}: {
  isMenuOpen: boolean; // 메뉴 열림 여부
  setIsMenuOpen: (open: boolean) => void; // 메뉴 상태 제어 함수
  hasUnread: boolean; // 읽지 않은 알림 여부
}) => {
  const router = useRouter();
  const { user, signout } = AUTH.use(); // 사용자 정보 및 로그아웃 함수
  const { openAlert } = useAlertModal(); // 알림 모달 함수

  // 메뉴 닫기
  const closeMenu = () => setIsMenuOpen(false);

  // 실제 로그아웃 처리 함수
  const performLogout = () => {
    signout(); // 로그아웃
    router.push("/"); // 홈으로 이동
    closeMenu(); // 메뉴 닫기
  };

  // 로그아웃 버튼 클릭 시 확인 모달 표시
  const handleLogoutClick = () => {
    openAlert("정말로 로그아웃 하시겠습니까?", [
      { text: "아니요" },
      {
        text: "네",
        isGreen: true,
        autoFocus: true,
        onClick: performLogout,
      },
    ]);
    closeMenu();
  };

  // 알림 아이콘 (읽지 않은 알림이 있을 경우 빨간 점 표시)
  const notificationIcon = (
    <div className="relative text-2xl">
      <FaBell />
      {hasUnread && (
        <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-red-600 border border-white" />
      )}
    </div>
  );

  // 로그인 여부와 무관한 기본 버튼 목록
  const baseButtons = useMemo(
    () => [
      { label: "Q&A", icon: <FaCircleQuestion />, path: "/customer" },
      { label: "추천", icon: <IoStar />, path: "/upplace" },
      { label: "피드", icon: <FaMessage />, path: "/feed" },
      {
        label: "글쓰기",
        icon: <FaPencil />,
        path: "/profile/create",
        auth: true, // 로그인 필요
      },
      { label: "MY", icon: <IoPersonSharp />, path: "/profile", auth: true },
    ],
    []
  );

  // 로그인 여부에 따라 버튼 목록 구성
  const buttons: BtnType[] = useMemo(() => {
    if (user) {
      return [
        { label: "북마크", icon: <IoBookmark />, path: "/bookmark" },
        { label: "알림", icon: notificationIcon, path: "/notification" },
        { label: "로그아웃", icon: <IoLogOut />, action: handleLogoutClick },
        ...baseButtons,
      ];
    }
    return [
      { label: "로그인", icon: <IoLogIn />, path: "/signin" },
      { label: "회원가입", icon: <IoPersonAdd />, path: "/signup" },
      ...baseButtons,
    ];
  }, [user, hasUnread, baseButtons]);

  // 버튼 클릭 핸들러
  const handleButtonClick = useCallback(
    (btn: BtnType) => {
      if (btn.action) return btn.action(); // 커스텀 액션 실행 (ex. 로그아웃)
      if (btn.auth && !user) {
        // 로그인 필요한 기능인데 로그인 안된 경우
        openAlert(
          "유저만 이용 가능한 기능입니다.\n로그인 하시겠습니까?",
          [
            { text: "아니요" },
            {
              text: "네",
              isGreen: true,
              autoFocus: true,
              onClick: () => {
                router.push("/signin");
                closeMenu();
              },
            },
          ],
          "로그인이 필요합니다."
        );
        return;
      }
      if (btn.path) {
        router.push(btn.path); // 지정된 경로로 이동
        closeMenu();
      }
    },
    [user, router, openAlert]
  );

  // 버튼 렌더링 함수
  const renderButtons = () => (
    <div className="grid grid-cols-2 gap-2 justify-items-center items-center">
      {buttons.map((btn, idx) => (
        <button
          key={idx}
          onClick={() => handleButtonClick(btn)}
          className={btnClass}
        >
          {btn.icon && <span className="text-2xl">{btn.icon}</span>}
          <span>{btn.label}</span>
        </button>
      ))}
    </div>
  );

  return (
    <>
      {/* 메뉴가 열려 있을 경우만 렌더링 */}
      {isMenuOpen && (
        <div
          className="fixed h-screen w-full bg-gray-500/50 z-50 flex items-center justify-center sm:hidden"
          onClick={closeMenu} // 배경 클릭 시 메뉴 닫기
        >
          <div
            className="bg-white dark:bg-zinc-500 p-6 rounded-xl shadow-lg w-[60vw] mx-auto text-center flex flex-col"
            onClick={(e) => e.stopPropagation()} // 내부 클릭 시 닫힘 방지
          >
            {/* 닫기 버튼 */}
            <div className="flex justify-end mb-2">
              <button onClick={closeMenu} className="text-2xl">
                <IoCloseSharp className="dark:text-white m-1" />
              </button>
            </div>

            {/* 사용자 닉네임 출력 */}
            {user && (
              <div className="text-2xl font-bold whitespace-nowrap flex justify-center mb-6 text-black dark:text-white">
                <div className="max-w-40 truncate">{user.nickname}</div>
                <p className="font-medium ml-1">님</p>
              </div>
            )}

            {/* 버튼 목록 렌더링 */}
            {renderButtons()}
          </div>
        </div>
      )}
    </>
  );
};

export default MobileHeader;
