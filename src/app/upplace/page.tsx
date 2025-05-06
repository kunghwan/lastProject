"use client";

import { useEffect, useState } from "react";
import { getDocs, collection } from "firebase/firestore";
import { dbService } from "@/lib/firebase";
import PlaceCard from "@/components/upplace/PlaceCard";
import TopButton from "@/components/upplace/TopButton";

interface Place {
  contentid: string;
  title: string;
  addr1: string;
  firstimage: string;
  likeCount: number;
}

const UpPlace = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const snap = await getDocs(collection(dbService, "places"));
        const rawPlaces = snap.docs.map((doc) => doc.data() as Place);

        setPlaces(
          rawPlaces.filter(
            (place) => place.firstimage && place.firstimage.trim() !== ""
          )
        );
      } catch (error) {
        console.error("🔥 Firestore에서 추천 장소 불러오기 실패", error);
      }
    };

    fetchPlaces();
  }, []);

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

  return (
    <div id="scrollableDiv">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visiblePlaces.map((place) => (
          <PlaceCard key={place.contentid} place={place} />
        ))}
      </div>
      <TopButton />
    </div>
  );
};

export default UpPlace;
