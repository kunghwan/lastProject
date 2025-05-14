"use client";

import { useEffect } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
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

const PAGE_SIZE = 12;

// ✅ pageParam 타입 명시
type PageParam = QueryDocumentSnapshot<DocumentData> | null;

interface Place {
  contentid: string;
  title: string;
  addr1: string;
  firstimage: string;
  likeCount: number;
  id: string; // 🔥 추가
}

interface FetchResult {
  places: Place[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
}

// ✅ Firestore에서 데이터 불러오는 함수
const fetchPlaces = async ({
  pageParam,
}: {
  pageParam?: PageParam;
}): Promise<FetchResult> => {
  let q = query(
    collection(dbService, "places"),
    orderBy("createdAt", "desc"),
    limit(PAGE_SIZE)
  );

  if (pageParam) {
    q = query(
      collection(dbService, "places"),
      orderBy("createdAt", "desc"),
      startAfter(pageParam),
      limit(PAGE_SIZE)
    );
  }

  const snap = await getDocs(q);
  const places = snap.docs.map((doc) => ({
    ...(doc.data() as Place),
    id: doc.id,
  }));
  const lastDoc = snap.docs[snap.docs.length - 1] ?? null;
  return { places, lastDoc };
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
    FetchResult, // TQueryFnData (1 페이지 결과)
    Error, // TError
    InfiniteData<FetchResult>, // ✅ TData: 전체 페이지를 포함한 InfiniteData로 명시
    [string], // TQueryKey
    PageParam // TPageParam
  >({
    queryKey: ["places-infinite"],
    queryFn: ({ pageParam }) => fetchPlaces({ pageParam }),
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.places.length < PAGE_SIZE) return undefined;
      return lastPage.lastDoc;
    },
    initialPageParam: null,
  });

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.pages.flatMap((page, i) =>
          page.places.map((place) => (
            <PlaceCard key={place.id} place={place} priority={i === 0} />
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
