"use client";

import { useState } from "react";
import { GoHeart, GoHeartFill } from "react-icons/go";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { dbService } from "@/lib/firebase";

interface LikeButtonProps {
  postId: string;
  likedBy?: string[]; // 옵셔널로 처리
}

const LikeButton = ({ postId, likedBy = [] }: LikeButtonProps) => {
  const auth = getAuth();
  const user = auth.currentUser;

  const [likes, setLikes] = useState<string[]>(likedBy);

  const isLiked = user?.uid ? likes.includes(user.uid) : false;

  const handleLikeToggle = async () => {
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
    }
  };

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
