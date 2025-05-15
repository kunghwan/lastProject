"use client";

import { useUsersByNickname } from "@/hooks/useUser";
import { usePostsByNickname } from "@/hooks/useAuth";
import ProfileLayout from "@/components/profile/ProfileLayout";

const ClientPage = ({ username }: { username: string }) => {
  const { data: users, isLoading: userLoading } = useUsersByNickname(username);
  const { data: posts, isLoading: postLoading } = usePostsByNickname(username);
  const userData = users?.[0];

  if (userLoading || postLoading) return <h1>로딩 중...</h1>;
  if (!userData) return <h1>해당 유저 없음</h1>;

  return (
    <ProfileLayout
      posts={posts || []}
      userData={{
        uid: userData.uid,
        nickname: userData.nickname,
        profileImageUrl: userData.profileImageUrl,
        bio: userData.bio,
      }}
      isMyPage={false}
    />
  );
};

export default ClientPage;
