"use client";
import { useQuery } from "react-query";
import { collection, getDocs, query, where } from "firebase/firestore";
import { dbService } from "@/lib/firebase";
import { Post } from "@/types/post";
import ProfileLayout from "@/components/ProfileUI/ProfileLayout";

interface Props {
  params: { username: string };
}

const fetchPostsAndUserId = async (username: string) => {
  const postsRef = collection(dbService, "posts");
  const q = query(postsRef, where("userNickname", "==", username));
  const querySnapshot = await getDocs(q);

  const fetchedPosts: Post[] = [];
  let fetchedUserId: string | null = null;

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    fetchedPosts.push({ id: doc.id, ...data } as Post);
  });

  // Firestore에서 users 컬렉션에서 nickname과 uid 가져오기
  const usersRef = collection(dbService, "users");
  const userQuery = query(usersRef, where("nickname", "==", username));
  const userSnapshot = await getDocs(userQuery);

  userSnapshot.forEach((doc) => {
    const userData = doc.data();
    const uid = userData.uid || null; // uid 가져오기
    if (uid) {
      fetchedUserId = uid; // 해당 유저의 uid 저장
    }
  });

  // 데이터가 없을 경우 기본값 추가
  if (fetchedPosts.length === 0) {
    fetchedPosts.push({
      title: "title 없음",
      id: username === "user1" ? "my-default" : "default",
      uid: fetchedUserId || "default",
      userNickname: username,
      userProfileImage: username === "user1" ? "/images/my-profile.png" : "",
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

  return { posts: fetchedPosts, userId: fetchedUserId };
};

const UserPage = ({ params }: Props) => {
  const { username } = params;

  const { data, isLoading, isError } = useQuery(
    ["posts", username],
    () => fetchPostsAndUserId(username),
    {
      staleTime: 1000 * 60 * 5, // 5분 동안 데이터 캐싱
    }
  );

  if (isLoading) {
    return <h1>로딩 중...</h1>;
  }

  if (isError) {
    return <h1>데이터를 불러오는 중 오류가 발생했습니다.</h1>;
  }

  const { posts, userId } = data || { posts: [], userId: null };

  // 로그인한 유저와 현재 페이지 유저 비교
  const isMyPage = userId === "userId"; // "my-uid"는 로그인한 유저의 아이디로 가정

  // 변수 처리
  const userNickname = isMyPage
    ? "내 닉네임"
    : posts[0]?.userNickname || username;
  const userProfileImage = isMyPage
    ? "/images/my-profile.png"
    : posts[0]?.userProfileImage || "/images/default-profile.png";

  // 팔로우 버튼 클릭 핸들러
  const handleFollow = () => {
    if (userId) {
      console.log(`팔로우할 유저의 UID: ${userId}`);
    } else {
      console.log("유저 UID를 가져올 수 없습니다.");
    }
  };

  return (
    <ProfileLayout
      key={posts[0]?.id || "default-key"}
      tags={[
        {
          id: "1",
          name: "대전시",
          onTag() {
            console.log("태그1 클릭됨");
          },
        },
        {
          id: "2",
          name: "20대",
          onTag() {
            console.log("태그1 클릭됨");
          },
        },
      ]}
      posts={posts}
      isMyPage={isMyPage}
      userId={userId || `{!users.uid}`}
      userNickname={userNickname || "{!users.nickname}"}
      userProfileImage={userProfileImage || "/images/default-profile.png"}
    >
      {!isMyPage && (
        <button onClick={handleFollow} style={{ marginTop: "20px" }}>
          팔로우
        </button>
      )}
    </ProfileLayout>
  );
};

export default UserPage;
