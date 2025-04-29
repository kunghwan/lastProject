import { collection, getDocs } from "firebase/firestore";
import { dbService, FBCollection } from "@/lib/firebase";
import { Post } from "@/types/post"; // Post 타입 정의

export const fetchPosts = async (): Promise<Post[]> => {
  try {
    const postsRef = collection(dbService, FBCollection.POSTS); // "posts" 컬렉션 참조
    const querySnapshot = await getDocs(postsRef);

    const posts: Post[] = [];
    querySnapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() } as Post); // 데이터와 문서 ID를 병합
    });

    return posts; // Post 배열 반환
  } catch (error) {
    console.error("Error fetching posts:", error);
    return []; // 에러 발생 시 빈 배열 반환
  }
};
