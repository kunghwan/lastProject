"use client";

import { useEffect, useState, useCallback } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { dbService } from "@/lib/firebase";
import PlaceCard from "@/components/upplace/PlaceCard";
import { FcLike } from "react-icons/fc";

const UpPlaceBookMark = () => {
  const [places, setPlaces] = useState<Place[]>([]); // 북마크 장소 목록
  const [user, setUser] = useState<User | null>(null); // 인증 사용자 정보

  // ✅ 사용자 인증 상태 감지
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe(); // 컴포넌트 언마운트 시 정리
  }, []);

  // ✅ 북마크된 장소 가져오기 (user에 의존)
  const fetchLikedPlaces = useCallback(async () => {
    if (!user) return;

    try {
      const snap = await getDocs(
        collection(dbService, `users/${user.uid}/likes`)
      );
      const data = snap.docs.map((doc) => {
        const d = doc.data();
        return {
          contentid: d.contentid || doc.id.replace("places_", ""),
          title: d.title,
          addr1: d.addr1,
          firstimage: d.firstimage || d.imageUrl || "", // ✅ 안정적 처리
          likeCount: d.likeCount ?? 0,
        };
      });
      setPlaces(data);
    } catch (err) {
      console.error("🔥 북마크 장소 로딩 실패", err);
    }
  }, [user]);

  // ✅ user가 세팅되면 북마크 로딩
  useEffect(() => {
    fetchLikedPlaces();
  }, [fetchLikedPlaces]);

  // 특정 장소 북마크 삭제
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
      <h1 className="text-xl font-bold mb-4 flex gap-2.5">
        {" "}
        <FcLike /> 내가 좋아요한 추천 장소
      </h1>

      {places.length === 0 ? (
        <p className="text-gray-500">좋아요한 장소가 없습니다.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {places.map((place) => (
            <div
              key={place.contentid}
              className="relative hover:bg-gray-100 rounded-2xl p-1.5 transition-all duration-200"
            >
              <PlaceCard
                place={place}
                likedOverride={true}
                countOverride={place.likeCount}
                hideLikeButton={true} // ✅ 북마크에서만 좋아요 버튼 숨김
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
