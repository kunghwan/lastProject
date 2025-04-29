import { collection, getDocs, query, where } from "firebase/firestore";
import { dbService, FBCollection } from "@/lib/firebase";
import { User } from "@/types/user"; // User 타입 정의

export const fetchUsers = async (username: string): Promise<User[]> => {
  try {
    const usersRef = collection(dbService, FBCollection.USERS); // "users" 컬렉션 참조
    const q = query(usersRef, where("nickname", "==", username)); // username으로 필터링
    const querySnapshot = await getDocs(q);

    const users: User[] = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() } as User); // 데이터와 문서 ID를 병합
    });

    return users; // User 배열 반환
  } catch (error) {
    console.error("Error fetching users:", error);
    return []; // 에러 발생 시 빈 배열 반환
  }
};
