import { collection, getDocs, query, where } from "firebase/firestore";
import { dbService } from "@/lib/firebase";
import { Post } from "@/types/post";
import ProfileLayout from "@/app/components/ProfileLayout";

interface Props {
  params: { username: string };
}

const UserPage = async ({ params }: Props) => {
  const { username } = params; // URL에서 username 가져오기
  const posts: Post[] = [];

  try {
    // Firestore에서 해당 유저의 게시물 가져오기
    const postsRef = collection(dbService, "posts");
    const q = query(postsRef, where("userNickname", "==", username));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() } as Post);
    });

    // 데이터가 없을 경우 기본값 추가
    if (posts.length === 0) {
      posts.push({
        id: "default",
        uid: "default",
        userNickname: username,
        userProfileImage: defaultImgUrl, // 기본 프로필 이미지
        imageUrl: "",
        content: "게시물이 없습니다.",
        lo: { latitude: 0, longitude: 0, address: "" },
        likes: [],
        shares: [],
        bookmarked: [],
        isLiked: false,
        createdAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("데이터 가져오기 오류:", error);
    return <h1>데이터를 불러오는 중 오류가 발생했습니다.</h1>;
  }

  const isMyPage = username === "user1"; // 현재 로그인한 사용자와 비교
  return <ProfileLayout posts={posts} isMyPage={isMyPage} />;
};

export default UserPage;

const defaultImgUrl =
  "https://i.pinimg.com/1200x/3e/c0/d4/3ec0d48e3332288604e8d48096296f3e.jpg";
