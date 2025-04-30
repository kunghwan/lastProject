"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { dbService, FBCollection, authService } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { getUserByUid } from "@/lib/user";
import ProfileLayout from "@/components/ProfileUI/ProfileLayout";
import { Post } from "@/types/post";
import { User as UserType } from "@/types/user";

const MePage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [userData, setUserData] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      authService,
      async (user: User | null) => {
        if (!user) {
          setError("로그인이 필요합니다.");
          setLoading(false);
          return;
        }

        try {
          const matchedUser = await getUserByUid(user.uid);
          if (!matchedUser) {
            setError("해당 유저 정보를 찾을 수 없습니다.");
            setLoading(false);
            return;
          }

          setUserData(matchedUser);

          const postsRef = collection(dbService, FBCollection.POSTS);
          const q = query(postsRef, where("uid", "==", user.uid));
          const querySnapshot = await getDocs(q);

          const fetchedPosts: Post[] = [];
          querySnapshot.forEach((doc) => {
            fetchedPosts.push({ id: doc.id, ...doc.data() } as Post);
          });

          if (fetchedPosts.length === 0) {
            fetchedPosts.push({
              id: "default",
              title: "기본 게시물",
              content: "",
              uid: user.uid,
              userNickname: matchedUser.nickname,
              userProfileImage: matchedUser.imageUrl || "",
              imageUrl: "",
              lo: { latitude: 0, longitude: 0, address: "" },
              likes: [],
              shares: [],
              bookmarked: [],
              isLiked: false,
              createdAt: new Date().toISOString(),
            });
          }

          setPosts(fetchedPosts);
        } catch (error) {
          console.error("유저 데이터 불러오기 실패:", error);
          setError("데이터를 불러오는 중 오류가 발생했습니다.");
        } finally {
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  if (loading) return <h1>로딩 중...</h1>;
  if (error || !userData) return <h1>{error || "유저 데이터 없음"}</h1>;

  // ✅ 여기에서 유저 정보를 userData로 넘겨줍니다
  return <ProfileLayout posts={posts} userData={userData} isMyPage={true} />;
};

export default MePage;
