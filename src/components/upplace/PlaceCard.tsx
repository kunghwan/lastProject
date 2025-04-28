"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation"; // ✅ 추가
import UpPlaceLikeButton from "@/components/upplace/UpPlaceLikeButton";

const fallbackImages: Record<string, string> = {
  테미오래: "/custom/temiora.jpg",
};

interface UpPlace {
  contentid: string;
  title: string;
  addr1: string;
  firstimage: string;
  likeCount: number;
}

const PlaceCard: React.FC<{ place?: UpPlace }> = ({ place }) => {
  const router = useRouter(); // ✅ 추가
  if (!place) return null;

  const defaultImage = "/image/logoc.PNG";

  const imageUrl =
    place.firstimage && place.firstimage.trim() !== ""
      ? place.firstimage.trim()
      : fallbackImages[place.title] || defaultImage;

  const [likeCount, setLikeCount] = useState(place.likeCount);

  const handleLiked = useCallback((newCount: number) => {
    setLikeCount(newCount);
  }, []);

  const handleClickImage = useCallback(() => {
    router.push(`/upplace/${place.contentid}`);
  }, [router, place.contentid]);

  return (
    <div className=" p-4 rounded-lg shadow">
      <img
        src={imageUrl}
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = fallbackImages[place.title] || defaultImage;
        }}
        alt={place.title}
        className="w-full h-48 object-cover rounded cursor-pointer" // ✅ 커서 모양
        loading="lazy"
        onClick={handleClickImage} // ✅ 클릭 핸들러 연결
      />
      <h2 className="text-lg font-bold mt-2">{place.title}</h2>
      <p className="text-sm text-gray-600">{place.addr1}</p>

      <div className="mt-2 flex items-center justify-between">
        <p className="text-sm text-gray-500">❤️ 좋아요: {likeCount}</p>
        <UpPlaceLikeButton contentId={place.contentid} onLiked={handleLiked} />
      </div>
    </div>
  );
};

export default PlaceCard;
