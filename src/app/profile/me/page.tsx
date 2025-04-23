import { collection, getDocs, query, where } from "firebase/firestore";
import { dbService, FBCollection } from "@/lib/firebase";
import ProfileLayout from "@/app/components/ProfileLayout";
import { Post } from "@/types/post";

const MePage = async () => {
  const currentUserUID = "tes1"; // 현재 로그인한 사용자의 UID (예제)
  const posts: Post[] = [];

  try {
    // Firestore에서 현재 사용자의 게시물 가져오기
    const postsRef = collection(dbService, FBCollection.POSTS); // FBCollection.POSTS 사용
    const q = query(postsRef, where("uid", "==", currentUserUID));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() } as Post);
    });

    // 데이터가 없을 경우 처리
    if (posts.length === 0) {
      return (
        <div className="flex justify-center items-center h-screen">
          게시물이 없습니다.
        </div>
      );
    }
  } catch (error) {
    console.error("Firestore 데이터 가져오기 오류:", error);
    return (
      <div className="flex justify-center items-center h-screen">
        데이터를 불러오는 중 오류가 발생했습니다.
      </div>
    );
  }

  return <ProfileLayout posts={posts} isMyPage={true} />;
};

export default MePage;
{
  /* <button className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-30 text-gray-900 text-sm font-bold rounded-full opacity-0 hover:opacity-50 transition-opacity">
수정하기
</button> */
}
