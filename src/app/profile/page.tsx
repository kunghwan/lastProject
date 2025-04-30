"use client";

import { useEffect, useState } from "react";
import { authService } from "@/lib/firebase";
import { useUserByUid } from "@/hooks/useUser";
import ProfileLayout from "@/components/ProfileUI/ProfileLayout";
import { User } from "@/types";
import { Post } from "@/types/post";
import { usePostsByUid } from "@/hooks/useAuth";

const MePage = () => {
  const [uid, setUid] = useState<string | null>(null);

  // 로그인 유저 UID 가져오기
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      if (user?.uid) setUid(user.uid);
    });
    return () => unsubscribe();
  }, []);

  const { data: userData, isLoading: userLoading } = useUserByUid(uid || "");
  const { data: posts, isLoading: postLoading } = usePostsByUid(uid || "");

  if (userLoading || postLoading) return <h1>로딩 중...</h1>;
  if (!userData) return <h1>유저 정보를 찾을 수 없습니다</h1>;

  return (
    <ProfileLayout
      userData={userData as User}
      posts={posts || []}
      isMyPage={true}
    />
  );
};

export default MePage;
