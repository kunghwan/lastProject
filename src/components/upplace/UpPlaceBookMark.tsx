"use client";

import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { dbService } from "@/lib/firebase";
import PlaceCard from "@/components/upplace/PlaceCard";

interface Place {
  contentid: string;
  title: string;
  addr1: string;
  firstimage: string;
  likeCount: number;
}

const UpPlaceBookMark = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const user = getAuth().currentUser;

  useEffect(() => {
    const fetchLikedPlaces = async () => {
      if (!user) return;

      try {
        const snap = await getDocs(
          collection(dbService, `users/${user.uid}/likes`)
        );
        const data = snap.docs.map((doc) => {
          const d = doc.data();
          return {
            contentid: doc.id,
            title: d.title,
            addr1: d.addr1,
            firstimage: d.imageUrl,
            likeCount: d.likeCount ?? 0,
          };
        });

        setPlaces(data);
      } catch (err) {
        console.error("🔥 북마크 장소 로딩 실패", err);
      }
    };

    fetchLikedPlaces();
  }, []);

  const handleDelete = async (contentid: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(dbService, `users/${user.uid}/likes`, contentid));
      setPlaces((prev) => prev.filter((p) => p.contentid !== contentid));
    } catch (err) {
      console.error("❌ 북마크 삭제 실패", err);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">❤️ 내가 좋아요한 추천 장소</h1>
      {places.length === 0 ? (
        <p className="text-gray-500">좋아요한 장소가 없습니다.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {places.map((place) => (
            <div key={place.contentid} className="relative">
              <PlaceCard
                place={place}
                likedOverride={true}
                countOverride={place.likeCount}
              />
              <button
                onClick={() => handleDelete(place.contentid)}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded shadow"
              >
                삭제
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UpPlaceBookMark;
