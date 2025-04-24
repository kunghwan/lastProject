import { collection, getDocs, query, where } from "firebase/firestore";
import { dbService } from "@/lib/firebase";
import { Post } from "@/types/post";
import ProfileLayout from "@/components/ProfileUI/ProfileLayout";

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
        title: "title 없음",
        id: username === "user1" ? "my-default" : "default", // 로그인한 유저와 다른 유저 구분
        uid: username === "user1" ? "my-uid" : "default-uid", // 로그인한 유저와 다른 유저 구분
        userNickname: username,
        userProfileImage: username === "user1" ? "/images/my-profile.png" : "", // 기본 프로필 이미지
        imageUrl: "",
        content:
          username === "user1" ? "내 게시물이 없습니다." : "게시물이 없습니다.",
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

  // 로그인한 유저와 현재 페이지 유저 비교
  const isMyPage = username === "user1"; // "user1"은 로그인한 유저의 아이디로 가정

  // 변수 처리
  const userId = isMyPage ? "my-uid" : posts[0]?.uid || "unknown-uid";
  const userNickname = isMyPage
    ? "내 닉네임"
    : posts[0]?.userNickname || username;
  const userProfileImage = isMyPage
    ? "/images/my-profile.png"
    : posts[0]?.userProfileImage || "/images/default-profile.png";

  return (
    <ProfileLayout
      posts={posts}
      isMyPage={isMyPage}
      userId={userId}
      userNickname={userNickname}
      userProfileImage={userProfileImage}
    />
  );
};

export default UserPage;
