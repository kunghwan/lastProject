// "use client";

// import Loaiding from "@/components/Loading/page";
// import { AUTH } from "@/contextapi/context";
// import { dbService, FBCollection } from "@/lib";

// import { useRouter } from "next/navigation";
// import { useEffect, useMemo, useState } from "react";
// import { twMerge } from "tailwind-merge";
// import { useInfiniteQuery } from "@tanstack/react-query";
// import { useInView } from "react-intersection-observer";
// import { Notification } from "@/types/notification";

// const page = () => {
//   const { user } = AUTH.use();
//   const navi = useRouter();

//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPage, setTotalPage] = useState(0);
//   const uid = user?.uid;

//   const ref = dbService
//     .collection(FBCollection.USERS)
//     .doc(uid)
//     .collection("notification")
//     .orderBy("createdAt", "desc");

//   useEffect(() => {
//     // 로그인안한 유저 거르기
//     if (!user) {
//       alert("로그인하고 이용해주세요.");
//       return navi.push("/signin");
//     }
//   }, [user?.uid, navi]);

//   // 📥 알림 데이터 불러오기
//   // 알림 가져오는 함수
//   // 알림 가져오기//최신순부터 가져오기
//   //useInfiniteQuery에 전달할 알림을 가져오는 함수. Firestore에서 데이터를 불러옵니다.
//   //pageParam은 이전 페이지의 마지막 문서를 의미, 다음 알림을 어디서부터 가져올지 알려주는 기준점
//   const fetchNotifications = async ({
//     pageParam = 1,
//     uid,
//   }: {
//     pageParam?: number;
//     uid: string;
//   }): Promise<Notification[]> => {
//     const snap = await ref.get();

//     //? const query = pageParam ? ref.startAfter(pageParam) : ref;

//     //Firestore에서 위 쿼리를 실행해서 결과(snapshot)를 받아옵니다.(snap.docs에 문서들이 들어 있음)
//     const snap2 = await ref.limit(10).get();
//     //데이터를 Notification 타입으로 변환하여 리스트에 담기
//     //snap.docs는 Firestore에서 가져온 알림 문서들의 배열
//     //문서들을 하나씩 돌면서 알림(Notification) 형식으로 변환
//     const notifications = snap.docs.map(
//       (doc) => ({ ...doc.data(), id: doc.id } as Notification)
//     );

//     const totalCount = notifications.length;

//     //? pageParam이 있으면 → 해당 문서 다음부터(startAfter) 가져오기,없으면 → 처음부터 가져오기
//     //? 이번에 가져온 문서들 중 마지막 문서를 저장=>다음 페이지를 가져올 때 기준점으로 사용(startAfter에서 사용됨).
//     //이전 마지막 문서(pageParam) 이후부터 시작하여 데이터를 불러옵니다.
//     //파이어베이스(Firebase)의 startAfter 속성은 쿼리에서 특정 문서 이후부터 데이터를 가져올 때 사용하는 기능
//     //orderBy와 함께 사용되어야 함

//     return notifications;
//   };

//   const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } =
//     useInfiniteQuery({
//       queryKey: ["notifications", uid],
//       queryFn: ({ pageParam }) => {
//         if (!uid) return Promise.resolve([]);
//         return fetchNotifications({ pageParam, uid });
//       },
//       getNextPageParam: () => {
//         if (currentPage < totalPage) {
//           return currentPage + 1;
//         }
//         return undefined;
//       },
//       initialPageParam: 1,
//       enabled: !!user?.uid,
//     });
//   console.log(data, 75);

//  // 각 페이지에서 notifications 키로 알림 배열을 꺼냄 =>flatMap을 사용하면 여러 페이지의 알림을 하나의 배열로 합쳐줌
//   // const allNotifications = useMemo(
//   //   () => data?.pages.flatMap((page) => page) ?? [],
//   //   [data]
//   // );

//   const handleNotificationClick = async (noti: Notification) => {
//     if (!noti.isRead) {
//       await dbService
//         .collection(FBCollection.USERS)
//         .doc(uid)
//         .collection("notification")
//         .doc(noti.id)
//         .update({ isRead: true });
//     }

//     // 예: 상세페이지 이동 등
//     console.log("알림 클릭됨:", noti.id);
//   };

//   return (
//     <div>
//       {isPending && <Loaiding />}
//       {data?.pages.length === 0 ? (
//         <div>
//           <h1>알림이 없습니다.</h1>
//           <button onClick={() => navi.back()}>돌아가기</button>
//         </div>
//       ) : (
//         <ul>
//           {data?.pages.map((page) =>
//             page.map((noti) => (
//               <li
//                 key={noti.id}
//                 onClick={() => {
//                   handleNotificationClick(noti);
//                   return navi.push(`/profile/${noti.followerId}`);
//                 }}
//                 className={twMerge(
//                   "",
//                   noti.isRead ? "text-gray-400" : "text-black font-semibold"
//                 )}
//               >
//                 <p>{noti.follwingNickname}</p> 님이 팔로우했습니다.
//                 <p>{new Date(noti.createdAt).toLocaleString()}</p>
//               </li>
//             ))
//           )}
//         </ul>
//       )}
//       {hasNextPage && (
//         <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
//           {isFetchingNextPage ? "불러오는 중..." : "더보기"}
//         </button>
//       )}
//     </div>
//   );
// };

// export default page;

import NotificationListPage from "@/components/features/notification/NotificationList";
import React from "react";

const page = () => {
  return (
    <div>
      page
      <NotificationListPage />
    </div>
  );
};

export default page;

page;
