"use client";

import Loaiding from "@/components/Loading/page";
import { AUTH } from "@/contextapi/context";
import { dbService, FBCollection } from "@/lib";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { twMerge } from "tailwind-merge";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { Notifications } from "@/types/notification";
import { firebase } from "@/lib/firebase";

const NotificationListPage = () => {
  const { user } = AUTH.use();
  const [isUnRead, setIsUnRead] = useState(false);
  const navi = useRouter();

  // const [countPage, setCountPage] = useState(1);
  // const [totalPage, setTotalPage] = useState(0);
  const uid = user?.uid;

  const ref = dbService
    .collection(FBCollection.USERS)
    .doc(uid)
    .collection("notification")
    .orderBy("createdAt", "desc");

  useEffect(() => {
    // 로그인안한 유저 거르기
    if (!user) {
      alert("로그인하고 이용해주세요.");
      return navi.push("/signin");
    }
  }, [user?.uid, navi]);

  //📥 알림 데이터 불러오기
  // 알림 가져오는 함수
  //알림 가져오기//최신순부터 가져오기
  //useInfiniteQuery에 전달할 알림을 가져오는 함수. Firestore에서 데이터를 불러옵니다.
  //pageParam은 이전 페이지의 마지막 문서를 의미, 다음 알림을 어디서부터 가져올지 알려주는 기준점
  // const fetchNotifications = useCallback(
  //   async ({
  //     pageParam = 1,
  //     uid,
  //   }: {
  //     pageParam?: number;
  //     uid?: string;
  //   }): Promise<Notifications[]> => {
  //     const snap = await ref.get();
  //     console.log(snap, "snap");
  //     const totalCount = snap.docs.length;
  //     const totalPages = Math.ceil(totalCount / 10);
  //     setTotalPage(totalPages); // 총 페이지 수 저장
  //     setCountPage(pageParam); // 현재 페이지 수 저장
  //     //? const query = pageParam ? ref.startAfter(pageParam) : ref;

  //     //Firestore에서 위 쿼리를 실행해서 결과(snapshot)를 받아옵니다.(snap.docs에 문서들이 들어 있음)
  //     const snap2 = await ref.get().then((allSnap) => {
  //       const start = (pageParam - 1) * 10;
  //       const end = pageParam * 10;
  //       const slicedDocs = allSnap.docs.slice(start, end);
  //       return {
  //         docs: slicedDocs,
  //       };
  //     });
  //     console.log(snap2, "snap2");
  //     //? pageParam이 있으면 → 해당 문서 다음부터(startAfter) 가져오기,없으면 → 처음부터 가져오기
  //     //? 이번에 가져온 문서들 중 마지막 문서를 저장=>다음 페이지를 가져올 때 기준점으로 사용(startAfter에서 사용됨).
  //     //이전 마지막 문서(pageParam) 이후부터 시작하여 데이터를 불러옵니다.
  //     //파이어베이스(Firebase)의 startAfter 속성은 쿼리에서 특정 문서 이후부터 데이터를 가져올 때 사용하는 기능
  //     //orderBy와 함께 사용되어야 함

  //     //데이터를 Notification 타입으로 변환하여 리스트에 담기
  //     //snap.docs는 Firestore에서 가져온 알림 문서들의 배열
  //     //문서들을 하나씩 돌면서 알림(Notification) 형식으로 변환
  //     const notifications = snap2.docs.map(
  //       (doc) => ({ ...doc.data(), id: doc.id } as Notifications)
  //     );
  //     console.log(notifications, "noti");
  //     return notifications;
  //   },
  //   [countPage, totalPage]
  // );

  const fetchNotifications = useCallback(
    async ({
      pageParam, //pageParam: 마지막 문서를 기억해서 다음 데이터를 가져오기 위함
      uid,
    }: {
      pageParam?: any;
      uid?: string;
    }): Promise<{ notifications: Notifications[]; lastDoc: any }> => {
      //처음이면 그냥 10개 가져오고 이어지는 페이지라면 pageParam 이후부터 10개 가져옴
      let query = ref.limit(10);
      if (pageParam) {
        query = ref.startAfter(pageParam).limit(10);
      }
      //쿼리를 실행해서 문서 스냅샷을 가져옵니다.
      const snap = await query.get();

      const notifications = snap.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as Notifications[];
      //마지막 문서를 저장해서 다음 페이지 기준점으로 사용할 준비를 함
      const lastDoc = snap.docs[snap.docs.length - 1] ?? null;

      return { notifications, lastDoc };
    },
    [uid]
  );

  useEffect(() => console.log(fetchNotifications), []);

  const {
    data,
    fetchNextPage, //다음 페이지를 호출하는 함수
    hasNextPage, //getNextPage의 리턴값을 통해 다음 페이지가 있는지 판단 있을 경우 true//다음 페이지가 있는지 판별하는 boolean 값
    isFetchingNextPage, //다음 페이지를 불러오는 중인지 판별하는 boolean 값
    isPending,
    error,
    refetch, //현재 쿼리(데이터 요청)를 다시 실행해서 서버나 DB에서 최신 데이터를 다시 불러오는 함수
  } = useInfiniteQuery({
    queryKey: ["notifications"],
    queryFn: ({ pageParam }) => {
      if (!uid) return Promise.resolve({ notifications: [], lastDoc: null });
      return fetchNotifications({ pageParam, uid });
    },
    //다음 페이지를 가져올 때 기준(lastDoc)
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.notifications.length === 0) {
        return undefined; //다음페이지가 없으면 undefined임
      }
      return lastPage.lastDoc;
    },
    initialPageParam: null, //처음렌더링 됬을경우

    enabled: !!user?.uid, //로그인한 경우에만 실행
  });

  // console.log(data, 75);
  console.log("리렌더링");

  //각 페이지에서 notifications 키로 알림 배열을 꺼냄 =>flatMap을 사용하면 여러 페이지의 알림을 하나의 배열로 합쳐줌
  // const allNotifications = useMemo(
  //   () => data?.pages.flatMap((page) => page) ?? [],
  //   [data]
  // );

  const handleNotificationClick = async (noti: Notifications) => {
    if (!noti.isRead) {
      await dbService
        .collection(FBCollection.USERS)
        .doc(uid)
        .collection("notification")
        .doc(noti.id) // 이 알림 하나!
        .update({ isRead: true });
    }
    //매개변수로 받은 특정 알림 한 건만 .update()하기 때문 //하나의 알림 에만 update를 검("하나만" 업데이트하는 용도)
    // 예: 상세페이지 이동 등
    console.log("알림 클릭됨:", noti.id);
  };
  //! 현재 불러온 알림 목록을 forEach 돌면서 모두 isRead: true로 업데이트 해야됨
  const handleMarkAllAsRead = async () => {
    if (!data || !uid) return;

    const batch = dbService.batch(); // Firestore batch 사용 (한 번에 여러 문서 처리 최대 500개까지)

    data.pages.forEach((page) => {
      page.notifications.forEach((noti) => {
        if (!noti.isRead) {
          const notiRef = dbService
            .collection(FBCollection.USERS)
            .doc(uid)
            .collection("notification")
            .doc(noti.id); //어떤문서를 수정할지 알아야하기 때문에 ref를 같이 넣음
          //Firestore 입장에서는 "어떤 문서 업데이트할지" 반드시 알아야 해서, ref를 꼭 넣어야 함
          batch.update(notiRef, { isRead: true });
        }
      });
    });

    await batch.commit(); // 배치 실행(배치를 실행시킬려면 commit함수를 꼭 붙여야함)
    console.log("모든 알림을 읽음 처리했습니다.");
    await refetch(); //  데이터 새로고침 //서버에 요청 → 최신 데이터로 갱신
  };

  if (isPending) {
    return <Loaiding />;
  }
  if (error || !data) {
    return <h1>Error: {error.message}</h1>;
  }
  return (
    <div>
      {data?.pages.length === 0 ? (
        <div>
          <h1>알림이 없습니다.</h1>
          <button onClick={() => navi.back()}>돌아가기</button>
        </div>
      ) : (
        <div>
          <button onClick={handleMarkAllAsRead}>모두 읽음</button>

          <ul className="flex gap-y-2.5">
            {data?.pages.map((page) =>
              page.notifications.map((noti) => (
                <li
                  key={noti.id}
                  onClick={() => {
                    handleNotificationClick(noti);
                    return navi.push(`/profile/${noti.followerId}`);
                  }}
                  className={twMerge(
                    "flex flex-col gap-x-2.5",
                    noti.isRead ? "text-gray-400" : "text-black font-semibold"
                  )}
                >
                  <p>{noti.follwingNickname}</p> 님이 팔로우했습니다.
                  <p>{noti.createdAt.toString()}</p>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? "불러오는 중..." : "더보기"}
        </button>
      )}
    </div>
  );
};

export default NotificationListPage;
