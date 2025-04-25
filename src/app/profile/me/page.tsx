"use client";
import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { dbService, FBCollection } from "@/lib/firebase";

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
      const currentUserUID = "tes1"; // 현재 로그인한 사용자의 UID (예제)

      try {
        const postsRef = collection(dbService, FBCollection.POSTS);
        const q = query(postsRef, where("uid", "==", currentUserUID));
        const querySnapshot = await getDocs(q);

        const fetchedPosts: Post[] = [];
        querySnapshot.forEach((doc) => {
          fetchedPosts.push({ id: doc.id, ...doc.data() } as Post);
        });

        setPosts(fetchedPosts);

        if (fetchedPosts.length === 0) {
          console.log("게시물이 없습니다.");
        }
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
