import { useEffect, useState, useCallback } from "react";
import { firebase, dbService } from "@/lib/firebase";
import { AUTH } from "@/contextapi/context";

interface UpPlaceLikeButtonProps {
  contentId: string;
  onLiked?: (newCount: number) => void;
}

const UpPlaceLikeButton = ({ contentId, onLiked }: UpPlaceLikeButtonProps) => {
  const { user } = AUTH.use();
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

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

        const likeCount = placeSnap.data()?.likeCount || 0;
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
  }, [user, contentId]);

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
        // 🔻 좋아요 취소
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
        // 🔺 좋아요 누르기
        const latest = await likeRef.get();
        if (latest.exists) return; // 중복 방지

        batch.set(likeRef, {
          likedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        batch.update(placeRef, {
          likeCount: firebase.firestore.FieldValue.increment(1),
        });
        await batch.commit();

        const newCount = count + 1;
        setLiked(true);
        setCount(newCount);
        if (onLiked) onLiked(newCount);
      }
    } catch (error) {
      console.error("🔥 좋아요 처리 실패", error);
    }
  }, [user, loading, liked, count, contentId, onLiked]);

  if (!user)
    return <p className="text-sm text-gray-500">로그인 후 좋아요 가능</p>;

  return (
    <button
      onClick={toggleLike}
      disabled={loading}
      className={`px-4 py-2 rounded-lg  ${
        liked ? "bg-gray-300 text-black" : "bg-red-500 text-white "
      }`}
    >
      {liked ? "❤️ 좋아요" : "🤍 좋아요"}
    </button>
  );
};

export default UpPlaceLikeButton;
