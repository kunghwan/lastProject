import { AUTH } from "@/contextapi/context";
import { dbService, FBCollection } from "@/lib";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState, useTransition } from "react";

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
    startTransition(async () => {});
  }, []);

  const onUnFollow = useCallback(() => {}, []);
  //현재 유저를 팔로우하고 있는지 확인용도
  useEffect(() => {
    const checkFollowing = async () => {
      if (!user) {
        return;
      }
      const ref = dbService
        .collection(FBCollection.USERS)
        .doc(user.uid)
        .collection("followings")
        .doc(followingId);
      const snap = await ref.get();
      //extsts는 문서가 존재하는지 확인하는 메서드(불리언타입임)
      setIsFollowing(snap.exists);
    };
    checkFollowing();
  }, [user, followingId]);
  return (
    <div>
      {isFollowing ? (
        <button
          onClick={() => {
            return handleFollow();
          }}
        >
          UnFollow
        </button>
      ) : (
        <button
          onClick={() => {
            return handleFollow();
          }}
        >
          Follow
        </button>
      )}
    </div>
  );
};

export default FollowButton;
