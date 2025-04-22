import { collection, getDocs, query, where } from "firebase/firestore";
import { dbService } from "@/lib/firebase";
import MePage from "./me/page";
import { Post } from "@/types/post";

const ProfilePage = async () => {
  const currentUserUID = "tes1";

  try {
    const postsRef = collection(dbService, "posts");
    const q = query(postsRef, where("uid", "==", currentUserUID));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() } as Post);
    });

    if (posts.length === 0) {
      return (
        <div className="flex justify-center items-center h-screen">
          게시물이 없습니다.
        </div>
      );
    }
  } catch (error) {
    console.error("Firestore 데이터 가져오기 오류:", error);
    return <div>데이터를 불러오는 중 오류가 발생했습니다.</div>;
  }

  return <MePage posts={posts} />;
};

export default ProfilePage;
