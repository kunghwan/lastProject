"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
} from "firebase/firestore";
import { authService, dbService } from "@/lib/firebase";
import { Post } from "@/types/post";
import { useRouter } from "next/navigation";
import UpPlaceBookMark from "@/components/upplace/UpPlaceBookMark";
import LikeButton from "@/components/post/LikeButton";

type SortOption = "recent" | "oldest" | "likes";

const BookmarkPage = () => {
  const router = useRouter();
  const handleBack = () => router.back();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortOption>("recent");

  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [modalImages, setModalImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

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
        const snapshot = await getDocs(q);

        const likedPosts: Post[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Post;
          if (data.likes.includes(user.uid)) {
            likedPosts.push({ ...data, id: docSnap.id });
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

  const sortedPosts = useMemo(() => {
    switch (sort) {
      case "recent":
        return [...posts].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "oldest":
        return [...posts].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case "likes":
        return [...posts].sort((a, b) => b.likes.length - a.likes.length);
      default:
        return posts;
    }
  }, [posts, sort]);

  const toggleLike = async (postId: string) => {
    const user = authService.currentUser;
    if (!user) return;

    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;

        const currentLikes = Array.isArray(post.likes) ? post.likes : [];

        const alreadyLiked = currentLikes.includes(user.uid);
        const updatedLikes = alreadyLiked
          ? currentLikes.filter((uid) => uid !== user.uid)
          : [...currentLikes, user.uid];

        updateDoc(doc(dbService, "posts", postId), { likes: updatedLikes });

        return { ...post, likes: updatedLikes };
      })
    );
  };

  const handleOpenPost = useCallback((post: Post) => {
    const images = Array.isArray(post.imgs)
      ? post.imgs.filter((img): img is string => typeof img === "string")
      : [];

    setSelectedPost(post);
    setModalImages(images);
    setCurrentIndex(0);
  }, []);

  const handlePrev = () => {
    if (modalImages.length === 0) return;
    setCurrentIndex((prev) => (prev === 0 ? modalImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (modalImages.length === 0) return;
    setCurrentIndex((prev) => (prev === modalImages.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedPost(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (loading) return <div>로딩 중...</div>;

  return (
    <div className="flex flex-col mx-auto p-2 lg:w-3/4 w-full ">
      <div className="flex items-center justify-between mb-4">
        <h1 className="sm:text-xl font-bold">❤️ 내가 좋아요한 게시글</h1>
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
            className={`px-4 py-1.5 rounded-full border text-sm font-medium shadow transition-all duration-200 hover:scale-105 ${
              sort === value
                ? "bg-blue-500 text-white border-blue-500 dark:text-gray-200"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100 dark:bg-gray-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-2 gap-y-4 mb-20 p-1.5 m-1 w-full max-w-screen-lg mx-auto transition-all">
        {sortedPosts.map((post) => {
          const image =
            typeof post.imageUrl === "string"
              ? post.imageUrl
              : Array.isArray(post.imageUrl)
              ? post.imageUrl[0]
              : "/image/logo1.png";

          return (
            <div
              key={post.id}
              onClick={() => handleOpenPost(post)}
              className="hover:bg-gray-100 dark:hover:bg-gray-600 rounded-2xl p-1.5 cursor-pointer relative"
            >
              <div className="m-1.5 flex items-center gap-1.5">
                <img
                  src={post.userProfileImage}
                  alt="userProfileImage"
                  className="w-8 h-8 rounded-2xl"
                />
                <div className="font-bold">{post.userNickname}</div>
              </div>

              <div className="relative">
                <img
                  src={image}
                  alt="Post image"
                  className="w-full h-64 object-cover mb-2 transition-all duration-500 ease-in-out transform hover:scale-[1.01] rounded-xl"
                />
                {Array.isArray(post.imgs) && post.imgs.length > 1 && (
                  <div className="absolute top-2 right-2 bg-gray-800 opacity-80 text-white text-xs p-1.5 rounded-full">
                    +{post.imgs.length}
                  </div>
                )}
              </div>

              <p className="truncate">{post.content}</p>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLike(post.id!);
                }}
                className="flex items-center mb-2.5"
              >
                <LikeButton
                  postId={post.uid}
                  likedBy={post.likes}
                  postOwnerId={post.uid}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="col-span-2 lg:col-span-3 pb-20">
        <UpPlaceBookMark />
      </div>

      {selectedPost && (
        <div
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex justify-center items-center"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="bg-white rounded-lg w-11/12 md:w-3/5 lg:w-1/2 max-h-[90vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-2 right-4 text-xl font-bold text-gray-700"
            >
              ✕
            </button>

            <div className="relative w-full h-64 mt-10 flex items-center justify-center">
              <img
                src={
                  modalImages.length > 0
                    ? modalImages[currentIndex]
                    : selectedPost.imageUrl || "/image/logo1.png"
                }
                alt={`image-${currentIndex}`}
                className="max-h-64 object-contain rounded"
                loading="lazy"
              />
              {modalImages.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    className="absolute left-3 text-2xl text-white bg-black/40 rounded-full p-2 hover:bg-black/70"
                  >
                    ‹
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-3 text-2xl text-white bg-black/40 rounded-full p-2 hover:bg-black/70"
                  >
                    ›
                  </button>
                </>
              )}
            </div>

            <div className="p-4">
              <div className="text-xs text-gray-500 mt-2 flex justify-between mb-5">
                <div>장소 : {selectedPost.lo?.address || "주소 없음"}</div>
                <div>{selectedPost.createdAt}</div>
              </div>
              <h2 className="text-lg font-bold mb-2 dark:text-gray-600 truncate">
                {selectedPost.title}
              </h2>
              <p className="text-sm text-gray-700 break-words">
                {selectedPost.content}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookmarkPage;
