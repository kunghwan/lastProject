import { collection, getDocs, query, where } from "firebase/firestore";
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
