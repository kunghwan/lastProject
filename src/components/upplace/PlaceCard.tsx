"use client";

import React, { useState } from "react";
import UpPlaceLikeButton from "@/components/upplace/UpPlaceLikeButton";

const fallbackImages: Record<string, string> = {
  테미오래: "/custom/temiora.jpg",
};

interface Place {
  contentid: string;
  title: string;
  addr1: string;
  firstimage: string;
  likeCount: number;
}

const PlaceCard: React.FC<{ place?: Place }> = ({ place }) => {
  if (!place) return null;

  const defaultImage = "/image/logoc.PNG";

  const imageUrl =
    place.firstimage && place.firstimage.trim() !== ""
      ? place.firstimage.trim()
      : fallbackImages[place.title] || defaultImage;

  // ✅ 로컬 likeCount 상태 관리
  const [likeCount, setLikeCount] = useState(place.likeCount);

  // ✅ likeCount를 업데이트할 콜백
  const handleLiked = (newCount: number) => {
    setLikeCount(newCount);
  };

  return (
    <div className="border p-4 rounded-lg shadow">
      <img
        src={imageUrl}
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = fallbackImages[place.title] || defaultImage;
        }}
        alt={place.title}
        className="w-full h-48 object-cover rounded"
        loading="lazy"
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
