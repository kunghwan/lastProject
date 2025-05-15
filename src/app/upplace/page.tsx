"use client";

import { useEffect, useMemo, useState } from "react";
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
      if (lastPage.isPopularPhase && lastPage.places.length === PAGE_SIZE) {
        return { lastDoc: lastPage.lastDoc, isPopularPhase: true };
      }
      if (lastPage.isPopularPhase) {
        return { lastDoc: null, isPopularPhase: false };
      }
      if (lastPage.places.length < PAGE_SIZE) return undefined;
      return { lastDoc: lastPage.lastDoc, isPopularPhase: false };
    },
    initialPageParam: { lastDoc: null, isPopularPhase: true },
  });

  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});

  const user = getAuth().currentUser;

  useEffect(() => {
    const fetchLikedIds = async () => {
      if (!user) return;
      const snap = await getDocs(
        collection(dbService, `users/${user.uid}/likes`)
      );
      const ids = snap.docs.map((doc) => doc.id);
      const counts: Record<string, number> = {};
      snap.docs.forEach((doc) => {
        counts[doc.id] = doc.data().likeCount ?? 0;
      });
      setLikedIds(ids);
      setLikeCounts(counts);
    };

    fetchLikedIds();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchLikedIds();
      }
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      window.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [user]);

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const handleLikedChange = (id: string, liked: boolean) => {
    setLikedIds((prev) => {
      if (liked) return [...prev, id];
      return prev.filter((item) => item !== id);
    });
  };

  // ✅ 중복 제거 및 이미지 유효성 체크 포함
  const uniquePlaces = useMemo(() => {
    const all = data?.pages.flatMap((page) => page.places) || [];
    const map = new Map<string, Place>();
    all.forEach((place) => {
      if (
        place.firstimage &&
        place.firstimage.trim() !== "" &&
        !map.has(place.contentId)
      ) {
        map.set(place.contentId, place);
      }
    });
    return Array.from(map.values());
  }, [data]);

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
        {uniquePlaces.map((place, index) => (
          <PlaceCard
            key={place.contentId}
            place={place}
            priority={index === 0}
            likedOverride={likedIds.includes(`places_${place.contentId}`)}
            onLikedChange={(liked) =>
              handleLikedChange(`places_${place.contentId}`, liked)
            }
          />
        ))}
      </div>

      <div ref={ref} className="h-10" />

      {isFetchingNextPage &&
        Array.from({ length: 9 }).map((_, i) => (
          <div
            key={`loading-${i}`}
            className="h-60 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center text-gray-500 text-sm"
          >
            장소 불러오는 중...
          </div>
        ))}

      <TopButton />
    </div>
  );
};

export default UpPlace;
