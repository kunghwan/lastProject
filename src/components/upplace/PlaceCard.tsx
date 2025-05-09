"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import UpPlaceLikeButton from "@/components/upplace/UpPlaceLikeButton";
import Image from "next/image"; // ✅ next/image로 최적화
import { useMemo } from "react";

// ✅ 특정 장소에 대한 이미지 fallback 설정 (이미지 없을 경우 대체 이미지)
const fallbackImages: Record<string, string> = {
  테미오래: "/custom/temiora.jpg", // 예시: 테미오래 → 로컬 대체 이미지
};

// ✅ 장소 카드 컴포넌트 정의
const PlaceCard: React.FC<PlaceCardProps> = ({
  place,
  likedOverride,
  countOverride,
  hideLikeButton,
}) => {
  const router = useRouter(); // 라우터 객체 사용
  if (!place) return null; // 장소 정보 없으면 렌더 안 함

  const defaultImage = "/image/logoc.PNG"; // 기본 이미지 (없을 경우)

  // ✅ 이미지 URL 우선순위: 유효한 이미지 → fallback 이미지 → 기본 이미지

  // ...

  const imageUrl = useMemo(() => {
    if (place.firstimage?.trim()) return place.firstimage.trim();
    return fallbackImages[place.title] || defaultImage;
  }, [place.firstimage, place.title]);

  // ✅ 좋아요 수 상태 (외부 override 있으면 그걸로 초기화)
  const [likeCount, setLikeCount] = useState(
    countOverride !== undefined ? countOverride : place.likeCount
  );

  // ✅ 좋아요 상태 업데이트 콜백
  const handleLiked = useCallback((newCount: number) => {
    setLikeCount(newCount); // 좋아요 수 업데이트
  }, []);

  // ✅ 카드 클릭 시 상세 페이지로 이동
  const handleClickImage = useCallback(() => {
    router.push(`/upplace/${place.contentid}`);
  }, [router, place.contentid]);

  return (
    <div className="p-1 rounded-lg shadow">
      {" "}
      {/* 카드 전체 컨테이너 */}
      {/* 대표 이미지 */}
      <div className="relative w-full h-[270px] cursor-pointer rounded overflow-hidden">
        <Image
          src={imageUrl}
          alt={place.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
          onClick={handleClickImage} // 클릭 시 상세 페이지로 이동
          priority={false} // lazy load (기본)
        />
      </div>
      {/* 장소명 */}
      <h2 className="text-lg font-bold mt-2">{place.title}</h2>
      {/* 주소 */}
      <p className="text-sm text-gray-600 dark:text-white">{place.addr1}</p>
      {/* 좋아요 영역 */}
      <div className="mt-2 flex items-center justify-between">
        {/* 좋아요 수 */}
        <p className="text-sm text-gray-500">❤️ {likeCount}</p>

        {/* 좋아요 버튼 컴포넌트 */}
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
// 유효성 검사 결과 공통 타입
