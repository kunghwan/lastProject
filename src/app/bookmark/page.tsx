"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  setDoc,
} from "firebase/firestore";
import { authService, dbService } from "@/lib/firebase";
import { Post } from "@/types/post";
import { GoHeart } from "react-icons/go";
import { useRouter } from "next/navigation";
import UpPlaceBookMark from "@/components/upplace/UpPlaceBookMark";
import LikeButton from "@/components/post/LikeButton";

const BookmarkPage = () => {
  const router = useRouter();
  const handleBack = () => router.back();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortOption>("recent");

  // 유저가 좋아요한 게시물 가져오기
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

  type SortOption = "recent" | "oldest" | "likes";

  const sortPosts = (posts: Post[], sort: SortOption) => {
    switch (sort) {
      case "recent":
        return [...posts].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "oldest":
        // 최신순으로 정렬한 다음 뒤집기
        return [...posts]
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .reverse();
      case "likes":
        return [...posts].sort((a, b) => b.likes.length - a.likes.length);
      default:
        return posts;
    }
  };

  const toggleLike = async (postId: string) => {
    const user = authService.currentUser;
    if (!user) return;

    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id !== postId) return post;

        const alreadyLiked = post.likes.includes(user.uid);
        const updatedLikes = alreadyLiked
          ? post.likes.filter((uid) => uid !== user.uid) // 좋아요 취소
          : [...post.likes, user.uid]; // 좋아요 추가

        // Firestore에 업데이트
        setDoc(doc(dbService, "posts", postId), {
          likes: updatedLikes,
        });

        return {
          ...post,
          likes: updatedLikes,
        };
      })
    );
  };

  if (loading) return <div>로딩 중...</div>;

  const sortedPosts = sortPosts(posts, sort);

  return (
    <div className="flex flex-col mx-auto p-2 lg:w-3/4 w-full">
      {/* 제목 + 뒤로가기 버튼 */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">❤️ 내가 좋아요한 추천 장소</h1>
        <button
          onClick={handleBack}
          className="text-sm text-indigo-600 dark:text-indigo-200 hover:underline hover:scale-105 transition-transform duration-200"
        >
          ← 이전 페이지
        </button>
      </div>
      <div className="flex gap-2 mb-4">
        {[
          { label: "최신순", value: "recent" },
          { label: "오래된순", value: "oldest" },
          { label: "좋아요순", value: "likes" },
        ].map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setSort(value as SortOption)}
            className={`px-4 py-1.5 rounded-full border text-sm font-medium shadow  transition-all duration-200 hover:scale-105 
        ${
          sort === value
            ? "bg-blue-500 text-white border-blue-500 dark:text-gray-200"
            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100 dark:bg-gray-300"
        }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-x-2 mb-20 lg:grid-cols-3 p-1.5 m-1 transition-all">
        {sortedPosts.map((post) => {
          const image =
            Array.isArray(post.imageUrl) && post.imageUrl.length > 0
              ? post.imageUrl[0]
              : typeof post.imageUrl === "string"
              ? post.imageUrl
              : "/image/logo1.png";

          return (
            <div
              key={post.id}
              className=" hover:bg-gray-100 dark:hover:bg-gray-600 rounded-2xl p-1.5"
            >
              <div className="m-1.5 flex items-center gap-1.5">
                <img
                  src={post.userProfileImage}
                  alt="userProfileImage"
                  className="w-8 h-8 rounded-2xl"
                />
                <div className="font-bold">{post.userNickname}</div>
              </div>
              {post.imageUrl && (
                <img
                  src={image}
                  alt="Post image"
                  className="w-full h-100 object-cover mb-2 transition-all duration-500 ease-in-out transform hover:scale-[1.01]"
                />
              )}
              <p className="truncate">{post.content}</p>
              <div
                onClick={() => toggleLike(post.id!)}
                className="flex items-center mb-2.5"
              >
                <LikeButton postId={post.id} likedBy={post.likes} />{" "}
              </div>
            </div>
          );
        })}
      </div>

      {/* 추천 장소 섹션 */}
      <div className="col-span-2 lg:col-span-3">
        <UpPlaceBookMark />
      </div>
    </div>
  );
};

export default BookmarkPage;
