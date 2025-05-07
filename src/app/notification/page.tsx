"use client";

import { AUTH } from "@/contextapi/context";
import { dbService, FBCollection } from "@/lib";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { twMerge } from "tailwind-merge";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Notifications } from "@/types/notification";
import Loaiding from "@/components/Loading";
import TopButton from "@/components/upplace/TopButton";
import AlertModal from "@/components/AlertModal";

//! limit변수처리하기
const limit = 20;

const NotificationListPage = () => {
  const { user } = AUTH.use();
  //Todo: 모두읽음 알림버튼을 확인용 useState
  const [isUnRead, setIsUnRead] = useState(false);
  const navi = useRouter();

  const uid = user?.uid;

  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const ref = dbService
    .collection(FBCollection.USERS)
    .doc(uid)
    .collection(FBCollection.NOTIFICATION)
    .orderBy("createdAt", "desc");

  useEffect(() => {
    //! 로그인안한 유저 거르기
    if (!user) {
      alert("로그인하고 이용해주세요.");
      return navi.push("/signin");
    }
  }, [user?.uid, navi]);

  const fetchNotifications = useCallback(
    async ({
      pageParam, //pageParam: 마지막 문서를 기억해서 다음 데이터를 가져오기 위함
    }: {
      pageParam?: any;
    }): Promise<{ notifications: Notifications[]; lastDoc: any }> => {
      let query = ref.limit(limit);
      if (pageParam) {
        query = ref.startAfter(pageParam).limit(limit);
      }
      const snap = await query.get();
      const notifications = snap.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as Notifications[];
      console.log(notifications, "알림확인용");
      const lastDoc = snap.docs[snap.docs.length - 1] ?? null;

      return { notifications, lastDoc };
    },
    [uid]
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["notifications", uid],
    queryFn: ({ pageParam }) => {
      if (!uid) {
        return Promise.resolve({ notifications: [], lastDoc: null });
      }
      return fetchNotifications({ pageParam });
    },
    getNextPageParam: (lastPage) => {
      if (
        !lastPage ||
        lastPage.notifications.length === 0 ||
        lastPage.notifications.length < limit
      ) {
        return undefined;
      }
      return lastPage.lastDoc;
    },
    initialPageParam: null,
    enabled: !!user?.uid,
  });

  console.log(data, 75);
  console.log("리렌더링");

  const checkUnreadNotifications = useCallback(async () => {
    if (!data) {
      return;
    }
    const unread = data.pages.some((page) =>
      page.notifications.some((noti) => !noti.isRead)
    );
    return setIsUnRead(unread);
  }, [data]);

  const handleNotificationClick = useCallback(
    async (noti: Notifications) => {
      if (!noti.isRead) {
        await dbService
          .collection(FBCollection.USERS)
          .doc(uid)
          .collection(FBCollection.NOTIFICATION)
          .doc(noti.id)
          .update({ isRead: true });
        // 알림을 읽었으므로 Header의 unread 상태를 업데이트합니다.
        if (window.checkUnreadNotifications) {
          window.checkUnreadNotifications();
        }
      }
      return console.log("알림 클릭됨:", noti.id);
    },
    [uid]
  );

  const handleAllRead = useCallback(async () => {
    if (!data || !uid) return;

    const batch = dbService.batch();

    data.pages.forEach((page) => {
      page.notifications.forEach((noti) => {
        if (!noti.isRead) {
          const notiRef = dbService
            .collection(FBCollection.USERS)
            .doc(uid)
            .collection("notification")
            .doc(noti.id);
          batch.update(notiRef, { isRead: true });
        }
      });
    });

    await batch.commit();
    console.log("모든 알림을 읽음 처리했습니다.");
    await refetch();
    setAlertMessage("알림을 모두 읽었습니다.");
    // 모든 알림을 읽었으므로 Header의 unread 상태를 업데이트합니다.
    if (window.checkUnreadNotifications) {
      window.checkUnreadNotifications();
    }
  }, [data, uid, refetch]);

  useEffect(() => {
    checkUnreadNotifications();
    return () => {
      checkUnreadNotifications();
    };
  }, [checkUnreadNotifications]);

  if (isPending) {
    return <Loaiding />;
  }

  if (error || !data) {
    return <h1>Error: {error.message}</h1>;
  }

  return (
    <div className="hsecol gap-y-2.5 mt-2 p-3">
      {alertMessage && (
        <AlertModal
          message={alertMessage}
          onClose={() => setAlertMessage(null)}
        />
      )}
      {data?.pages.every((page) => page.notifications.length === 0) && (
        <div className="hsecol justify-center items-center h-100 gap-y-2.5">
          <p className="dark:text-white font-bold text-xl">알림이 없습니다.</p>
          <button
            onClick={() => navi.back()}
            className="hover:scale-105 hover:animate-pulse font-bold p-2.5 rounded w-40 bg-[rgba(62,188,154)] dark:bg-[rgba(116,212,186,0.5)] text-white hover:shadow-md"
          >
            돌아가기
          </button>
        </div>
      )}
      <div>
        {isUnRead &&
          data?.pages.some((page) => page.notifications.length > 0) && (
            <div className="flex justify-end">
              <button
                onClick={handleAllRead}
                disabled={!isUnRead}
                className="hover:scale-105 hover:shadow-md border font-stretch-105% border-lime-800 hover:text-lime-800 cursor-pointer mr-2.5 bg-[#d7eadf] disabled:text-gray-400 disabled:bg-gray-200 dark:bg-[rgba(232,255,241,0.5)] p-2 rounded"
              >
                모두 읽기
              </button>
            </div>
          )}

        <ul className=" grid md:grid-cols-2 gap-5 items-center w-full p-2.5 ">
          {data?.pages.map((page) =>
            page.notifications.map((noti) => (
              <li
                key={noti.id}
                onClick={() => {
                  handleNotificationClick(noti);
                  return navi.push(`/profile/${noti.follwerId}`);
                }}
                className={twMerge(
                  "hover:scale-105 hover:shadow-sm hsecol gap-x-2.5 justify-center p-2.5 rounded-xl w-full cursor-pointer ",
                  noti.isRead
                    ? "text-gray-500 border dark:border-gray-700 border-gray-200 bg-gray-100 dark:bg-gray-500 dark:text-gray-300"
                    : "text-black font-semibold border border-gray-200 hover:text-lime-700 dark:hover:text-lime-200 bg-[rgba(232,255,241)] dark:bg-[rgba(232,255,241,0.4)] dark:text-white"
                )}
              >
                <p className="font-bold text-md">
                  {noti.followerNickname}님이 팔로우했습니다.
                </p>
                <p className="text-sm font-light">
                  {noti.createdAt.toString()}
                </p>
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="flex justify-center mr-2.5 pb-20 md:pb-20 ">
        {hasNextPage && (
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="border border-gray-400 p-2.5 rounded-xl min-w-30 hover:text-green-800"
          >
            {isFetchingNextPage ? "불러오는 중..." : "더보기"}
          </button>
        )}
      </div>
      <TopButton className="bg-emerald-600 hover:bg-emerald-500" />
    </div>
  );
};

export default NotificationListPage;
