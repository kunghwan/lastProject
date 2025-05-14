"use client";

import { AUTH } from "@/contextapi/context";
import { dbService, FBCollection } from "@/lib";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState, useTransition } from "react";
import AlertModal from "@/components/AlertModal";
import { useAlertModal } from "../AlertStore";

interface FollowButtonProps {
  followingId?: string;
  followNickName?: string;
}

const FollowButton = ({ followingId, followNickName }: FollowButtonProps) => {
  const { user } = AUTH.use();
  const { openAlert } = useAlertModal();
  const navi = useRouter();
  const [isFollowing, setIsFollowing] = useState(false);

  const [isPending, startTransition] = useTransition();

  const onFollow = useCallback(() => {
    if (!user) {
      alert("로그인 후 이용해주세요");
      return navi.push("/signin");
    }

    startTransition(async () => {
      try {
        //! 내 팔롣잉 목록에 추가
        await dbService
          .collection(FBCollection.USERS)
          .doc(user.uid)
          .collection(FBCollection.FOLLOWINGS)
          .doc(followingId)
          .set({
            followingId,
            follwingNickname: followNickName,
            createdAt: new Date(),
          });
        //! 그 사람 팔로잉 목록에 나 추가
        await dbService
          .collection(FBCollection.USERS)
          .doc(followingId)
          .collection(FBCollection.FOLLOWERS)
          .doc(user.uid)
          .set({
            followerNickname: user?.nickname,
            createdAt: new Date(),
          });
        //! 팔로잉한 사람에게 알림 보내기
        await dbService
          .collection(FBCollection.USERS)
          .doc(followingId)
          .collection(FBCollection.NOTIFICATION)
          .add({
            type: "follow",
            follwingId: followingId,
            follwerId: user.uid,
            followerNickname: user?.nickname,
            profileImageUrl: user.profileImageUrl,
            createdAt: new Date(),
            isRead: false,
          });

        setIsFollowing(true);
        openAlert(
          `${followNickName}님을 팔로우 했습니다`,
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
      } catch (error: any) {
        alert("팔로우 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
    });
  }, [user, followingId, followNickName, navi, openAlert]);

  const onUnFollow = useCallback(() => {
    if (!user) {
      openAlert(
        "로그인 후 이용해주세요.",
        [
          {
            text: "확인",
            isGreen: true,
            autoFocus: true,
          },
        ],
        "알림"
      );
      return navi.push("/signin");
    }

    startTransition(async () => {
      try {
        //! 내 팔로잉 목록에서 그 사람 제거
        await dbService
          .collection(FBCollection.USERS)
          .doc(user.uid)
          .collection(FBCollection.FOLLOWINGS)
          .doc(followingId)
          .delete();
        //! 그 사람 팔로워목록에서 나 제거
        await dbService
          .collection(FBCollection.USERS)
          .doc(followingId)
          .collection(FBCollection.FOLLOWERS)
          .doc(user.uid)
          .delete();

        setIsFollowing(false);
      } catch (error: any) {
        openAlert(
          "언팔로우 중 오류가 발생했습니다.",
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
      }
    });
  }, [user, followingId, navi, openAlert]);

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
        setIsFollowing(snap.exists);
      } catch (error: any) {
        openAlert(
          "팔로우 상태를 확인하지 못하였습니다.",
          [
            {
              text: "확인",
              isGreen: true,
              autoFocus: true,
            },
          ],
          "알림"
        );

        return setIsFollowing(false);
      }
    };

    checkFollowing();
  }, [user, followingId, openAlert]);

  return (
    <div>
      {isFollowing ? (
        <button
          onClick={(e) => {
            e.stopPropagation(); // 버블링 방지
            //Todo: 이벤트는 자식 요소에서 부모 요소로 순차적으로 전파됨 =>  부모로 이벤트가 전파되지 않아 부모의 이벤트 핸들러는 실행되지 않게 됨
            onUnFollow();
          }}
          className="followButton"
        >
          UnFollow
        </button>
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation(); //  버블링 방지
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
