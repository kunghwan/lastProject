"use client";

import { useCallback, useMemo, useState } from "react";
import { GoHeart, GoHeartFill } from "react-icons/go";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { dbService, FBCollection } from "@/lib/firebase";
import { AUTH } from "@/contextapi/context";

interface LikeButtonProps {
  postId: string;
  likedBy?: string[];
  postOwnerId: string;
}

const LikeButton = ({ postId, likedBy = [], postOwnerId }: LikeButtonProps) => {
  const auth = getAuth();
  const user = auth.currentUser;
  const { user: meUser } = AUTH.use();

  const [likes, setLikes] = useState<string[]>(likedBy);

  const isLiked = useMemo(() => {
    return user?.uid ? likes.includes(user.uid) : false;
  }, [likes, user?.uid]);

  const handleLikeToggle = useCallback(async () => {
    if (!user?.uid) {
      alert("로그인이 필요합니다.");
      return;
    }

    const postRef = doc(dbService, FBCollection.POSTS, postId);

    if (isLiked) {
      setLikes((prev) => prev.filter((uid) => uid !== user.uid));
      await updateDoc(postRef, {
        likes: arrayRemove(user.uid),
      });
    } else {
      setLikes((prev) => [...prev, user.uid]);
      await updateDoc(postRef, {
        likes: arrayUnion(user.uid),
      });

      // 알림 전송
      if (postOwnerId !== meUser?.uid) {
        const notifRef = dbService
          .collection(FBCollection.USERS)
          .doc(postOwnerId)
          .collection(FBCollection.NOTIFICATION);

        await notifRef.add({
          type: "like",
          postId,
          likerId: meUser?.uid,
          likerName: meUser?.nickname,
          profileImageUrl: meUser?.profileImageUrl,
          createdAt: new Date(),
          isRead: false,
        });
      }
    }
  }, [
    isLiked,
    meUser?.uid,
    meUser?.nickname,
    postId,
    postOwnerId,
    user?.uid,
    meUser?.profileImageUrl,
  ]);

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={handleLikeToggle}
        className={`hover:scale-105 cursor-pointer p-0.5 ${
          isLiked ? "text-red-500" : "text-gray-500"
        }`}
      >
        {isLiked ? <GoHeartFill /> : <GoHeart />}
      </button>
      <span>{likes.length}</span>
    </div>
  );
};

export default LikeButton;
