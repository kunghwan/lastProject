"use client";

import { useCallback, useState } from "react";
import { GoHeart, GoHeartFill } from "react-icons/go";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { dbService, FBCollection } from "@/lib/firebase";
import { AUTH } from "@/contextapi/context";

interface LikeButtonProps {
  postId: string;
  likedBy?: string[]; // 옵셔널로 처리
  postOwnerId: string; // post 작성자의 uid
}

const LikeButton = ({ postId, likedBy = [], postOwnerId }: LikeButtonProps) => {
  const auth = getAuth();
  const user = auth.currentUser;
  const { user: meUser } = AUTH.use();

  const [likes, setLikes] = useState<string[]>(likedBy);

  const isLiked = user?.uid ? likes.includes(user.uid) : false;

  const handleLikeToggle = useCallback(async () => {
    if (!user || !user.uid) {
      alert("로그인이 필요합니다.");
      return;
    }

    const postRef = doc(dbService, "posts", postId);

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

      // 게시글 주인에게 알림 전송
      if (postOwnerId !== meUser?.uid) {
        await dbService
          .collection(FBCollection.USERS)
          .doc(postOwnerId)
          .collection(FBCollection.NOTIFICATION)
          .add({
            type: "like",
            postId,
            likerId: meUser?.uid,
            likerName: meUser?.nickname,
            createdAt: new Date().toLocaleString(),
            isRead: false,
          });
      }
    }
  }, [meUser, user, postOwnerId, isLiked, postId]);

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
