"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
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

interface PlaceCardProps {
  place?: UpPlace;
  likedOverride?: boolean;
  countOverride?: number;
}

const PlaceCard: React.FC<PlaceCardProps> = ({
  place,
  likedOverride,
  countOverride,
}) => {
  const router = useRouter();
  if (!place) return null;

  const defaultImage = "/image/logoc.PNG";

  const imageUrl =
    place.firstimage && place.firstimage.trim() !== ""
      ? place.firstimage.trim()
      : fallbackImages[place.title] || defaultImage;

  const [likeCount, setLikeCount] = useState(
    countOverride !== undefined ? countOverride : place.likeCount
  );

  const handleLiked = useCallback((newCount: number) => {
    setLikeCount(newCount);
  }, []);

  const handleClickImage = useCallback(() => {
    router.push(`/upplace/${place.contentid}`);
  }, [router, place.contentid]);

  return (
    <div className="p-1 rounded-lg shadow">
      <img
        src={imageUrl}
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = fallbackImages[place.title] || defaultImage;
        }}
        alt={place.title}
        className="w-full h-68 object-cover rounded cursor-pointer"
        loading="lazy"
        onClick={handleClickImage}
      />
      <h2 className="text-lg font-bold mt-2">{place.title}</h2>
      <p className="text-sm text-gray-600 dark:text-white">{place.addr1}</p>

      <div className="mt-2 flex items-center justify-between">
        <p className="text-sm text-gray-500">❤️ {likeCount}</p>
        <UpPlaceLikeButton
          contentId={place.contentid}
          onLiked={handleLiked}
          placeInfo={{
            title: place.title,
            addr1: place.addr1,
            imageUrl: place.firstimage,
          }}
          likedOverride={likedOverride}
          countOverride={countOverride}
        />
      </div>
    </div>
  );
};

export default PlaceCard;
