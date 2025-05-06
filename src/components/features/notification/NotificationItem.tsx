//! '알림 애니메이션 구현 폐기'

// "use client";

// import { AUTH } from "@/contextapi/context";
// import { dbService, FBCollection } from "@/lib";
// import { Notifications } from "@/types/notification";
// import { useRouter } from "next/navigation";
// import React, { useCallback, useEffect, useState } from "react";
// import { useInView } from "react-intersection-observer";
// import { twMerge } from "tailwind-merge";

// const NotificationItem = ({ noti }: { noti: Notifications }) => {
//   const navi = useRouter();
//   const { user } = AUTH.use();
//   const [mounted, setMounted] = useState(false);
//   const uid = user?.uid;
//   //! 알림을 클릭하면 그알림을 isRead를 true로 바꾸는 함수
//   const handleNotificationClick = useCallback(
//     async (noti: Notifications) => {
//       if (!noti.isRead) {
//         await dbService
//           .collection(FBCollection.USERS)
//           .doc(uid)
//           .collection(FBCollection.NOTIFICATION)
//           .doc(noti.id) // 이 알림 하나!
//           .update({ isRead: true });
//       }
//       //Todo: 매개변수로 받은 특정 알림 한 건만 .update()하기 때문 //하나의 알림 에만 update를 검("하나만" 업데이트하는 용도)
//       // 예: 상세페이지 이동 등
//       return console.log("알림 클릭됨:", noti.id);
//     },
//     [uid]
//   );
//   const { ref: viewRef, inView } = useInView({
//     triggerOnce: true, // 한 번만 작동$
//     threshold: 0.1, // 10% 보이면 활성화
//     initialInView: true, // 처음 렌더링 시 무조건 inView true → opacity-100 → 바로 보임
//   });
//   useEffect(() => {
//     setMounted(true);
//   }, []);
//   return (
//     <li
//       key={noti.id}
//       ref={viewRef}
//       onClick={() => {
//         handleNotificationClick(noti);
//         return navi.push(`/profile/${noti.follwerId}`);
//       }}
//       className={twMerge(
//         " hover:shadow-sm hsecol  gap-x-2.5  justify-center p-2.5 rounded-xl w-full cursor-pointer ",
//         mounted
//           ? inView
//             ? "opacity-100 translate-y-0"
//             : "opacity-0 translate-y-5"
//           : "opacity-100 translate-y-0", // 최초 mount 시에는 무조건 보이게!
//         noti.isRead
//           ? "text-gray-500 border dark:border-gray-700 border-gray-200 bg-gray-100 dark:bg-gray-500 dark:text-gray-300"
//           : "text-black font-semibold border border-gray-200 hover:text-lime-700 dark:hover:text-lime-200  bg-[rgba(232,255,241)] dark:bg-[rgba(232,255,241,0.4)] dark:text-white"
//       )}
//     >
//       <p className="font-bold text-md">
//         {noti.followerNickname}님이 팔로우했습니다.
//       </p>
//       <p className="text-sm font-light">{noti.createdAt.toString()}</p>
//     </li>
//   );
// };

// export default NotificationItem;
