'use client";';

import { AUTH } from "@/contextapi/context";
import { dbService, FBCollection } from "@/lib";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState, useTransition } from "react";
import Loaiding from "../Loading/page";

interface FollowButtonProps {
  followingId: string; // 팔로잉할 유저의 uid
}

const FollowButton = ({ followingId }: FollowButtonProps) => {
  const { user } = AUTH.use();
  const navi = useRouter();
  const [isFollowing, setIsFollowing] = useState(false);
  const handleFollow = () => setIsFollowing((prev) => !prev);
  const [isPening, startTransition] = useTransition();

  const onFollow = useCallback(() => {
    if (!user) {
      alert("로그인 후 이용해주세요");
      return navi.push("/signin");
    }
    // if (!followingId || followingId === "default") {
    //   console.log("유효하지 않은 Uid입니다:", followingId);
    //   return null;
    // }
    startTransition(async () => {
      // 1. 내 팔로잉에 추가
      await dbService
        .collection(FBCollection.USERS)
        .doc(user.uid)
        .collection("followings")
        .doc(followingId)
        .set({ createdAt: new Date().toLocaleString() });
      // 2. 상대방 팔로워에 나 추가
      await dbService
        .collection(FBCollection.USERS)
        .doc(followingId)
        .collection("followers")
        .doc(user.uid)
        .set({ createdAt: new Date().toLocaleString() });
      // 3. 상대방에게 알림 전송
      await dbService
        .collection(FBCollection.USERS)
        .doc(followingId)
        .collection("notification")
        .add({
          follwingId: followingId,
          followerId: user.uid,
          createdAt: new Date().toLocaleString(),
          isRead: false,
        });
      console.log(followingId, user.uid, 51);
      setIsFollowing(true);
    });
  }, [user, followingId, navi]);
  //언팔로우 처리
  const onUnFollow = useCallback(() => {
    if (!user) {
      alert("로그인 후 이용해주세요");
      return navi.push("/signin");
    }
    startTransition(async () => {
      //내 followings에서 제거
      const ref = await dbService
        .collection(FBCollection.USERS)
        .doc(user.uid)
        .collection("followings")
        .doc(followingId);
      await ref.delete();

      // 상대방 followers에서 나 제거
      const followerRef = await dbService
        .collection(FBCollection.USERS)
        .doc(followingId)
        .collection("followers")
        .doc(user.uid);
      await followerRef.delete();

      setIsFollowing(false);
    });
  }, [user, navi, followingId]);
  //현재 유저를 팔로우하고 있는지 확인용도
  useEffect(() => {
    const checkFollowing = async () => {
      if (!user?.uid || !followingId) {
        return console.log("no");
      }

      try {
        const ref = dbService
          .collection(FBCollection.USERS)
          .doc(user.uid)
          .collection("followings")
          .doc(followingId);
        const snap = await ref.get();
        //extsts는 문서가 존재하는지 확인하는 메서드(불리언타입임)
        setIsFollowing(snap.exists);
      } catch (error: any) {
        console.error(error.message);
      }

      checkFollowing();
    };
  }, [user, followingId]);
  return (
    <div>
      {isPening && <Loaiding />}
      {isFollowing ? (
        <button
          className="border-2 border-gray-300 rounded-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          onClick={() => onUnFollow()}
        >
          UnFollow
        </button>
      ) : (
        <button onClick={() => onFollow()}>Follow</button>
      )}
    </div>
  );
};

export default FollowButton;
