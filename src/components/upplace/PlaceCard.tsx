// components/PlaceCard.tsx

import React from "react";

// fallback 이미지 맵핑
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

  // ✅ 이미지 fallback 처리 로직
  const validImage =
    place.firstimage && place.firstimage.trim() !== ""
      ? place.firstimage.trim()
      : fallbackImages[place.title] || defaultImage;

  return (
    <div className="border p-4 rounded-lg shadow">
      <img
        src={validImage}
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

export default PlaceCard;
