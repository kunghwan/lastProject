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

interface BtnType {
  label: string;
  icon?: React.ReactNode;
  path?: string;
  auth?: boolean;
  action?: () => void;
}

const MobileHeader = ({
  isMenuOpen,
  setIsMenuOpen,
  hasUnread,
}: {
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  hasUnread: boolean;
}) => {
  const router = useRouter();
  const { user, signout } = AUTH.use();
  const { openAlert } = useAlertModal();

  const closeMenu = () => setIsMenuOpen(false);

  const performLogout = () => {
    signout();
    router.push("/");
    closeMenu();
  };

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

  const notificationIcon = (
    <div className="relative text-2xl">
      <FaBell />
      {hasUnread && (
        <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-red-600 border border-white" />
      )}
    </div>
  );

  // 버튼 배열: 로그인 상태에 따라 포함
  const buttons: BtnType[] = useMemo(() => {
    const baseButtons: BtnType[] = [
      {
        label: "Q&A",
        icon: <FaCircleQuestion className="text-2xl" />,
        path: "/customer",
      },
      {
        label: "추천",
        icon: <IoStar className="text-2xl" />,
        path: "/upplace",
      },
      {
        label: "피드",
        icon: <FaMessage className="text-2xl" />,
        path: "/feed",
      },
      {
        label: "글쓰기",
        icon: <FaPencil className="text-2xl" />,
        path: "/profile/create",
        auth: true,
      },
      {
        label: "MY",
        icon: <IoPersonSharp className="text-2xl" />,
        path: "/profile",
        auth: true,
      },
    ];

    if (user) {
      return [
        {
          label: "북마크",
          icon: <IoBookmark className="text-2xl" />,
          path: "/bookmark",
        },
        { label: "알림", icon: notificationIcon, path: "/notification" },
        {
          label: "로그아웃",
          icon: <IoLogOut className="text-2xl" />,
          action: handleLogoutClick,
        },
        ...baseButtons,
      ];
    } else {
      return [
        {
          label: "로그인",
          icon: <IoLogIn className="text-2xl" />,
          path: "/signin",
        },
        {
          label: "회원가입",
          icon: <IoPersonAdd className="text-2xl" />,
          path: "/signup",
        },
        ...baseButtons,
      ];
    }
  }, [user, hasUnread]);

  const btnClass = twMerge(
    "flex flex-col items-center justify-center gap-1 px-1 py-4 rounded-lg font-semibold text-md",
    "bg-gray-200 dark:bg-[#373737] text-black dark:text-[#F1F5F9]",
    "hover:bg-gray-300 dark:hover:bg-[#444444] w-20 h-20",
    "transition-colors duration-200"
  );

  const onButtonClick = useCallback(
    (btn: BtnType) => {
      if (btn.action) {
        btn.action();
        return;
      }
      if (btn.auth && !user) {
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
        router.push(btn.path);
        closeMenu();
      }
    },
    [user, router, openAlert]
  );

  return (
    <>
      {isMenuOpen && (
        <div
          className="fixed h-screen w-full bg-gray-500/50 z-50 flex items-center justify-center sm:hidden"
          onClick={closeMenu} // 배경 클릭 시 메뉴 닫기
        >
          <div
            className="bg-white dark:bg-zinc-500 p-6 rounded-xl shadow-lg  w-[60vw] mx-auto  text-center flex flex-col"
            onClick={(e) => e.stopPropagation()} // 내부 클릭 시 이벤트 전파 막기
          >
            {/* 닫기 버튼 */}
            <div className="flex justify-end mb-2">
              <button onClick={closeMenu} className="text-2xl">
                <IoCloseSharp className="dark:text-white m-1 text-2xl" />
              </button>
            </div>

            {/* 닉네임 */}
            {user && (
              <div className="text-2xl font-bold whitespace-nowrap flex justify-center mb-6 text-black dark:text-white">
                <div className="max-w-40 truncate">{user.nickname}</div>
                <p className="font-medium ml-1">님</p>
              </div>
            )}

            {/* 버튼 리스트 */}
            <div className="grid grid-cols-2 gap-2 justify-items-center items-center">
              {buttons.map((btn, idx) => (
                <button
                  key={idx}
                  onClick={() => onButtonClick(btn)}
                  className={btnClass}
                >
                  {btn.icon && <span className="text-2xl">{btn.icon}</span>}
                  <span>{btn.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileHeader;
