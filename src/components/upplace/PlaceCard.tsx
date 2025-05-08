"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation"; // 라우팅용 훅
import UpPlaceLikeButton from "@/components/upplace/UpPlaceLikeButton"; // 좋아요 버튼 컴포넌트

// ✅ 특정 장소에 대한 이미지 fallback 설정 (이미지 없을 경우 대체 이미지)
const fallbackImages: Record<string, string> = {
  테미오래: "/custom/temiora.jpg", // 예시: 테미오래 → 로컬 대체 이미지
};

// ✅ 장소 타입 정의
interface UpPlace {
  contentid: string; // 장소 ID
  title: string; // 장소명
  addr1: string; // 주소
  firstimage: string; // 대표 이미지
  likeCount: number; // 좋아요 수
}

// ✅ props 타입 정의
interface PlaceCardProps {
  place?: UpPlace; // 렌더링할 장소 객체
  likedOverride?: boolean; // 외부에서 좋아요 상태 강제 지정
  countOverride?: number; // 외부에서 좋아요 수 강제 지정
}

// ✅ 장소 카드 컴포넌트 정의
const PlaceCard: React.FC<PlaceCardProps> = ({
  place,
  likedOverride,
  countOverride,
}) => {
  const router = useRouter(); // 라우터 객체 사용
  if (!place) return null; // 장소 정보 없으면 렌더 안 함

  const defaultImage = "/image/logoc.PNG"; // 기본 이미지 (없을 경우)

  // ✅ 이미지 URL 우선순위: 유효한 이미지 → fallback 이미지 → 기본 이미지
  const imageUrl =
    place.firstimage && place.firstimage.trim() !== ""
      ? place.firstimage.trim()
      : fallbackImages[place.title] || defaultImage;

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
      <img
        src={imageUrl}
        onError={(e) => {
          e.currentTarget.onerror = null; // 무한 반복 방지
          e.currentTarget.src = fallbackImages[place.title] || defaultImage;
        }}
        alt={place.title}
        className="w-full h-68 object-cover rounded cursor-pointer"
        loading="lazy" // 이미지 지연 로딩
        onClick={handleClickImage} // 클릭 시 상세 페이지로 이동
      />
      {/* 장소명 */}
      <h2 className="text-lg font-bold mt-2">{place.title}</h2>
      {/* 주소 */}
      <p className="text-sm text-gray-600 dark:text-white">{place.addr1}</p>
      {/* 좋아요 영역 */}
      <div className="mt-2 flex items-center justify-between">
        {/* 좋아요 수 */}
        <p className="text-sm text-gray-500">❤️ {likeCount}</p>

        {/* 좋아요 버튼 컴포넌트 */}
        <UpPlaceLikeButton
          contentId={place.contentid} // 장소 ID
          onLiked={handleLiked} // 좋아요 후 callback
          placeInfo={{
            // 장소 정보 전달
            title: place.title,
            addr1: place.addr1,
            imageUrl: place.firstimage,
          }}
          likedOverride={likedOverride} // 외부에서 좋아요 상태 제어
          countOverride={countOverride} // 외부에서 좋아요 수 제어
        />
      </div>
    </div>
  );
};

export default PlaceCard; // 컴포넌트 export
