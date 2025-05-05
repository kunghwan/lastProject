"use client";

import { useEffect, useRef, useState } from "react";
import { getAllPostsPaginated } from "@/lib/fbdata";
import { Post as PostType } from "@/types/post";
import LikeButton from "./LikeButton";
import ShareButton from "./ShareButton";
import LocationButton from "./LocationButton";
import { useRouter } from "next/navigation";
import { fetchUsers } from "@/lib/user";

const PostComponent = () => {
  const router = useRouter();
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const lastDocRef = useRef<any>(null);
  const observerRef = useRef<HTMLDivElement | null>(null);

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
  }, [observerRef.current]);

  // ✨ 변경된 부분 (handleClick 수정)
  const handleClick = async (nickname: string) => {
    if (!nickname) return;

    const loggedInUsername =
      typeof window !== "undefined" ? localStorage.getItem("username") : null;

    if (nickname === loggedInUsername) {
      router.push("/profile/me");
    } else {
      router.push(`/profile/${encodeURIComponent(nickname)}`);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-y-3 mb-20 md:grid-cols-2 lg:grid-cols-3 ml-2.5 mr-2.5">
      {posts.map((post) => (
        <div key={post.id} className="rounded-lg p-1">
          <button
            className="flex gap-2.5 items-center text-center mb-1.5 ml-1"
            onClick={() => handleClick(post.userNickname, post.uid)} // ✨ uid 전달 추가
          >
            <img
              className="w-10 h-10 rounded-full border border-gray-200"
              src={post.userProfileImage || defaultImgUrl}
              alt="user profile image"
            />
            <div className="font-black">{post.userNickname}</div>
          </button>
          {post.imageUrl ? (
            <img
              src={post.imageUrl}
              alt="Post image"
              className="w-full h-128 object-cover rounded-lg mb-2"
            />
          ) : (
            <div className="w-full h-128 border bg-gray-200 flex items-center justify-center rounded-lg mb-2">
              <img
                src="/image/whitelogo1.png"
                alt="No image available"
                className="w-40 h-40 object-contain"
              />
            </div>
          )}
          <div className="flex gap-4 ml-1">
            <p className="flex-1/4 text-m text-gray-500 dark:text-gray-300">
              <LikeButton likedBy={post.likes} postId={post.id} />{" "}
              {post.likes?.length}
            </p>
            <p className="flex-1/4 text-m text-gray-500 dark:text-gray-300">
              <ShareButton /> {post.shares?.length}
            </p>
            <p className="flex-1/2 text-sm text-gray-500 dark:text-gray-300">
              <LocationButton /> {post.lo?.latitude} {post.lo?.longitude}
            </p>
          </div>
          <p className="text-lg font-semibold">{post.content}</p>
          <div className="items-baseline text-end text-gray500 text-sm">
            {post.createdAt}
          </div>
        </div>
      ))}
      <div ref={observerRef} className="col-span-full h-10"></div>
      {loading && <div className="text-center col-span-full">로딩 중...</div>}
    </div>
  );
};

export default PostComponent;

const defaultImgUrl =
  "https://i.pinimg.com/1200x/3e/c0/d4/3ec0d48e3332288604e8d48096296f3e.jpg";
