"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  startAfter,
  limit,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { useInView } from "react-intersection-observer";
import { useInfiniteQuery } from "@tanstack/react-query";
import { dbService } from "@/lib/firebase";
import PlaceCard from "@/components/upplace/PlaceCard";
import TopButton from "@/components/upplace/TopButton";
import type { InfiniteData } from "@tanstack/react-query";
import { getAuth } from "firebase/auth";

const PAGE_SIZE = 12;

type PageParam = {
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  isPopularPhase: boolean;
};

interface Place {
  contentId: string;
  title: string;
  addr1: string;
  firstimage: string;
  likeCount: number;
  id: string;
}

interface FetchResult {
  places: Place[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  isPopularPhase: boolean;
}

const fetchPlaces = async ({
  pageParam,
}: {
  pageParam?: PageParam;
}): Promise<FetchResult> => {
  const isPopularPhase = pageParam?.isPopularPhase ?? true;
  const lastDoc = pageParam?.lastDoc ?? null;

  let q;
  if (isPopularPhase) {
    q = query(
      collection(dbService, "places"),
      where("likeCount", ">=", 10),
      orderBy("likeCount", "desc"),
      ...(lastDoc ? [startAfter(lastDoc)] : []),
      limit(PAGE_SIZE)
    );
  } else {
    q = query(
      collection(dbService, "places"),
      orderBy("createdAt", "desc"),
      ...(lastDoc ? [startAfter(lastDoc)] : []),
      limit(PAGE_SIZE)
    );
  }

  const snap = await getDocs(q);
  const places = snap.docs.map((doc) => ({
    ...(doc.data() as Place),
    id: doc.id,
  }));

  return {
    places,
    lastDoc: snap.docs[snap.docs.length - 1] ?? null,
    isPopularPhase,
  };
};

const UpPlace = () => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery<
    FetchResult,
    Error,
    InfiniteData<FetchResult>,
    [string],
    PageParam
  >({
    queryKey: ["places-hybrid-infinite"],
    queryFn: ({ pageParam }) => fetchPlaces({ pageParam }),
    getNextPageParam: (lastPage) => {
      // 📌 인기 목록이 아직 끝나지 않았으면 계속 가져오기
      if (lastPage.isPopularPhase && lastPage.places.length === PAGE_SIZE) {
        return { lastDoc: lastPage.lastDoc, isPopularPhase: true };
      }

      // 📌 인기 목록이 끝났다면 일반 목록으로 전환
      if (lastPage.isPopularPhase) {
        return { lastDoc: null, isPopularPhase: false };
      }

      // 📌 일반 목록도 다 불러왔으면 종료
      if (lastPage.places.length < PAGE_SIZE) return undefined;

      return { lastDoc: lastPage.lastDoc, isPopularPhase: false };
    },
    initialPageParam: { lastDoc: null, isPopularPhase: true },
  });

  const [likedIds, setLikedIds] = useState<string[]>([]);
  const user = getAuth().currentUser;

  useEffect(() => {
    const fetchLikedIds = async () => {
      if (!user) return;
      const snap = await getDocs(
        collection(dbService, `users/${user.uid}/likes`)
      );
      const ids = snap.docs.map((doc) => doc.id); // 예: "places_12345"
      setLikedIds(ids);
    };
    fetchLikedIds();
  }, [user]);

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-10">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="h-60 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center text-gray-500 text-sm"
          >
            장소 불러오는 중...
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center mt-20 text-red-500">데이터 불러오기 실패</div>
    );
  }

  return (
    <div className="pb-28">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-12 sm:px-4">
        {data?.pages.flatMap((page, i) =>
          page.places.map((place) => (
            <PlaceCard
              key={place.id}
              place={place}
              priority={i === 0}
              likedOverride={likedIds.includes(`places_${place.contentId}`)}
            />
          ))
        )}
      </div>

      <div ref={ref} className="h-10" />

      {isFetchingNextPage && (
        <div className="text-center py-5 text-sm text-gray-500">
          더 불러오는 중...
        </div>
      )}

      <TopButton />
    </div>
  );
};

export default UpPlace;
