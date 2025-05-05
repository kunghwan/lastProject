"use client";

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
