"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { authService } from "@/lib/firebase";
import { useUserByUid } from "@/hooks/useUser";
import ProfileLayout from "@/components/ProfileUI/ProfileLayout";
import { usePostsByUid } from "@/hooks/useAuth";

const MePage = () => {
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(authService, (user) => {
      if (user?.uid) {
        setUid(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  //! 새글작성후 유저가 마이페이지로 돌아오면 새글이 안보임 이슈 강제 새로고침 하기
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        location.reload(); // 새로고침
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const { data: userData, isLoading: userLoading } = useUserByUid(uid || "");
  const { data: posts, isLoading: postLoading } = usePostsByUid(uid || "");

  if (userLoading || postLoading || !userData) return <h1>로딩 중...</h1>;

  return (
    <ProfileLayout posts={posts || []} userData={userData} isMyPage={true} />
  );
};

export default MePage;
