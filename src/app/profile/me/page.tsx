"use client";
import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { dbService, FBCollection } from "@/lib/firebase";
import { authService } from "@/lib/firebase";

import ProfileLayout from "@/components/ProfileUI/ProfileLayout";

import { Post } from "@/types/post";

const MePage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  // const posts: Post[] = [
  //   {
  //     id: "1",
  //     title: "예제 게시물 제목",
  //     content: "이것은 예제 게시물 내용입니다.",
  //     uid: "example-user-id",
  //     userNickname: "exampleNickname",
  //     userProfileImage: "/images/example-profile.png",
  //     imageUrl: "/images/example-image.png",
  //     lo: { latitude: 37.5665, longitude: 126.978, address: "서울특별시" },
  //     likes: ["user1", "user2"],
  //     shares: [{ count: 1, uid: "user3" }],
  //     bookmarked: ["user4"],
  //     isLiked: false,
  //     createdAt: new Date().toISOString(),
  //   },
  // ];

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      const user = authService.currentUser;
      if (!user) {
        setError("로그인이 필요합니다.");
        setLoading(false);
        return;
      }

      const currentUserUID = user.uid;

      try {
        const postsRef = collection(dbService, FBCollection.POSTS);
        const q = query(postsRef, where("uid", "==", currentUserUID));
        const querySnapshot = await getDocs(q);

        const fetchedPosts: Post[] = [];
        querySnapshot.forEach((doc) => {
          fetchedPosts.push({ id: doc.id, ...doc.data() } as Post);
        });

        // posts가 비었을 경우 기본값 하나 넣기
        if (fetchedPosts.length === 0) {
          fetchedPosts.push({
            id: "default",
            title: "기본 게시물",
            content: "",
            uid: currentUserUID,
            userNickname: user.displayName || "닉네임 없음",
            userProfileImage: user.photoURL || "",
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
        console.error("Firestore 데이터 가져오기 오류:", error);
        setError("데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);
  if (loading) {
    return <h1>로딩 중...</h1>;
  }

  if (error) {
    return <h1>{error}</h1>;
  }

  return <ProfileLayout posts={posts} isMyPage={true} />;
};

export default MePage;
