'use client";';

import { AUTH } from "@/contextapi/context";
import { dbService, FBCollection } from "@/lib";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState, useTransition } from "react";
import Loaiding from "../Loading";

interface FollowButtonProps {
  followingId: string; // 팔로잉할 유저의 uid
  followNickname: string; // 팔로잉할 유저의 닉네임
}

const FollowButton = ({ followingId, followNickname }: FollowButtonProps) => {
  const { user } = AUTH.use();
  const navi = useRouter();
  // user가 팔로우를 한 사람인가를 확인하는 용도
  const [isFollowing, setIsFollowing] = useState(false);

  const [isPending, startTransition] = useTransition();

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
      try {
        // 1. 내 팔로잉에 추가
        await dbService
          .collection(FBCollection.USERS)
          .doc(user.uid)
          .collection(FBCollection.FOLLOWINGS)
          .doc(followingId)
          .set({
            followingId: followingId,
            follwingNickname: followNickname,
            createdAt: new Date().toLocaleString(),
          });
        // 2. 상대방 팔로워에 나 추가
        await dbService
          .collection(FBCollection.USERS)
          .doc(followingId)
          .collection(FBCollection.FOLLOWERS)
          .doc(user.uid)
          .set({
            followerNickname: user?.nickname,
            createdAt: new Date().toLocaleString(),
          });
        // 3. 상대방에게 알림 전송
        await dbService
          .collection(FBCollection.USERS)
          .doc(followingId)
          .collection(FBCollection.NOTIFICATION)
          .add({
            follwingId: followingId,
            follwerId: user.uid,
            followerNickname: user?.nickname,
            createdAt: new Date().toLocaleString(),
            isRead: false,
          });
        console.log(followingId, followNickname, user.uid, 51);
        setIsFollowing(true);
        alert(`${followNickname}님을 팔로우 했습니다`);
      } catch (error: any) {
        return console.log(error.message);
      }
    });
  }, [user, followingId, navi]);
  //언팔로우 처리
  const onUnFollow = useCallback(() => {
    if (!user) {
      alert("로그인 후 이용해주세요");
      return navi.push("/signin");
    }
    startTransition(async () => {
      try {
        //! 내 followings에서 제거
        const ref = dbService
          .collection(FBCollection.USERS)
          .doc(user.uid)
          .collection(FBCollection.FOLLOWINGS)
          .doc(followingId);

        //delete() 메서드는 문서를 삭제하는 메서드

        await ref.delete();

        //! 상대방 followers에서 나 제거
        const followerRef = dbService
          .collection(FBCollection.USERS)
          .doc(followingId)
          .collection(FBCollection.FOLLOWERS)
          .doc(user.uid);

        //delete() 메서드는 문서를 삭제하는 메서드

        await followerRef.delete();

        setIsFollowing(false);
      } catch (error: any) {
        return console.log(error.message);
      }
    });
  }, [user, navi, followingId]);

  //! 현재 유저를 팔로우하고 있는지 확인용도
  useEffect(() => {
    const checkFollowing = async () => {
      if (!user?.uid || !followingId) {
        return console.log("no user");
      }

      try {
        const ref = dbService
          .collection(FBCollection.USERS)
          .doc(user.uid)
          .collection(FBCollection.FOLLOWINGS)
          .doc(followingId);
        const snap = await ref.get();
        //extsts는 문서가 존재하는지 확인하는 메서드(불리언타입임)
        //snap.exists를 통해 그 문서가 존재하는지 확인// 문서가 존재하면 setIsFollowing(true),문서가 존재하지 않으면 setIsFollowing(false)
        setIsFollowing(snap.exists);
      } catch (error: any) {
        return console.log(error.message);
      }
    };
    checkFollowing();
    //리턴으로 청소 작업필요
    return () => {
      checkFollowing();
    };
  }, [user, followingId]);

  return (
    <div>
      {isPending && <Loaiding />}
      {isFollowing ? (
        <button onClick={() => onUnFollow()} className="followButton">
          UnFollow
        </button>
      ) : (
        <button onClick={() => onFollow()} className="followButton">
          Follow
        </button>
      )}
    </div>
  );
};

export default FollowButton;
