"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import PlaceCard from "@/components/upplace/PlaceCard";
import TopButton from "@/components/upplace/TopButton";

interface Place {
  contentid: string;
  title: string;
  addr1: string;
  firstimage: string;
  likeCount: number;
}

// 이미지 유효성 체크 함수
const checkImageExists = (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = url;
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
  });
};

const UpPlace = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [visibleCount, setVisibleCount] = useState(10);
  const [showLoadMore, setShowLoadMore] = useState(false); // ✅ 추가

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const res = await axios.get("/api/recommendmerged");
        const rawPlaces: Place[] = res.data;

        const validPlaces = await Promise.all(
          rawPlaces.map(async (place) => {
            const valid =
              place.firstimage &&
              place.firstimage.trim() !== "" &&
              (await checkImageExists(place.firstimage.trim()));
            return valid ? place : null;
          })
        );

        setPlaces(validPlaces.filter((p): p is Place => p !== null));
      } catch (error) {
        console.error("🔥 추천 장소 불러오기 실패", error);
      }
    };

    fetchPlaces();
  }, []);

  // ✅ 스크롤 감지해서 맨 아래쯤 도달하면 showLoadMore true
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const fullHeight = document.documentElement.scrollHeight;

      if (scrollTop + windowHeight >= fullHeight - 100) {
        // 거의 다 내렸을 때
        setShowLoadMore(true);
      } else {
        setShowLoadMore(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const sortedPlaces = [...places].sort((a, b) => b.likeCount - a.likeCount);
  const visiblePlaces = sortedPlaces.slice(0, visibleCount);
  const hasMore = visibleCount < sortedPlaces.length;

  const handleToggle = () => {
    if (hasMore) {
      setVisibleCount((prev) => prev + 10);
    } else {
      setVisibleCount(10);
    }
  };

  return (
    <div id="scrollableDiv">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visiblePlaces.map((place) => (
          <PlaceCard key={place.contentid} place={place} />
        ))}
      </div>

      {/* ✅ "스크롤 다 내렸을 때" + "아직 남은게 있을 때"만 버튼 보이게 */}
      {showLoadMore && hasMore && (
        <div className="fixed bottom-5 right-50 transform translate-x-1/2 z-100">
          <button
            onClick={handleToggle}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition border cursor-pointer"
          >
            {hasMore ? "더보기 ▼" : "접기 ▲"}
          </button>
        </div>
      )}

      <TopButton />
    </div>
  );
};

export default UpPlace;
