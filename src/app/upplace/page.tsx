"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import PlaceCard from "@/components/upplace/PlaceCard";

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

  const sortedPlaces = [...places].sort((a, b) => b.likeCount - a.likeCount);
  const visiblePlaces = sortedPlaces.slice(0, visibleCount);
  const hasMore = visibleCount < sortedPlaces.length;

  const handleToggle = () => {
    if (hasMore) {
      setVisibleCount((prev) => prev + 10); // 🔼 더보기 10개씩 증가
    } else {
      setVisibleCount(10); // 🔽 접기: 처음 10개만
    }
  };

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visiblePlaces.map((place) => (
          <PlaceCard key={place.contentid} place={place} />
        ))}
      </div>

      {sortedPlaces.length > 10 && (
        <div className="mt-6 text-center">
          <button
            onClick={handleToggle}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
          >
            {hasMore ? "더보기 ▼" : "접기 ▲"}
          </button>
        </div>
      )}
    </div>
  );
};

export default UpPlace;
