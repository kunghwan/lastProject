"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { authService } from "@/lib/firebase";
import { useUserByUid } from "@/hooks/useUser";
// import ProfileLayout from "@/components/profileUI/ProfileLayout";
import { usePostsByUid } from "@/hooks/useAuth";
import ProfileLayout from "@/components/profile/ProfileLayout";
import TopButton from "@/components/upplace/TopButton";

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

  const { data: userData, isLoading: userLoading } = useUserByUid(uid || "");
  const { data: posts, isLoading: postLoading } = usePostsByUid(uid || "");

  if (userLoading || postLoading || !userData) return <h1>로딩 중...</h1>;

  return (
    <>
      <ProfileLayout posts={posts || []} userData={userData} isMyPage={true} />
      <TopButton />
    </>
  );
};

export default MePage;
