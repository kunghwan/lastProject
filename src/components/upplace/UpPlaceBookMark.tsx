"use client";

import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { dbService } from "@/lib/firebase";
import PlaceCard from "@/components/upplace/PlaceCard";

const UpPlaceBookMark = () => {
  // places: 북마크된 장소 목록을 상태로 관리
  const [places, setPlaces] = useState<Place[]>([]);
  // Firebase 인증된 현재 사용자 정보
  const user = getAuth().currentUser;

  // 컴포넌트가 마운트될 때 한 번 실행되어 Firestore에서 좋아요한 장소들을 불러옴
  useEffect(() => {
    const fetchLikedPlaces = async () => {
      if (!user) return; // 사용자가 없으면 아무것도 안 함

      try {
        // users/{uid}/likes 컬렉션의 모든 문서 가져오기
        const snap = await getDocs(
          collection(dbService, `users/${user.uid}/likes`)
        );
        // 문서 스냅샷을 원하는 형태로 매핑
        const data = snap.docs.map((doc) => {
          const d = doc.data(); // 문서의 실제 데이터
          return {
            contentid: doc.id, // 문서 ID
            title: d.title, // 저장된 장소 제목
            addr1: d.addr1, // 저장된 주소
            firstimage: d.imageUrl, // 저장된 이미지 URL (필드명은 imageUrl)
            likeCount: d.likeCount ?? 0, // 좋아요 수가 없으면 0으로 기본값 처리
          };
        });

        setPlaces(data); // 상태에 세팅
      } catch (err) {
        console.error("🔥 북마크 장소 로딩 실패", err); // 에러 처리
      }
    };

    fetchLikedPlaces(); // 비동기 함수 호출
  }, []); // 의존성 배열 빈 칸: 최초 1회만 실행

  // 특정 contentid 문서를 삭제하는 함수
  const handleDelete = async (contentid: string) => {
    if (!user) return; // 인증된 사용자 없으면 리턴
    try {
      // users/{uid}/likes/{contentid} 경로의 문서 삭제
      await deleteDoc(doc(dbService, `users/${user.uid}/likes`, contentid));
      // 삭제 후 상태에서도 해당 아이템 제거
      setPlaces((prev) => prev.filter((p) => p.contentid !== contentid));
    } catch (err) {
      console.error("❌ 북마크 삭제 실패", err); // 에러 처리
    }
  };

  // 렌더링할 JSX 반환
  return (
    <div className="p-4">
      {/* 제목 영역 */}
      <h1 className="text-xl font-bold mb-4">❤️ 내가 좋아요한 추천 장소</h1>

      {/* 장소가 없을 때 */}
      {places.length === 0 ? (
        <p className="text-gray-500">좋아요한 장소가 없습니다.</p>
      ) : (
        // 장소가 있을 때: 그리드 레이아웃으로 PlaceCard 및 삭제 버튼 표시
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {places.map((place) => (
            <div
              key={place.contentid}
              className="relative  hover:bg-gray-100 rounded-2xl p-1.5 transition-all duration-200"
            >
              {/* 장소 카드에 likedOverride, countOverride로 좋아요 표시 제어 */}
              <PlaceCard
                place={place}
                likedOverride={true}
                countOverride={place.likeCount}
                hideLikeButton={true} // ✅ 하트버튼 숨기기
              />
              {/* 우상단에 삭제 버튼 */}
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
