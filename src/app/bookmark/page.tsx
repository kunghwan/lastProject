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
        return [...posts].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
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
    <div className="flex flex-col">
      <div className="grid grid-cols-2 gap-x-2 mb-20 lg:grid-cols-3 p-1.5 m-1 transition-all">
        {sortedPosts.length === 0 ? (
          <div className="col-span-2 lg:col-span-3 flex justify-center items-center mt-80 text-gray-500 text-center text-xl animate-bounce">
            아직 좋아요한 게시물이 없습니다.
          </div>
        ) : (
          sortedPosts.map((post) => (
            <div key={post.id}>
              <div className="m-1.5 flex items-center gap-1.5">
                <img
                  src={post.userProfileImage}
                  alt="userProfileImage"
                  className=" w-8 h-8"
                />
                <div className="font-bold">{post.userNickname}</div>
              </div>
              {post.imageUrl ? (
                <img
                  src={post.imageUrl}
                  alt="Post image"
                  className="w-full h-100 object-cover mb-2 transition-all duration-500 ease-in-out transform hover:scale-[1.01]"
                />
              ) : (
                <div className="w-full h-100 transition-all duration-500 ease-in-out transform hover:scale-[1.01] flex items-center justify-center mb-2">
                  <img
                    src="/image/logo1.png"
                    alt="No image available"
                    className=""
                  />
                </div>
              )}
              <p>{post.content}</p>
              <div className="flex items-center gap-2 mb-2.5">
                <button
                  type="button"
                  onClick={() => toggleLike(post.id!)}
                  className="text-red-500"
                >
                  <GoHeart />
                </button>
                <span>{post.likes.length}</span>
              </div>
            </div>

          ))
        )}
      </div>
      <div className="mt-10"></div>



          ))
        )}
      </div>
      <div className="mt-10">

          </div>
        ))
      )}

      {/* 수정한 부분 추천장소 좋아요 모은거 */}
      <div className="col-span-2 lg:col-span-3">

        <UpPlaceBookMark />
      </div>
    </div>
  );
};

export default BookmarkPage;
