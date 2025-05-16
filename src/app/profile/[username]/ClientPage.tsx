"use client";

import { useUsersByNickname } from "@/hooks/useUser";
import { usePostsByNickname } from "@/hooks/useAuth";
import ProfileLayout from "@/components/profile/ProfileLayout";
import TopButton from "@/components/upplace/TopButton";
import Loaiding from "@/components/Loading";
import Link from "next/link";

const ClientPage = ({ username }: { username: string }) => {
  const { data: users, isLoading: userLoading } = useUsersByNickname(username);
  const { data: posts, isLoading: postLoading } = usePostsByNickname(username);
  const userData = users?.[0];

  if (userLoading || postLoading)
    return (
      <div>
        <Loaiding message="해당 유저의 페이지로 이동중입니다..." />
      </div>
    );
  if (!userData)
    return (
      <Link
        href={"/"}
        className="flex item-center justify-center hover:scale-105 cursor-pointer p-10"
      >
        없는 유저입니다. 홈으로 가시겠습니까?
      </Link>
    );

  return (
    <>
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
      <TopButton />
    </>
  );
};

export default ClientPage;
