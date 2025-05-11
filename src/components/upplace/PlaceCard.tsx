"use client";

import React, { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import UpPlaceLikeButton from "@/components/upplace/UpPlaceLikeButton";
import Image from "next/image";

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
}

const PlaceCard: React.FC<PlaceCardProps> = ({
  place,
  likedOverride,
  countOverride,
  hideLikeButton,
  priority = false,
}) => {
  const router = useRouter();
  if (!place) return null;

  const defaultImage = "/image/logoc.PNG";

  const imageUrl = useMemo(() => {
    if (place.firstimage?.trim()) return place.firstimage.trim();
    return fallbackImages[place.title] || defaultImage;
  }, [place.firstimage, place.title]);

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
      <div className="relative w-full h-[270px] cursor-pointer rounded overflow-hidden">
        <Image
          src={imageUrl}
          alt={place.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
          onClick={handleClickImage}
          priority={priority}
        />
      </div>
      <h2 className="text-lg font-bold mt-2">{place.title}</h2>
      <p className="text-sm text-gray-600 dark:text-white">{place.addr1}</p>
      <div className="mt-2 flex items-center justify-between">
        <p className="text-sm text-gray-500">❤️ {likeCount}</p>
        {!hideLikeButton && (
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
        )}
      </div>
    </div>
  );
};

export default PlaceCard;
