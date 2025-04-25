"use client";

import Loaiding from "@/components/Loading/page";
import { AUTH } from "@/contextapi/context";
import { dbService, FBCollection } from "@/lib";
import { Notification } from "@/types/notification";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { twMerge } from "tailwind-merge";
import { useInfiniteQuery } from "@tanstack/react-query";

const page = () => {
  const { user } = AUTH.use();
  const navi = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // 로그인안한 유저 거르기
    if (!user) {
      alert("로그인하고 이용해주세요.");
      return navi.push("/signin");
    }
  }, [user?.uid, navi]);

  // 알림 가져오는 함수
  // 알림 가져오기//최신순부터 가져오기
  //useInfiniteQuery에 전달할 알림을 가져오는 함수. Firestore에서 데이터를 불러옵니다.
  //사용자의 알림 컬렉션에서 최신순으로 10개를 불러오는 쿼리를 만듭니다.
  const fetchNotifications = async ({ pageParam = null }) => {
    try {
      if (user) {
        const ref = dbService
          .collection(FBCollection.USERS)
          .doc(user.uid)
          .collection("notification")
          .orderBy("createdAt", "desc")
          .limit(10);
        //이전 마지막 문서(pageParam) 이후부터 시작하여 데이터를 불러옵니다.
        const query = pageParam ? ref.startAfter(pageParam) : ref;
        const snap = await query.get();
        //데이터를 Notification 타입으로 변환하여 리스트에 담기
        const notiList: Notification[] = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Notification[];
        setNotifications(notiList);

        //읽음처리//안 읽은 알림이면 isRead: true로 업데이트하여 읽음 표시
        snap.docs.forEach((doc) => {
          if (!doc.data().isRead) {
            doc.ref.update({ isRead: true });
          }
        });
        //마지막 문서를 반환하여 다음 페이지 페이징에 사용
        const lastDoc = snap.docs[snap.docs.length - 1];
        return { notifications: notiList, lastDoc };
      }
    } catch (error: any) {
      return console.error(error.message);
    }
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } =
    useInfiniteQuery({
      queryKey: ["notifications", user?.uid],
      queryFn: async ({ pageParam = null }) => {
        // 여기에서 fetchNotifications 호출
        return await fetchNotifications({ pageParam });
      },
      getNextPageParam: (lastPage) => lastPage?.lastDoc ?? undefined,
      initialPageParam: null, // 필수!
      enabled: !!user?.uid,
    });

  return (
    <div>
      {isPending && <Loaiding />}
      {notifications.length === 0 ? (
        <h1>no 알림</h1>
      ) : (
        <ul className="">
          {notifications.map((noti) => (
            <li
              key={noti.id}
              className={twMerge(
                "",
                noti.isRead ? "text-gray-400" : "text-black font-semibold"
              )}
            >
              <p>
                <p>{noti.followerId}</p> 님이 팔로우했습니다.
              </p>
              <p className="">{new Date(noti.createdAt).toISOString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default page;
