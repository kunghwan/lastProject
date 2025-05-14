import {
  collection,
  getDocs,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { dbService } from "@/lib/firebase";
import { Post } from "@/types/post";

// 특정 uid를 가진 유저의 posts 전체를 가져오는 함수
export const fetchPosts = async (uid: string): Promise<Post[]> => {
  try {
    const postsRef = collection(dbService, "posts");
    const q = query(postsRef, where("uid", "==", uid));
    const querySnapshot = await getDocs(q);

    const posts: Post[] = [];
    querySnapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() } as Post);
    });

    return posts;
  } catch (error) {
    console.error("포스트 불러오기 실패:", error);
    return [];
  }
};

export function getTimeAgo(createdAt: string | Timestamp): string {
  let createdDate: Date;

  if (typeof createdAt === "string") {
    createdDate = new Date(createdAt);
  } else if (createdAt instanceof Timestamp) {
    createdDate = createdAt.toDate();
  } else {
    return "알 수 없음";
  }

  const now = new Date();
  const diff = now.getTime() - createdDate.getTime();

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(days / 7);

  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;
  return `${weeks}주 전`;
}
