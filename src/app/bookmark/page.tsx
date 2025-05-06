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

import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { dbService } from "@/lib/firebase";
import { Post } from "@/types/post";
import BookmarkCard from "@/components/BookmarkCard";
import UpPlaceBookMark from "@/components/upplace/UpPlaceBookMark";

const BookmarkPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [sort, setSort] = useState<"recent" | "likes">("recent");
  const [editMode, setEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const user = getAuth().currentUser;

  useEffect(() => {
    const fetchLikedPosts = async () => {
      const allDocs = await getDocs(collection(dbService, "posts"));
      const liked = allDocs.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }) as Post)
        .filter((post) => post.likes.includes(user?.uid || ""));

      setPosts(
        liked.sort((a, b) =>
          sort === "recent"
            ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            : b.likes.length - a.likes.length
        )
      );
    };

    fetchLikedPosts();
  }, [user, sort]);

  const handleDelete = async () => {
    const filtered = posts.filter((p) => !selectedIds.includes(p.id!));
    setPosts(filtered);
    // Firestore 업데이트
    for (const id of selectedIds) {
      const post = posts.find((p) => p.id === id);
      if (post && user?.uid) {
        await updateDoc(doc(dbService, "posts", id), {
          likes: post.likes.filter((uid) => uid !== user.uid),
        });
      }
    }
    setSelectedIds([]);
    setEditMode(false);
  };

  return (
    <div className="p-4 ">
      <div className="flex gap-2 mb-4">
        <button onClick={() => setSort("recent")}>최신순</button>
        <button onClick={() => setSort("likes")}>좋아요순</button>
        <button onClick={() => setEditMode((prev) => !prev)}>
          {editMode ? "취소" : "수정하기"}
        </button>
        {editMode && selectedIds.length > 0 && (
          <button onClick={handleDelete}>선택 삭제</button>
        )}
      </div>

      <div className="grid gap-4">
        {posts.map((post) => (
          <BookmarkCard
            key={post.id}
            post={post}
            editMode={editMode}
            selected={selectedIds.includes(post.id!)}
            onSelect={(checked) => {
              setSelectedIds((prev) =>
                checked
                  ? [...prev, post.id!]
                  : prev.filter((id) => id !== post.id)
              );
            }}
          />
        ))}
      </div>
      {/* 추천장소 좋아요 모음 */}
      <div>
        <UpPlaceBookMark />
      </div>

    </div>
  );
};

export default BookmarkPage;


//✅ 보완 팁
// Firestore에서 "좋아요한 게시물만" 불러오려면 클라이언트 필터링 외에 구조적으로는 유저별로 좋아요한 postId 리스트를 저장하는 구조로 바꾸는 것도 가능 (성능 개선)

// 정렬은 Array.prototype.sort()로 간단하게 해결 가능

// 수정 모드는 상태 하나로 토글 및 선택 상태 관리

// 원한다면 삭제 후 스낵바 알림이나 애니메이션도 추가할 수 있어요.
// 지금 구조를 기준으로 실제 코드 파일화 원하시나요?

//! 애니매이션 추가 괜찮은거같고 실제코드 파일화 괜찮은거 같아요

//! 그리고 지금 feed에서 좋아요한거랑 upplace에서 좋아요한걸 따로 컴포넌트해서 하는게 좋을거같아요
//! feed에서 좋아요한거 컴포넌트
//! upplace에서 좋아요한거 컴포넌트

