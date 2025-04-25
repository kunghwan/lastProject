import { collection, getDocs, query, where } from "firebase/firestore";
import { dbService, FBCollection } from "@/lib/firebase";

export const getUserByUsername = async (
  username: string
): Promise<string | null> => {
  try {
    const usersRef = collection(dbService, FBCollection.USERS); // Firestore에서 users 컬렉션 참조
    const userQuery = query(usersRef, where("username", "==", username)); // username으로 검색
    const querySnapshot = await getDocs(userQuery);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0]; // 첫 번째 결과 가져오기
      return userDoc.id; // 문서 ID를 uid로 반환
    } else {
      console.error("해당 username을 가진 유저가 없습니다.");
      return null;
    }
  } catch (error) {
    console.error("유저 정보 가져오기 오류:", error);
    return null;
  }
};
