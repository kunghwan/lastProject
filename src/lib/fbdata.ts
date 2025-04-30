import { collection, getDocs, query, where } from "firebase/firestore";
import { dbService } from "./firebase";
import { Post } from "@/types/post";
import { User } from "../types"; // 또는 "@/types" 경로 설정에 따라 변경

// 🔹 특정 uid를 가진 유저의 모든 게시물
export const getPostsByUserUid = async (uid: string): Promise<Post[]> => {
  try {
    const postsRef = collection(dbService, "posts");
    const q = query(postsRef, where("uid", "==", uid));
    const snapshot = await getDocs(q);

    const posts: Post[] = [];
    snapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() } as Post);
    });

    return posts;
  } catch (error) {
    console.error("유저 게시물 불러오기 실패:", error);
    return [];
  }
};

// 🔹 닉네임으로 유저 검색 (중복 닉네임 가능성 고려)
export const getUsersByNickname = async (nickname: string): Promise<User[]> => {
  try {
    const usersRef = collection(dbService, "users");
    const q = query(usersRef, where("nickname", "==", nickname));
    const snapshot = await getDocs(q);

    const users: User[] = [];
    snapshot.forEach((doc) => {
      users.push({ uid: doc.id, ...doc.data() } as User);
    });

    return users;
  } catch (error) {
    console.error("닉네임으로 유저 검색 실패:", error);
    return [];
  }
};
