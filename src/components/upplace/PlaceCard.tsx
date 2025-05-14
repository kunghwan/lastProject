"use client";

import React, { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";

import Image from "next/image";

import { GoHeart, GoHeartFill } from "react-icons/go";
import { doc, deleteDoc, setDoc } from "firebase/firestore";
import { dbService } from "@/lib/firebase";
import { getAuth } from "firebase/auth";
const fallbackImages: Record<string, string> = {
  테미오래: "/custom/temiora.jpg",
};

interface PlaceCardProps {
  place: {
    contentid: string;
    title: string;
    addr1: string;
    firstimage: string;
    likeCount: number;
  };
  likedOverride?: boolean;
  countOverride?: number;
  hideLikeButton?: boolean;
  priority?: boolean;

  // 북마크 페이지 등에서 사용될 콜백 (예: 북마크 리스트에서 제거용)
  onLikedChange?: (liked: boolean) => void;
}

const PlaceCard: React.FC<PlaceCardProps> = ({
  place,
  likedOverride,
  countOverride,
  hideLikeButton,
  priority = false,
  onLikedChange,
}) => {
  const router = useRouter();
  const auth = getAuth();
  const user = auth.currentUser;
  if (!place) return null;

  const defaultImage = "/image/logoc.PNG";

  const imageUrl = useMemo(() => {
    if (place.firstimage?.trim()) return place.firstimage.trim();
    if ((place as any).imageUrl?.trim) return (place as any).imageUrl.trim(); // 보완 처리
    return fallbackImages[place.title] || defaultImage;
  }, [place.firstimage, place.title]);

  const [likeCount, setLikeCount] = useState(
    countOverride !== undefined ? countOverride : place.likeCount
  );

  const [liked, setLiked] = useState<boolean>(
    likedOverride !== undefined ? likedOverride : false
  ); // 좋아요 여부 상태 추가

  const handleToggleLike = async () => {
    if (!user) return alert("로그인이 필요합니다.");

    const likeRef = doc(dbService, `users/${user.uid}/likes`, place.contentid);

    try {
      if (liked) {
        await deleteDoc(likeRef);
        setLiked(false);
        setLikeCount((prev) => Math.max(prev - 1, 0));
        onLikedChange?.(false); // 북마크 페이지에서 리스트 제거에 사용
      } else {
        const newCount = likeCount + 1;
        await setDoc(likeRef, {
          contentid: place.contentid,
          title: place.title,
          addr1: place.addr1,
          firstimage: place.firstimage,
          likeCount: newCount,
        });
        setLiked(true);
        setLikeCount((prev) => prev + 1);
        onLikedChange?.(true);
      }
    } catch (error) {
      console.error("좋아요 처리 실패", error);
    }
  };

  const handleClickImage = useCallback(() => {
    router.push(`/upplace/${place.contentid}`);
  }, [router, place.contentid]);

  return (
    <div className="hover:bg-gray-100 dark:hover:bg-gray-600 rounded-2xl p-1.5 cursor-pointer relative transition-all duration-200">
      <div className="relative w-full h-64 rounded-xl overflow-hidden">
        <Image
          src={imageUrl}
          alt={place.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-all duration-500 ease-in-out transform hover:scale-[1.01]"
          onClick={handleClickImage}
          priority={priority}
        />
      </div>

      <h2 className="text-sm font-semibold mt-2 line-clamp-1">{place.title}</h2>
      <p className="text-xs text-gray-500 dark:text-white line-clamp-1">
        {place.addr1}
      </p>

      <div className="mt-2 flex items-center justify-between">
        <button
          onClick={handleToggleLike}
          className="flex gap-2 items-center text-gray-700 dark:text-white"
        >
          {liked ? (
            <GoHeartFill className="text-lg text-red-500" />
          ) : (
            <GoHeart className="text-lg" />
          )}
          {likeCount}
        </button>
      </div>
    </div>
  );
};

export default PlaceCard;
