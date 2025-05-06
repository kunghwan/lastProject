"use client";

import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  query,
  orderBy,
  updateDoc,
  doc,
} from "firebase/firestore";
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

  const sortedPosts = useMemo(() => {
    const toTime = (createdAt: any): number => {
      if (createdAt?.toDate) return createdAt.toDate().getTime();
      return new Date(createdAt).getTime();
    };

    const copy = [...posts];
    if (sort === "recent") {
      return copy.sort((a, b) => toTime(b.createdAt) - toTime(a.createdAt));
    }
    if (sort === "oldest") {
      return [...posts].reverse(); // 최신순을 불러왔으므로 뒤집으면 오래된순
    } else if (sort === "likes") {
      return copy.sort((a, b) => b.likes.length - a.likes.length);
    }
    return copy;
  }, [posts, sort]);

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
        updateDoc(doc(dbService, "posts", postId), {
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

  return (
    <div className="grid grid-cols-2 gap-x-2 mb-20 lg:grid-cols-3 ml-2.5 mr-2.5 transition-all">
      {sortedPosts.length === 0 ? (
        <div className="col-span-2 lg:col-span-3 flex justify-center items-center h-40 text-gray-500 text-center text-sm">
          아직 좋아요한 게시물이 없습니다.
        </div>
      ) : (
        sortedPosts.map((post) => (
          <div key={post.id}>
            {/* 이미지 */}
            {post.imageUrl ? (
              <img
                src={post.imageUrl}
                alt="Post image"
                className="w-full h-100 object-cover rounded-lg mb-2 transition-all duration-500 ease-in-out transform hover:scale-[1.02]"
              />
            ) : (
              <div className="w-full h-100 transition-all duration-500 ease-in-out transform hover:scale-[1.02] flex items-center justify-center rounded-lg mb-2">
                <img src="/image/logo1.png" alt="No image available" />
              </div>
            )}

            {/* 텍스트 */}
            <p>{post.content}</p>
            <div className="flex items-center mb-2.5 gap-2">
              <button
                type="button"
                onClick={() => toggleLike(post.id!)}
                className="text-red-500"
              >
                <GoHeart />
              </button>
              <span>{post.likes.length}개</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};
export default BookmarkPage;
