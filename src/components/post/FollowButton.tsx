"use client";

import { AUTH } from "@/contextapi/context";
import { dbService, FBCollection } from "@/lib";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState, useTransition } from "react";
import Loaiding from "../Loading";
import AlertModal from "@/components/AlertModal";

interface FollowButtonProps {
  followingId?: string;
  followNickName?: string;
  onFollowChange?: (isFollowed: boolean) => void;
}

const FollowButton = ({
  followingId,
  followNickName,
  onFollowChange,
}: FollowButtonProps) => {
  const { user } = AUTH.use();
  const navi = useRouter();
  const [isFollowing, setIsFollowing] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const onFollow = useCallback(() => {
    if (!user) {
      alert("로그인 후 이용해주세요");
      return navi.push("/signin");
    }

    startTransition(async () => {
      try {
        await dbService
          .collection(FBCollection.USERS)
          .doc(user.uid)
          .collection(FBCollection.FOLLOWINGS)
          .doc(followingId)
          .set({
            followingId,
            follwingNickname: followNickName,
            createdAt: new Date().toLocaleString(),
          });

        await dbService
          .collection(FBCollection.USERS)
          .doc(followingId)
          .collection(FBCollection.FOLLOWERS)
          .doc(user.uid)
          .set({
            followerNickname: user?.nickname,
            createdAt: new Date().toLocaleString(),
          });

        await dbService
          .collection(FBCollection.USERS)
          .doc(followingId)
          .collection(FBCollection.NOTIFICATION)
          .add({
            type: "follow",
            follwingId: followingId,
            follwerId: user.uid,
            followerNickname: user?.nickname,
            createdAt: new Date().toLocaleString(),
            isRead: false,
          });

        setIsFollowing(true);
        onFollowChange?.(true);
        setAlertMessage(`${followNickName}님을 팔로우 했습니다`);
      } catch (error: any) {
        console.log(error.message);
        alert("팔로우 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
    });
  }, [user, followingId, followNickName, navi, onFollowChange]);

  const onUnFollow = useCallback(() => {
    if (!user) {
      setAlertMessage("로그인 후 이용해주세요");
      return navi.push("/signin");
    }

    startTransition(async () => {
      try {
        await dbService
          .collection(FBCollection.USERS)
          .doc(user.uid)
          .collection(FBCollection.FOLLOWINGS)
          .doc(followingId)
          .delete();

        await dbService
          .collection(FBCollection.USERS)
          .doc(followingId)
          .collection(FBCollection.FOLLOWERS)
          .doc(user.uid)
          .delete();

        setIsFollowing(false);
        onFollowChange?.(false);
      } catch (error: any) {
        console.error("언팔로우 오류:", error.message);
        alert("언팔로우 중 오류가 발생했습니다.");
      }
    });
  }, [user, followingId, navi, onFollowChange]);

  useEffect(() => {
    const checkFollowing = async () => {
      if (!user?.uid || !followingId) return;

      try {
        const ref = dbService
          .collection(FBCollection.USERS)
          .doc(user.uid)
          .collection(FBCollection.FOLLOWINGS)
          .doc(followingId);
        const snap = await ref.get();
        setIsFollowing(snap.exists);
      } catch (error: any) {
        console.error("팔로우 상태 확인 오류:", error.message);
      }
    };

    checkFollowing();
  }, [user, followingId]);

  return (
    <div>
      {isPending && <Loaiding />}
      {alertMessage && (
        <AlertModal
          message={alertMessage}
          onClose={() => setAlertMessage(null)}
        />
      )}
      {isFollowing ? (
        <button
          onClick={(e) => {
            e.stopPropagation(); // ✅ 버블링 방지
            onUnFollow();
          }}
          className="followButton"
        >
          UnFollow
        </button>
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation(); // ✅ 버블링 방지
            onFollow();
          }}
          className="followButton"
        >
          Follow
        </button>
      )}
    </div>
  );
};

export default FollowButton;
