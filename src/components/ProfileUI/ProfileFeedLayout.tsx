"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Post } from "@/types/post";
import { doc, deleteDoc } from "firebase/firestore";
import { dbService } from "@/lib/firebase";
import { ImCancelCircle } from "react-icons/im";
import { getUserPostsPaginated } from "@/lib/fbdata";
import LikeButton from "../post/LikeButton";

const ProfileFeedComponent = ({
  posts,
  isMyPage,
  uid,
}: {
  posts: Post[];
  isMyPage: boolean;
  uid: string;
}) => {
  const [postList, setPostList] = useState<Post[]>(posts);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const lastDocRef = useRef<any>(null);
  const observerRef = useRef<HTMLDivElement | null>(null);

  // posts prop이 바뀌면 postList도 갱신
  useEffect(() => {
    setPostList(posts);
  }, [posts]);

  const handleDelete = useCallback(async (postId: string) => {
    const ok = window.confirm("정말 이 게시물을 삭제하시겠습니까?");
    if (!ok) return;

    try {
      await deleteDoc(doc(dbService, "posts", postId));
      setPostList((prev) => prev.filter((p) => p.id !== postId));
    } catch (error) {
      console.error("삭제 실패:", error);
      alert("삭제에 실패했습니다.");
    }
  }, []);

  const loadMorePosts = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    const { posts: newPosts, lastDoc } = await getUserPostsPaginated(
      uid,
      lastDocRef.current
    );

    setPostList((prev) => {
      const existingIds = new Set(prev.map((p) => p.id));
      const filteredPosts = newPosts.filter((p) => !existingIds.has(p.id));
      return [...prev, ...filteredPosts];
    });

    lastDocRef.current = lastDoc;
    setHasMore(newPosts.length > 0);
    setLoading(false);
  }, [loading, hasMore, uid]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadMorePosts();
      }
    });

    const target = observerRef.current;
    if (target) observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
    };
  }, [loadMorePosts]);

  return (
    <div className="flex flex-col border-t p-5 border-blue-200 lg:w-[1024px] mx-auto">
      <ul className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
        {postList.map((post) => (
          <li key={post.id} className="p-1">
            <div className="flex flex-col gap-2 relative hover:bg-gray-100 dark:hover:bg-gray-600 rounded-2xl p-1.5 transition-all duration-200">
              {post.imageUrl ? (
                <img
                  src={post.imageUrl}
                  alt="post"
                  className="w-full h-64 transition-all duration-500 ease-in-out transform hover:scale-[1.02] object-cover rounded"
                />
              ) : (
                <div className="w-full h-64 bg-gray-300 flex items-center justify-center">
                  <img
                    src="/image/logo1.png"
                    alt="기본 이미지"
                    className="w-20 h-20 opacity-60 object-contain "
                  />
                </div>
              )}
              {isMyPage && (
                <button
                  onClick={() => handleDelete(post.id!)}
                  className="absolute top-2 right-2 text-s text-pink-700 hover:animate-pulse hover:scale-[1.02] cursor-pointer p-2 hover:text-pink-600 active:text-pink-700 dark:active:text-pink-100"
                >
                  <ImCancelCircle />
                </button>
              )}
              <div className="flex justify-between text-s text-gray-500 mt-1 dark:text-gray-300">
                <span>
                  <LikeButton
                    postId={post.id!}
                    likedBy={post.likes}
                    postOwnerId={post.uid}
                  />
                </span>
              </div>
              <div className="text-sm">
                <p className="font-semibold truncate">
                  {post.title || "제목 없음"}
                </p>
                <p className="text-gray-600 truncate dark:text-gray-400">
                  {post.content?.slice(0, 60) || "내용 없음"}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div ref={observerRef} className="h-10" />
    </div>
  );
};

export default ProfileFeedComponent;
