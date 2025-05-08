"use client";

import { useEffect, useRef, useState } from "react";
import { getAllPostsPaginated } from "@/lib/fbdata";
import { Post as PostType } from "@/types/post";
import LikeButton from "./LikeButton";
import ShareButton from "./ShareButton";
import LocationButton from "./LocationButton";
import { useRouter } from "next/navigation";

const defaultImgUrl =
  "https://i.pinimg.com/1200x/3e/c0/d4/3ec0d48e3332288604e8d48096296f3e.jpg";

const PostComponent = () => {
  const router = useRouter();
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const lastDocRef = useRef<any>(null);
  const observerRef = useRef<HTMLDivElement | null>(null);

  const [selectedPost, setSelectedPost] = useState<PostType | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0); // 슬라이더 인덱스
  const [modalImages, setModalImages] = useState<string[]>([]);

  useEffect(() => {
    loadMorePosts();
  }, []);

  const loadMorePosts = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const { posts: newPosts, lastDoc } = await getAllPostsPaginated(
      lastDocRef.current
    );

    setPosts((prev) => {
      const ids = new Set(prev.map((p) => p.id));
      const filteredNewPosts = newPosts.filter((p) => !ids.has(p.id));
      return [...prev, ...filteredNewPosts];
    });

    lastDocRef.current = lastDoc;
    setHasMore(newPosts.length > 0);
    setLoading(false);
  };

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadMorePosts();
      }
    });
    if (observerRef.current) observer.observe(observerRef.current);
    return () => {
      if (observerRef.current) observer.unobserve(observerRef.current);
    };
  }, []);

  const handleClick = (nickname: string) => {
    const loggedInUsername =
      typeof window !== "undefined" ? localStorage.getItem("username") : null;

    if (nickname === loggedInUsername) {
      router.push("/profile/me");
    } else {
      router.push(`/profile/${encodeURIComponent(nickname)}`);
    }
  };

  const handleOpenPost = (post: PostType) => {
    const images = Array.isArray(post.imgs)
      ? post.imgs.filter((img): img is string => typeof img === "string")
      : [];

    setSelectedPost(post);
    setModalImages(images);
    setCurrentIndex(0);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? modalImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
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

  return (
    <div className="grid grid-cols-1 gap-y-3 mb-20 md:grid-cols-2 lg:grid-cols-3 ml-2.5 mr-2.5">
      {posts.map((post) => {
        const images = Array.isArray(post.imageUrl)
          ? post.imageUrl
          : [post.imageUrl];

        return (
          <div key={post.id} className="p-1.5 m-1">
            <button
              className="flex gap-1.5 items-center text-center m-1.5"
              onClick={() => handleClick(post.userNickname)}
            >
              <img
                className="w-8 h-8 border rounded-2xl border-gray-200"
                src={post.userProfileImage || defaultImgUrl}
                alt="user profile image"
              />
              <div className="font-bold">{post.userNickname}</div>
            </button>

            <div
              className="relative cursor-pointer"
              onClick={() => handleOpenPost(post)}
            >
              <img
                src={images[0] || defaultImgUrl}
                alt="Post image"
                className="w-full border border-gray-300 h-128 object-cover mb-2 transition-all duration-500 ease-in-out transform hover:scale-[1.01]"
              />

              {Array.isArray(post.imgs) && post.imgs.length > 1 && (
                <div className="absolute top-3 right-3 bg-gray-800 opacity-70 text-white text-xs p-2 rounded-full">
                  +{post.imgs.length}
                </div>
              )}
            </div>

            <div className="flex gap-4 ml-1 mb-2">
              <div className="flex-1/4 text-m text-gray-500 dark:text-gray-300">
                <LikeButton
                  likedBy={post.likes}
                  postId={post.id!}
                  postOwnerId={post.uid}
                />
              </div>
              <p className="flex-1/4 text-m text-gray-500 dark:text-gray-300">
                <ShareButton />
              </p>
              <p className="flex-1/2 text-xs text-gray-500 dark:text-gray-300">
                <LocationButton /> {post.lo?.address || "주소 없음"}
              </p>
            </div>
            <p className="text-lg font-semibold truncate">{post.content}</p>
            <div className="items-baseline text-end text-gray500 text-sm">
              {post.createdAt}
            </div>
          </div>
        );
      })}

      <div ref={observerRef} className="col-span-full h-10" />
      {loading && <div className="text-center col-span-full">로딩 중...</div>}

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
                    : selectedPost.imageUrl || defaultImgUrl
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
              <h2 className="text-lg font-bold mb-2 truncate">
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

export default PostComponent;
