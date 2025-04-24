"use client";

import React from "react";

const fallbackImages: Record<string, string> = {
  테미오래: "/custom/temiora.jpg",
  // 필요한 장소명 계속 추가 가능
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

  // ✅ 기본 + fallback 처리
  const imageUrl =
    place.firstimage && place.firstimage.trim() !== ""
      ? place.firstimage.trim()
      : fallbackImages[place.title] || defaultImage;

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
      <p className="text-sm text-gray-500">❤️ 좋아요: {place.likeCount}</p>
    </div>
  );
};

//!  초당 요청 제한	10건 내외 (공식적 언급은 없음, 경험상)
export default PlaceCard;
