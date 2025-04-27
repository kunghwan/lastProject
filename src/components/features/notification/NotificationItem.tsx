// "use client";
// import Loaiding from "@/components/Loading/page";
// import { AUTH } from "@/contextapi/context";
// import { dbService, FBCollection } from "@/lib";
// import { useRouter } from "next/navigation";
// import { useCallback, useEffect, useMemo, useState } from "react";
// import { twMerge } from "tailwind-merge";
// import { useInfiniteQuery } from "@tanstack/react-query";
// import { useInView } from "react-intersection-observer";
// import { Notifications } from "@/types/notification";

// const NotificationItem = () => {
//   const { user } = AUTH.use();
//   const navi = useRouter();
//   const uid = user?.uid;
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPage, setTotalPage] = useState(0);
//   const { ref: inViewRef, inView } = useInView({ threshold: 0.75 });

//   const fetchNotifications = useCallback(
//     async ({
//       pageParam = 1,
//     }: {
//       pageParam?: number;
//     }): Promise<Notifications[]> => {
//       const ref = dbService
//         .collection(FBCollection.USERS)
//         .doc(uid)
//         .collection("notification")
//         .orderBy("createdAt", "desc");

//       const snap = await ref.get();
//       const totalCount = snap.docs.length;
//       const totalPages = Math.ceil(totalCount / 10);

//       const start = (pageParam - 1) * 10;
//       const end = pageParam * 10;
//       const slicedDocs = snap.docs.slice(start, end);

//       const notifications = slicedDocs.map(
//         (doc) => ({ ...doc.data(), id: doc.id } as Notifications)
//       );
//       return notifications;
//     },
//     [uid]
//   );

//   const {
//     data,
//     fetchNextPage,
//     hasNextPage,
//     isFetchingNextPage,
//     isPending,
//     error,
//   } = useInfiniteQuery({
//     queryKey: ["notifications", uid],
//     queryFn: ({ pageParam }) => fetchNotifications({ pageParam }),
//     initialPageParam: 1,
//     getNextPageParam: (lastPage, allPages) => {
//       if (lastPage.length < 10) return undefined;
//       return allPages.length + 1;
//     },
//     enabled: !!uid,
//   });
//   console.log("리렌더링됨");
//   console.log(data, 58);

//   const allNotifications = useMemo(
//     () => data?.pages.flatMap((page) => page) ?? [],
//     [data]
//   );

//   useEffect(() => {
//     if (inView && hasNextPage && !isFetchingNextPage) {
//       fetchNextPage();
//     }
//   }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

//   const handleNotificationClick = async (noti: Notifications) => {
//     if (!noti.isRead) {
//       await dbService
//         .collection(FBCollection.USERS)
//         .doc(uid)
//         .collection("notification")
//         .doc(noti.id)
//         .update({ isRead: true });
//     }
//     console.log("알림 클릭됨:", noti.id);
//   };

//   if (isPending) {
//     return <Loaiding />;
//   }
//   if (error || !data) {
//     return <h1>Error: {error.message}</h1>;
//   }

//   return (
//     <div>
//       {allNotifications.length === 0 ? (
//         <div>
//           <h1>알림이 없습니다.</h1>
//           <button onClick={() => navi.back()}>돌아가기</button>
//         </div>
//       ) : (
//         <ul>
//           {allNotifications.map((noti) => (
//             <li
//               key={noti.id}
//               onClick={() => {
//                 handleNotificationClick(noti);
//                 return navi.push(`/profile/${noti.followerId}`);
//               }}
//               className={twMerge(
//                 "",
//                 noti.isRead ? "text-gray-400" : "text-black font-semibold"
//               )}
//             >
//               <p>{noti.follwingNickname}</p> 님이 팔로우했습니다.
//               <p>{new Date(noti.createdAt).toLocaleString()}</p>
//             </li>
//           ))}
//         </ul>
//       )}
//       <div ref={inViewRef} />
//       {hasNextPage && (
//         <button
//           onClick={() => fetchNextPage()}
//           disabled={isFetchingNextPage}
//           className="w-full p-2 mt-4"
//         >
//           {isFetchingNextPage ? "불러오는 중..." : "더보기"}
//         </button>
//       )}
//     </div>
//   );
// };

// export default NotificationItem;
