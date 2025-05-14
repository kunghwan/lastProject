"use client";

import React, { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import UpPlaceLikeButton from "@/components/upplace/UpPlaceLikeButton";
import Image from "next/image";
import { FcLike } from "react-icons/fc";

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
    if ((place as any).imageUrl?.trim) return (place as any).imageUrl.trim(); // 보완 처리
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
        <p className=" flex gap-2 items-center">
          <FcLike className="text-lg" /> {likeCount}
        </p>
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
