"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { IoMoon, IoSunny, IoBookmarkOutline } from "react-icons/io5";
import { VscBell } from "react-icons/vsc";
import { HiMenu, HiX } from "react-icons/hi";
import { usePathname, useRouter } from "next/navigation";
import { AUTH } from "@/contextapi/context";
import { twMerge } from "tailwind-merge";

const Header = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const { user, signout } = AUTH.use();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const handleLogout = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      signout();
      alert("로그아웃 되었습니다.");
      router.push("/");
    }
  };

  return (
    <>
      <header className="flex items-center justify-between my-4 max-w-full px-4 lg:max-w-300 mx-auto border-b-2 border-gray-300 pb-4">
        {/* 로고 */}
        <Link href="/" className="hover:opacity-80">
          <Image
            src={isDarkMode ? "/image/whitelogo1.PNG" : "/image/logo1.PNG"}
            alt="logo"
            height={80}
            width={80}
          />
        </Link>

        {/* 메뉴: PC용 */}
        <ul className="hidden sm:flex items-center gap-x-3 sm:gap-x-5">
          {user && (
            <>
              <div className="hidden sm:flex sm:text-2xl font-bold items-end max-w-[100px] truncate whitespace-nowrap overflow-hidden">
                {user.name}
                <p className="font-light text-2xl ml-1">님</p>
              </div>
              <div className="flex gap-x-2 sm:gap-x-4">
                <li>
                  <button
                    className="grayButton text-xl sm:text-2xl"
                    onClick={() => router.push("/map")}
                  >
                    <IoBookmarkOutline />
                  </button>
                </li>
                <li>
                  <button
                    className="grayButton text-xl sm:text-2xl"
                    onClick={() => router.push("/notification")}
                  >
                    <VscBell />
                  </button>
                </li>
              </div>
            </>
          )}
          <button
            onClick={() => setIsDarkMode((prev) => !prev)}
            className={twMerge(
              "grayButton text-white text-xl sm:text-2xl",
              isDarkMode ? "text-gray-800" : "bg-black"
            )}
          >
            {isDarkMode ? <IoMoon /> : <IoSunny />}
          </button>

          {!["/signin", "/signup"].includes(pathname) && (
            <button
              className="grayButton text-sm font-bold h-14"
              onClick={() => (user ? handleLogout() : router.push("/signin"))}
            >
              {user ? "로그아웃" : "로그인"}
            </button>
          )}
        </ul>

        {/* 메뉴: 모바일 햄버거 버튼 */}
        <div className="sm:hidden">
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="text-3xl"
          >
            {menuOpen ? <HiX /> : <HiMenu />}
          </button>
        </div>
      </header>

      {/* 모바일 드롭다운 메뉴 */}
      {menuOpen && (
        <div className="sm:hidden fixed top-[92px] left-0 w-full z-40 bg-white dark:bg-black px-4 pb-4 space-y-3 border-b-2 border-gray-300 shadow-md">
          {user && (
            <>
              <div className="text-lg font-semibold">{user.name}님</div>
              <button
                className="grayButton w-full"
                onClick={() => {
                  router.push("/map");
                  setMenuOpen(false);
                }}
              >
                <IoBookmarkOutline className="inline-block mr-2" />
                북마크
              </button>
              <button
                className="grayButton w-full"
                onClick={() => {
                  router.push("/notification");
                  setMenuOpen(false);
                }}
              >
                <VscBell className="inline-block mr-2" />
                알림
              </button>
            </>
          )}
          <button
            className="grayButton w-full"
            onClick={() => {
              setIsDarkMode((prev) => !prev);
              setMenuOpen(false);
            }}
          >
            {isDarkMode ? (
              <>
                <IoMoon className="inline-block mr-2" />
                다크모드
              </>
            ) : (
              <>
                <IoSunny className="inline-block mr-2" />
                라이트모드
              </>
            )}
          </button>
          {!["/signin", "/signup"].includes(pathname) && (
            <button
              className="grayButton w-full"
              onClick={() => {
                user ? handleLogout() : router.push("/signin");
                setMenuOpen(false);
              }}
            >
              {user ? "로그아웃" : "로그인"}
            </button>
          )}
        </div>
      )}
    </>
  );
};

export default Header;

// "use client";

// import Image from "next/image";
// import Link from "next/link";
// import { useEffect, useState } from "react";
// import { IoMoon, IoSunny, IoBookmarkOutline } from "react-icons/io5";
// import { VscBell } from "react-icons/vsc";
// import { usePathname, useRouter } from "next/navigation";
// import { AUTH } from "@/contextapi/context";
// import { twMerge } from "tailwind-merge";

// const Header = () => {
//   const [isDarkMode, setIsDarkMode] = useState(false);

//   const router = useRouter();
//   const pathname = usePathname();
//   const { user, signout } = AUTH.use();

//   useEffect(() => {
//     if (isDarkMode) {
//       document.documentElement.classList.add("dark");
//     } else {
//       document.documentElement.classList.remove("dark");
//     }
//   }, [isDarkMode]);

//   return (
//     <>
//       <header className="flex items-center justify-between my-4 max-w-full px-4 lg:max-w-300 mx-auto border-b-2 border-gray-300 pb-4">
//         {!isDarkMode ? (
//           <Link href="/" className="hover:opacity-80 ">
//             <Image src="/image/logo1.PNG" alt="logo" height={80} width={80} />
//           </Link>
//         ) : (
//           <Link href="/" className="hover:opacity-80">
//             <Image
//               src="/image/whitelogo1.PNG"
//               alt="logo"
//               height={80}
//               width={80}
//             />
//           </Link>
//         )}
//         <ul className="flex items-center gap-x-3 sm:gap-x-5">
//           {user && (
//             <>
//               <div className="hidden sm:flex sm:text-2xl font-bold items-end max-w-[100px] truncate whitespace-nowrap overflow-hidden">
//                 {user.name}
//                 <p className="font-light text-sm ml-1">님</p>
//               </div>
//               <div className="flex gap-x-2 sm:gap-x-4">
//                 {headerBtn.map((btn, index) => (
//                   <li key={index}>
//                     <button
//                       className="grayButton text-xl sm:text-2xl"
//                       onClick={() => router.push(btn.path)}
//                     >
//                       {btn.icon}
//                     </button>
//                   </li>
//                 ))}
//               </div>
//             </>
//           )}

//           <button
//             onClick={() => setIsDarkMode((prev) => !prev)}
//             className={twMerge(
//               "grayButton text-white text-xl sm:text-2xl",
//               isDarkMode ? "text-gray-800" : "bg-black"
//             )}
//           >
//             {isDarkMode ? <IoMoon /> : <IoSunny />}
//           </button>

//           {!["/signin", "/signup"].includes(pathname) && (
//             <button
//               className="grayButton text-sm font-bold h-14"
//               onClick={() =>
//                 user
//                   ? window.confirm("로그아웃 하시겠습니까?") &&
//                     (signout(), alert("로그아웃 되었습니다."), router.push("/"))
//                   : router.push("/signin")
//               }
//             >
//               {user ? "로그아웃" : "로그인"}
//             </button>
//           )}
//         </ul>
//       </header>
//     </>
//   );
// };

// export default Header;

// const headerBtn = [
//   { icon: <IoBookmarkOutline />, path: "/map" },
//   {
//     icon: <VscBell />,
//     path: "/notification",
//   },
// ];
// "use client";

// import Image from "next/image";
// import Link from "next/link";
// import { useEffect, useState } from "react";
// import { IoMoon, IoSunny, IoBookmarkOutline } from "react-icons/io5";
// import { VscBell } from "react-icons/vsc";
// import { usePathname, useRouter } from "next/navigation";
// import { AUTH } from "@/contextapi/context";
// import { twMerge } from "tailwind-merge";

// interface HeaderProps {
//   hasNewNotification: boolean;
//   clearNotifications: () => void;
// }

// const Header = ({ hasNewNotification, clearNotifications }: HeaderProps) => {
//   const [isDarkMode, setIsDarkMode] = useState(false);
//   const router = useRouter();
//   const pathname = usePathname();
//   const { user, signout } = AUTH.use();

//   useEffect(() => {
//     if (isDarkMode) {
//       document.documentElement.classList.add("dark");
//     } else {
//       document.documentElement.classList.remove("dark");
//     }
//   }, [isDarkMode]);

//   const handleNotificationClick = () => {
//     clearNotifications();
//     router.push("/notification");
//   };

//   return (
//     <header className="flex items-center justify-between my-4 max-w-full px-4 lg:max-w-300 mx-auto border-b-2 border-gray-300 pb-4 ">
//       <Link href="/" className="hover:opacity-80">
//         <Image
//           src={isDarkMode ? "/image/whitelogo1.PNG" : "/image/logo1.PNG"}
//           alt="logo"
//           height={80}
//           width={80}
//         />
//       </Link>

//       <ul className="flex items-center gap-x-3 sm:gap-x-5">
//         {user && (
//           <>
//             <div className="hidden sm:flex sm:text-2xl font-bold items-end max-w-[100px] truncate whitespace-nowrap overflow-hidden">
//               {user.name}
//               <p className="font-light text-sm ml-1">님</p>
//             </div>
//             <div className="flex gap-x-2 sm:gap-x-4">
//               <li>
//                 <button
//                   className="grayButton text-xl sm:text-2xl"
//                   onClick={() => router.push("/map")}
//                 >
//                   <IoBookmarkOutline />
//                 </button>
//               </li>
//               <li className="relative">
//                 <button
//                   className="grayButton text-xl sm:text-2xl"
//                   onClick={handleNotificationClick}
//                 >
//                   <VscBell />
//                   {!hasNewNotification && (
//                     <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
//                   )}
//                 </button>
//               </li>
//             </div>
//           </>
//         )}

//         <button
//           onClick={() => setIsDarkMode((prev) => !prev)}
//           className={twMerge(
//             "grayButton text-white text-xl sm:text-2xl",
//             isDarkMode ? "text-gray-800" : "bg-black"
//           )}
//         >
//           {isDarkMode ? <IoMoon /> : <IoSunny />}
//         </button>

//         {!["/signin", "/signup"].includes(pathname) && (
//           <button
//             className="grayButton text-sm font-bold h-14"
//             onClick={() =>
//               user
//                 ? window.confirm("로그아웃 하시겠습니까?") &&
//                   (signout(), alert("로그아웃 되었습니다."), router.push("/"))
//                 : router.push("/signin")
//             }
//           >
//             {user ? "로그아웃" : "로그인"}
//           </button>
//         )}
//       </ul>
//     </header>
//   );
// };

// export default Header;
