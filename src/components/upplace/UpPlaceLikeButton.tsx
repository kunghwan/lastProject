import { useEffect, useState, useCallback } from "react";
import { firebase, dbService } from "@/lib/firebase";
import { AUTH } from "@/contextapi/context";

interface UpPlaceLikeButtonProps {
  contentId: string;
  onLiked?: (newCount: number) => void;
  placeInfo?: {
    title: string;
    addr1: string;
    imageUrl: string;
  };
  likedOverride?: boolean;
  countOverride?: number;
}

const UpPlaceLikeButton = ({
  contentId,
  onLiked,
  placeInfo,
  likedOverride,
  countOverride,
}: UpPlaceLikeButtonProps) => {
  const { user } = AUTH.use();

  const [liked, setLiked] = useState<boolean>(likedOverride ?? false);
  const [count, setCount] = useState<number>(countOverride ?? 0);
  const [loading, setLoading] = useState(true);

  // ✅ 초기 데이터 로딩 (Override 없을 때만 실행)
  useEffect(() => {
    if (!user || likedOverride !== undefined || countOverride !== undefined) {
      setLoading(false);
      return;
    }

    const loadLikeData = async () => {
      try {
        const likeRef = dbService
          .collection("users")
          .doc(user.uid)
          .collection("likes")
          .doc(`places_${contentId}`);

        const placeRef = dbService.collection("places").doc(contentId);

        const [likeSnap, placeSnap] = await Promise.all([
          likeRef.get(),
          placeRef.get(),
        ]);

        const likeCount = placeSnap.exists
          ? placeSnap.data()?.likeCount || 0
          : 0;

        setLiked(likeSnap.exists);
        setCount(likeCount);

        if (onLiked) onLiked(likeCount);
      } catch (error) {
        console.error("🔥 좋아요 데이터 로딩 실패", error);
      } finally {
        setLoading(false);
      }
    };

    loadLikeData();
  }, [user, contentId, likedOverride, countOverride]);

  const toggleLike = useCallback(async () => {
    if (!user || loading) return;

    try {
      const likeRef = dbService
        .collection("users")
        .doc(user.uid)
        .collection("likes")
        .doc(`places_${contentId}`);

      const placeRef = dbService.collection("places").doc(contentId);
      const batch = dbService.batch();

      if (liked) {
        // ❌ 좋아요 취소
        batch.delete(likeRef);
        batch.update(placeRef, {
          likeCount: firebase.firestore.FieldValue.increment(-1),
        });
        await batch.commit();

        const newCount = Math.max(0, count - 1);
        setLiked(false);
        setCount(newCount);
        if (onLiked) onLiked(newCount);
      } else {
        // ❤️ 좋아요 누르기
        const [latest, placeSnap] = await Promise.all([
          likeRef.get(),
          placeRef.get(),
        ]);
        if (latest.exists) return;

        batch.set(likeRef, {
          likedAt: firebase.firestore.FieldValue.serverTimestamp(),
          title: placeInfo?.title ?? "제목 없음",
          addr1: placeInfo?.addr1 ?? "주소 없음",
          imageUrl: placeInfo?.imageUrl ?? "",
          likeCount: count + 1,
        });

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

  if (!user)
    return <p className="text-sm text-gray-500">로그인 후 좋아요 가능</p>;

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
