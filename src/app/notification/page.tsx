"use client";

import Loaiding from "@/components/Loading/page";
import { AUTH } from "@/contextapi/context";
import { dbService, FBCollection } from "@/lib";
import { Notification } from "@/types/notification";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { twMerge } from "tailwind-merge";

const page = () => {
  const { user } = AUTH.use();
  const navi = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isPending, startTransition] = useTransition();
  useEffect(() => {
    // 로그인안한 유저 거르기
    if (!user) {
      alert("로그인하고 이용해주세요.");
      return navi.push("/signin");
    }

    try {
      // 알림 가져오기
      const getNotifications = async () => {
        const ref = await dbService
          .collection(FBCollection.USERS)
          .doc(user.uid)
          .collection("notification");
        //최신순부터 가져오기
        const snap = await ref.orderBy("createdAt", "desc").get();

        const notiList: Notification[] = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Notification[];
        setNotifications(notiList);

        //읽음처리
        snap.docs.forEach((doc) => {
          if (!doc.data().isRead) {
            doc.ref.update({ isRead: true });
          }
        });
      };
      getNotifications();
      console.log(getNotifications());
    } catch (error: any) {
      return alert(error.message);
    }
  }, [user?.uid, navi]);
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
