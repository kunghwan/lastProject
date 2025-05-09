"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import PlaceCard from "@/components/upplace/PlaceCard";
import TopButton from "@/components/upplace/TopButton";

// ✅ 이미지 유효성 검사 함수: 이미지가 존재하는지 확인
const checkImageExists = (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = url; // 이미지 로드 시도
    img.onload = () => resolve(true); // 로드 성공
    img.onerror = () => resolve(false); // 로드 실패
  });
};

const UpPlace = () => {
  //! react-query 하나로 모든작업 단축
  const [places, setPlaces] = useState<Place[]>([]); // 전체 장소 목록 상태
  const [visibleCount, setVisibleCount] = useState(10); // 화면에 보여줄 항목 수 (초기 10개)

  // ✅ 컴포넌트 마운트 시 장소 목록 API 호출
  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const res = await axios.get("/api/recommendmerged"); // 서버 API 호출
        const rawPlaces: Place[] = res.data;

        // ✅ 유효한 이미지가 있는 장소만 필터링
        const validPlaces = await Promise.all(
          rawPlaces.map(async (place) => {
            const valid =
              place.firstimage &&
              place.firstimage.trim() !== "" &&
              (await checkImageExists(place.firstimage.trim()));
            return valid ? place : null;
          })
        );

        // null이 아닌 값만 저장
        setPlaces(validPlaces.filter((p): p is Place => p !== null));
      } catch (error) {
        console.error("🔥 추천 장소 불러오기 실패", error);
      }
    };

    fetchPlaces(); // 즉시 호출
  }, []);

  // ✅ 좋아요 수 기준으로 내림차순 정렬
  const sortedPlaces = [...places].sort((a, b) => b.likeCount - a.likeCount);

  // ✅ 현재 화면에 보여줄 장소들
  const visiblePlaces = sortedPlaces.slice(0, visibleCount);

  // ✅ 더 보여줄 장소가 있는지 여부
  const hasMore = visibleCount < sortedPlaces.length;

  // ✅ 무한스크롤 구현
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY; // 현재 스크롤 위치
      const windowHeight = window.innerHeight; // 브라우저 창 높이
      const fullHeight = document.documentElement.scrollHeight; // 문서 전체 높이

      // 스크롤이 거의 바닥에 닿았을 때
      if (scrollTop + windowHeight >= fullHeight - 100) {
        if (hasMore) {
          setVisibleCount((prev) => prev + 10); // 10개씩 더 보여줌
        }
      }
    };

    // 스크롤 이벤트 등록
    window.addEventListener("scroll", handleScroll);

    // 컴포넌트 언마운트 시 이벤트 제거
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore]);

  return (
    <div id="scrollableDiv">
      {/* ✅ 장소들을 카드 형태로 출력 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visiblePlaces.map((place) => (
          <PlaceCard key={place.contentid} place={place} />
        ))}
      </div>

      {/* ✅ 더보기 버튼 없이 무한 스크롤만 사용하므로 버튼 제거하고 TopButton만 남김 */}
      <TopButton />
    </div>
  );
};

export default UpPlace;
