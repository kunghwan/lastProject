"use client";
import { AUTH } from "@/contextapi/context";
import { dbService, FBCollection } from "@/lib";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Notifications } from "@/types/notification";
import Loaiding from "@/components/Loading";
import TopButton from "@/components/upplace/TopButton";
import AlertModal from "@/components/AlertModal";
import Image from "next/image";
import { BsExclamationCircle } from "react-icons/bs";
import { useAlertModal } from "@/components/AlertStore";

//! limit변수처리하기
const limit = 20;
const NotificationListPage = () => {
  const { user } = AUTH.use();
  const { openAlert } = useAlertModal();
  const [isLoadingAllRead, setIsLoadingAllRead] = useState(false);
  //Todo: 모두읽음 알림버튼을 확인용 useState
  const [isUnRead, setIsUnRead] = useState(false);
  const navi = useRouter();
  const uid = user?.uid;

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
  //? pageParam이 있으면 → 해당 문서 다음부터(startAfter) 가져오기,없으면 → 처음부터 가져오기
  //? 이번에 가져온 문서들 중 마지막 문서를 저장=>다음 페이지를 가져올 때 기준점으로 사용(startAfter에서 사용됨).
  //이전 마지막 문서(pageParam) 이후부터 시작하여 데이터를 불러옵니다.
  //파이어베이스(Firebase)의 startAfter 속성은 쿼리에서 특정 문서 이후부터 데이터를 가져올 때 사용하는 기능
  //orderBy와 함께 사용되어야 함
  const fetchNotifications = useCallback(
    async ({
      pageParam, //pageParam: 마지막 문서를 기억해서 다음 데이터를 가져오기 위함
    }: {
      pageParam?: any;
    }): Promise<{ notifications: Notifications[]; lastDoc: any }> => {
      //Todo: 처음이면 그냥 20개 가져오고 이어지는 페이지라면 pageParam 이후부터 20개 가져옴
      let query = ref.limit(limit);
      if (pageParam) {
        query = ref.startAfter(pageParam).limit(limit);
      }
      //? 쿼리를 실행해서 문서 스냅샷(docs)을 가져옵니다.
      const snap = await query.get();
      //! 데이터를 Notification 타입으로 변환하여 리스트에 담기
      //snap.docs는 Firestore에서 가져온 알림 문서들의 배열
      //문서들을 하나씩 돌면서 알림(Notification) 형식으로 변환
      //id까지 합친하나의 객체로 만들어서 하나의 배열에 doc객체들을 담음
      const notifications = snap.docs.map((doc) => ({
        ...(doc.data() as Notifications),
        id: doc.id,
      })) as Notifications[];
      // console.log(notifications, "알림확인용");
      //! 마지막 문서를 저장해서 다음 페이지 기준점으로 사용할 준비를 함
      //Todo: snap.docs의 마지막 인덱스 이거나 null 임 (만약 마지막 문서가 없으면 → 대신 null을 반환)
      const lastDoc = snap.docs[snap.docs.length - 1] ?? null;
      return { notifications, lastDoc };
    },
    [uid]
  );
  // useEffect(() => console.log(fetchNotifications), []);
  const {
    data,
    fetchNextPage, //! 다음 페이지를 호출하는 함수
    hasNextPage, //! getNextPage의 리턴값을 통해 다음 페이지가 있는지 판단 있을 경우 true//다음 페이지가 있는지 판별하는 boolean 값
    isFetchingNextPage, //! 다음 페이지를 불러오는 중인지 판별하는 boolean 값
    isPending,
    error,
    refetch, //! 현재 쿼리(데이터 요청)를 다시 실행해서 서버나 DB에서 최신 데이터를 다시 불러오는 함수
  } = useInfiniteQuery({
    queryKey: ["notifications", uid],
    queryFn: ({ pageParam }) => {
      if (!uid) {
        return Promise.resolve({ notifications: [], lastDoc: null });
      }
      return fetchNotifications({ pageParam });
    },
    //! 다음 페이지를 가져올 때 기준(lastDoc)
    //lastPage는 fetchNotifications함수임 내가 마음대로 인자이름 지은거임
    getNextPageParam: (lastPage) => {
      // 마지막으로 가져올 데이터가 없거나 0개거나 20개 미만이면 undefined임
      if (
        !lastPage ||
        lastPage.notifications.length === 0 ||
        lastPage.notifications.length < limit
      ) {
        return undefined; //다음페이지가 없으면 undefined임
      }
      //있다면 lastDoc를 반환해서 lastDoc로 나머지 가져옴
      return lastPage.lastDoc;
    },
    initialPageParam: null, //처음렌더링 됬을경우
    enabled: !!user?.uid, //! 로그인한 경우에만 실행
  });
  console.log(data, 75);
  console.log("리렌더링");
  //! 받아온 data중에 isRead가 false가 있냐 없냐를 검사하는 함수
  //! 모두읽음 알림을 비활성화상태로 만들기 위해서 작성한 함수임
  const checkUnreadNotifications = useCallback(async () => {
    //Todo: data가 없으면 리턴
    if (!data) {
      return;
    }
    // some은 각 요소들 중 하나라도 true를 리턴하면 값은 true
    const unread = data.pages.some((page) =>
      page.notifications.some((noti) => !noti.isRead)
    );
    //unread값에 따라서 isUnRead의 값이 바뀜
    return setIsUnRead(unread);
  }, [data]);
  //! 알림을 클릭하면 그알림을 isRead를 true로 바꾸는 함수
  const handleNotificationClick = useCallback(
    async (noti: Notifications) => {
      if (!noti.isRead) {
        await dbService
          .collection(FBCollection.USERS)
          .doc(uid)
          .collection(FBCollection.NOTIFICATION)
          .doc(noti.id) // 이 알림 하나!
          .update({ isRead: true });
      }
      // 알림을 읽었으므로 Header의 unread 상태를 업데이트합니다.
      if (window.checkUnreadNotifications) {
        window.checkUnreadNotifications();
      }
      //Todo: 매개변수로 받은 특정 알림 한 건만 .update()하기 때문 //하나의 알림 에만 update를 검("하나만" 업데이트하는 용도)
      // 예: 상세페이지 이동 등
      return console.log("알림 클릭됨:", noti.id);
    },
    [uid]
  );
  //! 현재 불러온 알림 목록을 forEach 돌면서 모두 isRead: true로 업데이트 해야됨
  const handleAllRead = useCallback(async () => {
    if (!data || !uid) {
      return;
    }
    setIsLoadingAllRead(true);
    const batch = dbService.batch(); //! Firestore batch 사용 (한 번에 여러 문서 처리 최대 500개까지)
    data.pages.forEach((page) => {
      page.notifications.forEach((noti) => {
        if (!noti.isRead) {
          const notiRef = dbService
            .collection(FBCollection.USERS)
            .doc(uid)
            .collection("notification")
            .doc(noti.id); //!어떤문서를 수정할지 알아야하기 때문에 ref를 같이 넣음
          //Todo: Firestore 입장에서는 "어떤 문서 업데이트할지" 반드시 알아야 해서, ref를 꼭 넣어야 함
          batch.update(notiRef, { isRead: true });
        }
      });
    });
    await batch.commit(); //! 배치 실행(배치를 실행시킬려면 commit함수를 꼭 붙여야함)
    console.log("모든 알림을 읽음 처리했습니다.");
    //Todo: 알림을 읽었으므로 Header의 unread 상태를 업데이트합니다.
    if (window.checkUnreadNotifications) {
      window.checkUnreadNotifications();
    }
    await refetch(); //!  데이터 새로고침 //서버에 요청 → 최신 데이터로 갱신
    setIsLoadingAllRead(false);
    openAlert(
      "알림을 모두 읽었습니다.",
      [
        {
          text: "확인",
          isGreen: true,
          autoFocus: true,
        },
      ],

      "알림"
    );
    return;
  }, [data, uid, refetch, openAlert]);
  // const isNotifications = data?.pages.map((page) => page.notifications);
  // console.log(isNotifications, "알림확인용");
  //! 안읽은 알림이 없느가를 처음 페이지가 렌더링될때 확인용
  useEffect(() => {
    checkUnreadNotifications();
    return () => {
      checkUnreadNotifications();
    };
  }, [checkUnreadNotifications]);

  if (isPending || isLoadingAllRead) {
    return <Loaiding message="조금만 기달려 주세요 ..." />;
  }
  if (error || !data) {
    return <h1>Error: {error.message}</h1>;
  }
  return (
    <div className="hsecol  gap-y-2.5 mt-2 p-3">
      {data?.pages.every((page) => page.notifications.length === 0) && (
        <div className="hsecol justify-center items-center  h-100 gap-y-5">
          <div>
            <BsExclamationCircle className="text-4xl text-gray-500" />
          </div>
          <p className="dark:text-white font-bold text-xl text-gray-500">
            아직 도착한 알림이 없어요.
          </p>
          <button
            onClick={() => navi.back()}
            className="hover:scale-105 hover:animate-pulse font-bold p-2.5 rounded w-40 bg-[rgba(62,188,154)] dark:bg-[rgba(116,212,186,0.5)] text-white hover:shadow-md"
          >
            돌아가기
          </button>
        </div>
      )}
      {/* <div className="flex flex-col gap-y-2.5 h-[calc(100vh-80px)] overflow-y-auto"> */}
      <div>
        {/* isUnRead는 읽지 않은 알림이 하나라도 있으면 true 없다면 false임 */}
        {/* data 안에 있는 pages 배열을 돌면서,알림(notifications)이 하나라도 있는 페이지가 있는지 확인 */}
        {data?.pages.every((page) => page.notifications.length > 0) && (
          <div>
            <div className="flex justify-end">
              {/* isRead가 다 true라면 버튼을 비활성화함 */}
              <button
                onClick={handleAllRead}
                disabled={!isUnRead}
                className="hover:scale-105 hover:shadow-md border  font-stretch-105% border-lime-800 hover:text-lime-800 cursor-pointer mr-2.5 bg-[#d7eadf] disabled:text-gray-400  disabled:bg-gray-200 dark:bg-[rgba(232,255,241,0.5)] p-2 rounded"
              >
                모두 읽기
              </button>
            </div>
            <hr className="my-2.5 shadow-sm text-gray-300 px-5" />
          </div>
        )}

        <ul className=" grid md:grid-cols-2 gap-5  items-center  w-full p-2.5 ">
          {data?.pages.map((page) =>
            page.notifications.map((noti) => (
              <li
                key={noti.id}
                onClick={() => {
                  handleNotificationClick(noti);
                  if (noti.type === "follow") {
                    return navi.push(`/profile/${noti.followerNickname}`);
                  }

                  if (noti.type === "like") {
                    return navi.push(`/profile/${noti.likerName}`);
                  }
                }}
                className={twMerge(
                  "hover:scale-105 hover:shadow-sm hsecol  gap-x-2.5 justify-center p-2.5 rounded-2xl w-full cursor-pointer ",
                  noti.isRead
                    ? "text-gray-500 border dark:border-gray-700 border-gray-200 bg-gray-100 dark:bg-gray-500 dark:text-gray-300 "
                    : "text-black font-semibold border border-gray-200 hover:text-lime-700 dark:hover:text-lime-200  bg-[rgba(232,255,241)] dark:bg-[rgba(232,255,241,0.4)] dark:text-white"
                )}
              >
                <div className="flex items-center gap-x-2.5">
                  <div className="w-10 h-10  overflow-hidden rounded-full">
                    <Image
                      src={noti.profileImageUrl || defaultImgUrl}
                      alt="profile"
                      width={40}
                      height={40}
                      className=" object-cover"
                    />
                  </div>
                  <p className="font-bold text-md">
                    {noti.type === "follow" &&
                      `${noti.followerNickname}님이 팔로우했습니다.`}
                    {noti.type === "like" &&
                      `${noti.likerName}님이 게시글을 좋아했습니다.`}
                  </p>
                </div>
                <p className="text-sm font-light  flex justify-end">
                  {noti.createdAt.toDate().toLocaleString()}
                </p>
              </li>
            ))
          )}
        </ul>
      </div>
      <div className="flex justify-center mr-2.5 pb-20  md:pb-20 ">
        {hasNextPage && (
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="border border-gray-400 p-2.5 rounded-xl min-w-30  hover:text-green-800"
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

const defaultImgUrl =
  "https://i.pinimg.com/1200x/3e/c0/d4/3ec0d48e3332288604e8d48096296f3e.jpg";
