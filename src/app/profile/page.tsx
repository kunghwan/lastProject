// page.tsx 는 무조건 태그 또는 nulll을 return해야함
// page.tsx는 무조건 1개의 defauitlt export를 가져야함
import { redirect } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { authService, dbService, FBCollection } from "@/lib/firebase";
import { useCallback } from "react";

export const useGetUserNickname = () => {
  return useCallback(async (): Promise<string | null> => {
    const user = authService.currentUser; // 현재 로그인한 유저 정보 가져오기
    if (!user) return null; // 로그인하지 않은 경우 null 반환

    try {
      const userDocRef = doc(dbService, FBCollection.USERS, user.uid); // Firestore에서 유저 문서 참조
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData.nickname || null; // 닉네임 반환
      } else {
        console.error("유저 문서가 존재하지 않습니다.");
        return null;
      }
    } catch (error) {
      console.error("유저 닉네임 가져오기 오류:", error);
      return null;
    }
  }, []);
};

// 특정 uid를 가진 다른 유저의 정보를 가져오는 함수 (새로운 함수)
export const getOtherUserInfo = async (
  uid: string
): Promise<{ nickname: string; email: string } | null> => {
  try {
    const userDocRef = doc(dbService, FBCollection.USERS, uid); // Firestore에서 유저 문서 참조
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        nickname: userData.nickname || "닉네임 없음",
        email: userData.email || "이메일 없음",
      }; // 닉네임과 이메일 반환
    } else {
      console.error("유저 문서가 존재하지 않습니다.");
      return null;
    }
  } catch (error) {
    console.error("다른 유저 정보 가져오기 오류:", error);
    throw new Error("다른 유저 정보를 가져오는 중 오류가 발생했습니다.");
  }
};

const ProfilePage = () => {
  redirect("/profile/me"); // /profile 경로를 /profile/me로 리다이렉트
};

export default ProfilePage;
