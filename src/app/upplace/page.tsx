// ✅ 수정된 UpPlace.tsx

"use client";

import { useEffect, useState, lazy, Suspense } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import TopButton from "@/components/upplace/TopButton";

const PlaceCard = lazy(() => import("@/components/upplace/PlaceCard")); // ✅ lazy import

interface Place {
  contentid: string;
  title: string;
  addr1: string;
  firstimage: string;
  likeCount: number;
}

const fetchPlaces = async (): Promise<Place[]> => {
  const res = await axios.get("/api/recommendmerged");
  return res.data;
};

const UpPlace = () => {
  const [visibleCount, setVisibleCount] = useState(10);

  const {
    data: places = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["places"],
    queryFn: fetchPlaces,
    staleTime: 1000 * 60 * 5,
  });

  const sortedPlaces = [...places].sort((a, b) => b.likeCount - a.likeCount);
  const visiblePlaces = sortedPlaces.slice(0, visibleCount);
  const hasMore = visibleCount < sortedPlaces.length;

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const fullHeight = document.documentElement.scrollHeight;

      if (scrollTop + windowHeight >= fullHeight - 100 && hasMore) {
        setVisibleCount((prev) => prev + 10);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore]);

  if (isLoading)
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="h-60 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center text-gray-500 text-sm"
          >
            장소를 불러오고 있습니다...
          </div>
        ))}
      </div>
    );

  if (isError)
    return (
      <div className="text-center mt-20 text-red-500">데이터 불러오기 실패</div>
    );

  return (
    <div id="scrollableDiv" className="pb-28">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visiblePlaces
          .filter((place) => place.firstimage?.trim())
          .map((place, i) => (
            <Suspense
              key={place.contentid}
              fallback={
                <div className="h-[270px] bg-gray-200 animate-pulse rounded-lg flex items-center justify-center text-gray-500 text-sm">
                  장소 로딩 중...
                </div>
              }
            >
              <PlaceCard place={place} priority={i === 0} />
            </Suspense>
          ))}
      </div>
      <TopButton />
    </div>
  );
};

export default UpPlace;

//!sdfsdfsdfdsfdfsdfsdfsdfsdfsdfdsf
