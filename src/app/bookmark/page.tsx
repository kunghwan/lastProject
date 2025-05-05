"use client";

import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { authService, dbService } from "@/lib/firebase";
import { Post } from "@/types/post";
import { GoArrowLeft, GoHeart } from "react-icons/go";
import { useRouter } from "next/navigation";

type SortOption = "recent" | "oldest" | "likes";

const BookmarkPage = () => {
  const router = useRouter();
  const handleBack = () => router.back();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortOption>("recent");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(authService, async (user) => {
      if (!user) {
        setPosts([]);
        setLoading(false);
        return;
      }
      try {
        const q = query(
          collection(dbService, "posts"),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const likedPosts: Post[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data() as Post;
          if (data.likes.includes(user.uid)) {
            likedPosts.push({ ...data, id: doc.id });
          }
        });
        setPosts(likedPosts);
      } catch (error) {
        console.error("Error fetching liked posts:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const sortPosts = (posts: Post[], sort: SortOption) => {
    return [...posts].sort((a, b) => {
      console.log("비교 중인 게시물:");
      console.log("a:", a.createdAt, "likes:", a.likes.length);
      console.log("b:", b.createdAt, "likes:", b.likes.length);

      switch (sort) {
        case "recent":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "likes":
          return b.likes.length - a.likes.length;
        default:
          return 0;
      }
    });
  };

  const sortedPosts = useMemo(() => sortPosts(posts, sort), [posts, sort]);
  if (loading) return <div>로딩 중...</div>;

  return (
    <div>
      {/* 헤더 */}
      <div className="flex ml-5 gap-x-2.5 p-5 items-center">
        <button type="button" className="text-3xl" onClick={handleBack}>
          <GoArrowLeft />
        </button>
        <div className="text-xl font-bold">좋아요한 게시물입니다.</div>
      </div>

      {/* 정렬 & 선택 버튼 */}
      <div className="flex justify-between items-center mx-5 mb-5">
        <div className="flex gap-3 ml-3">
          <button
            onClick={() => setSort("recent")}
            className={`text-sm ${
              sort === "recent" ? "font-bold underline" : "text-gray-500"
            }`}
          >
            최신순
          </button>
          <button
            onClick={() => setSort("oldest")}
            className={`text-sm ${
              sort === "oldest" ? "font-bold underline" : "text-gray-500"
            }`}
          >
            오래된순
          </button>
          <button
            onClick={() => setSort("likes")}
            className={`text-sm ${
              sort === "likes" ? "font-bold underline" : "text-gray-500"
            }`}
          >
            좋아요순
          </button>
        </div>
      </div>

      {/* 게시물 목록 */}
      <div className="grid grid-cols-2 gap-x-2 mb-20 lg:grid-cols-3 ml-2.5 mr-2.5">
        {sortedPosts.map((post) => (
          <div key={post.id}>
            {post.imageUrl ? (
              <img
                src={post.imageUrl}
                alt="Post image"
                className="w-full h-100 object-cover rounded-lg mb-2"
              />
            ) : (
              <div className="w-full h-100 border bg-gray-200 flex items-center justify-center rounded-lg mb-2">
                <img src="/image/logo1.png" alt="No image available" />
              </div>
            )}
            <p>{post.content}</p>
            <div className="flex items-center gap-1">
              <p className="hover:scale-105 cursor-pointer p-0.5 text-red-500 items-center">
                <GoHeart />
              </p>
              <span>{post.likes.length}개</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookmarkPage;
