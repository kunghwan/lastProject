"use client";
import { useQuery } from "@tanstack/react-query";
import { fetchUsers } from "@/lib/user"; // fetchUsers 함수
import { fetchPostsAndUserId } from "@/lib/user"; // fetchPostsAndUserId 함수
import { Post, Tag } from "@/types/post";
import ProfileLayout from "@/components/ProfileUI/ProfileLayout";

interface Props {
  params: { username: string };
}

const UserPage = ({ params }: Props) => {
  const { username } = params;

  // React Query를 사용하여 Firestore에서 posts 데이터를 가져옴
  const {
    data: postData,
    isLoading: isPostsLoading,
    isError: isPostsError,
  } = useQuery({
    queryKey: ["posts", username],
    queryFn: () => fetchPostsAndUserId(username),
    staleTime: 1000 * 60 * 5, // 데이터 캐싱 시간: 5분
  });

  // React Query를 사용하여 Firestore에서 users 데이터를 가져옴
  const {
    data: userData,
    isLoading: isUsersLoading,
    isError: isUsersError,
  } = useQuery({
    queryKey: ["users", username],
    queryFn: () => fetchUsers(username),
    staleTime: 1000 * 60 * 5, // 데이터 캐싱 시간: 5분
  });

  if (isPostsLoading || isUsersLoading) {
    return <h1>로딩 중...</h1>;
  }

  if (isPostsError || isUsersError) {
    return <h1>데이터를 불러오는 중 오류가 발생했습니다.</h1>;
  }

  const posts = postData?.posts || [];
  const userId = postData?.userId || null;
  const user = userData?.[0]; // username으로 가져온 첫 번째 사용자

  // 로그인한 유저와 현재 페이지 유저 비교
  const currentUserId = "my-uid"; // 실제 로그인한 사용자의 UID를 가져와야 함
  const isMyPage = userId === currentUserId;

  // 변수 처리
  const userNickname = user?.nickname || username;
  const userProfileImage =
    user?.profileImageUrl || "/images/default-profile.png";

  // 팔로우 버튼 클릭 핸들러
  const handleFollow = () => {
    if (userId) {
      console.log(`팔로우할 유저의 UID: ${userId}`);
    } else {
      console.log("유저 UID를 가져올 수 없습니다.");
    }
  };

  const tags: Tag[] = [
    {
      id: "1",
      name: "대전시",
      onTag: () => console.log("태그1 클릭됨"),
    },
    {
      id: "2",
      name: "20대",
      onTag: () => console.log("태그2 클릭됨"),
    },
  ];

  return (
    <ProfileLayout
      key={posts[0]?.id || "default-key"} // 기본값 추가
      tags={tags}
      posts={posts}
      isMyPage={isMyPage}
      userId={userId || ""}
      userNickname={userNickname}
      userProfileImage={userProfileImage}
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
