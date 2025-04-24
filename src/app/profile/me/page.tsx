import { collection, getDocs, query, where } from "firebase/firestore";
import { dbService, FBCollection } from "@/lib/firebase";

import ProfileLayout from "@/components/ProfileUI/ProfileLayout";

import BodyLayout from "@/components/BodyLayout";

import { Post } from "@/types/post";

const MePage = async () => {
  const currentUserUID = "tes1"; // 현재 로그인한 사용자의 UID (예제)
  const posts: Post[] = [];

  try {
    // Firestore에서 현재 사용자의 게시물 가져오기
    const postsRef = collection(dbService, FBCollection.POSTS);
    const q = query(postsRef, where("uid", "==", currentUserUID));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() } as Post);
    });

    // 데이터가 없을 경우 처리
    if (posts.length === 0) {
      console.log("게시물이 없습니다.");
    }
  } catch (error) {
    console.error("Firestore 데이터 가져오기 오류:", error);
  }

  return <BodyLayout posts={posts} isMyPage={true} />;
};

export default MePage;
