import { useEffect, useState, useCallback } from "react";
import { firebase, dbService } from "@/lib/firebase"; // Firebase 관련 객체 가져오기
import { AUTH } from "@/contextapi/context"; // 사용자 인증 context

// ✅ 좋아요 버튼 컴포넌트
const UpPlaceLikeButton = ({
  contentId,
  onLiked,
  placeInfo,
  likedOverride,
  countOverride,
}: UpPlaceLikeButtonProps) => {
  const { user } = AUTH.use(); // 인증된 사용자 정보 가져오기

  const [liked, setLiked] = useState<boolean>(likedOverride ?? false); // 좋아요 여부 상태
  const [count, setCount] = useState<number>(countOverride ?? 0); // 좋아요 수 상태
  const [loading, setLoading] = useState(true); // 로딩 여부 상태

  // ✅ 컴포넌트 마운트 시 초기 데이터 로딩 (override 없을 때만 실행)
  useEffect(() => {
    if (!user || likedOverride !== undefined || countOverride !== undefined) {
      setLoading(false); // 사용자 없거나 override가 있으면 그냥 로딩 false 처리
      return;
    }

    const loadLikeData = async () => {
      try {
        // 사용자 좋아요 정보 문서 참조
        const likeRef = dbService
          .collection("users")
          .doc(user.uid)
          .collection("likes")
          .doc(`places_${contentId}`);

        // 장소 문서 참조
        const placeRef = dbService.collection("places").doc(contentId);

        // 동시에 문서 가져오기
        const [likeSnap, placeSnap] = await Promise.all([
          likeRef.get(),
          placeRef.get(),
        ]);

        const likeCount = placeSnap.exists
          ? placeSnap.data()?.likeCount || 0
          : 0;

        setLiked(likeSnap.exists); // 좋아요했는지 여부 설정
        setCount(likeCount); // 좋아요 수 설정

        if (onLiked) onLiked(likeCount); // 부모에 전달
      } catch (error) {
        console.error("🔥 좋아요 데이터 로딩 실패", error);
      } finally {
        setLoading(false);
      }
    };

    loadLikeData(); // 실행
  }, [user, contentId, likedOverride, countOverride]);

  // ✅ 좋아요 토글 함수
  const toggleLike = useCallback(async () => {
    if (!user || loading) return; // 로그인 안 했거나 로딩 중이면 동작 X

    try {
      const likeRef = dbService
        .collection("users")
        .doc(user.uid)
        .collection("likes")
        .doc(`places_${contentId}`);

      const placeRef = dbService.collection("places").doc(contentId);

      // ✅ Firestore batch 처리 시작 (원자적 처리)
      const batch = dbService.batch();

      if (liked) {
        // ❌ 좋아요 취소 시
        batch.delete(likeRef); // 유저의 likes에서 제거
        batch.update(placeRef, {
          likeCount: firebase.firestore.FieldValue.increment(-1), // 좋아요 수 -1
        });
        await batch.commit();

        const newCount = Math.max(0, count - 1); // 음수 방지
        setLiked(false);
        setCount(newCount);
        if (onLiked) onLiked(newCount);
      } else {
        // ❤️ 좋아요 누르기
        const [latest, placeSnap] = await Promise.all([
          likeRef.get(),
          placeRef.get(),
        ]);
        if (latest.exists) return; // 이미 좋아요 누른 경우 중복 방지

        // 좋아요 정보 생성
        batch.set(likeRef, {
          likedAt: firebase.firestore.FieldValue.serverTimestamp(), // 타임스탬프
          title: placeInfo?.title ?? "제목 없음",
          addr1: placeInfo?.addr1 ?? "주소 없음",
          imageUrl: placeInfo?.imageUrl ?? "",
          likeCount: count + 1, // 문서 내부 정보 (Firestore용, UI용 아님)
        });

        // 장소 문서가 없으면 생성, 있으면 업데이트
        if (!placeSnap.exists) {
          batch.set(placeRef, {
            likeCount: 1,
            title: placeInfo?.title ?? "",
            addr1: placeInfo?.addr1 ?? "",
            imageUrl: placeInfo?.imageUrl ?? "",
          });
        } else {
          batch.update(placeRef, {
            likeCount: firebase.firestore.FieldValue.increment(1),
          });
        }

        await batch.commit();

        const newCount = count + 1;
        setLiked(true);
        setCount(newCount);
        if (onLiked) onLiked(newCount);
      }
    } catch (error) {
      console.error("🔥 좋아요 처리 실패", error);
    }
  }, [user, loading, liked, count, contentId, onLiked, placeInfo]);

  // ✅ 로그인 안 한 경우 메시지 출력
  if (!user)
    return <p className="text-sm text-gray-500">로그인 후 좋아요 가능</p>;

  // ✅ 좋아요 버튼 렌더링
  return (
    <button
      onClick={toggleLike}
      disabled={loading}
      className={`px-4 py-2 rounded-lg ${
        liked ? "bg-gray-300 text-black" : "bg-red-500 text-white"
      }`}
    >
      {liked ? "❤️ " : "🤍 "}
    </button>
  );
};

export default UpPlaceLikeButton;
