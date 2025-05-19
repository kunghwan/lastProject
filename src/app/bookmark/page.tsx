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
import { Timestamp, FieldValue } from "firebase/firestore";
import { authService, dbService } from "@/lib/firebase";
import { Post, Tag } from "@/types/post";
import { useRouter } from "next/navigation";
import UpPlaceBookMark from "@/components/upplace/UpPlaceBookMark";
import LikeButton from "@/components/post/LikeButton";
import { FcLike } from "react-icons/fc";
import { HiOutlineX } from "react-icons/hi";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useQueryClient } from "@tanstack/react-query";
import TopButton from "@/components/upplace/TopButton";
import Loaiding from "@/components/Loading";

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

  const getFormattedDate = (createdAt: Post["createdAt"]) => {
    //! 지금 들어온 createdAt 값이 Firebase의 Timestamp 객체인가를 검사(instanceof)
    if (createdAt instanceof Timestamp) {
      return createdAt.toDate().toLocaleString();
    } else if (typeof createdAt === "string") {
      return new Date(createdAt).toLocaleString();
    } else {
      return "날짜 정보 없음";
    }
  };

  // 안전하게 시간값 추출하는 함수
  const getTimeValue = (value: string | Timestamp | FieldValue): number => {
    if (value instanceof Timestamp) {
      return value.toDate().getTime();
    } else if (typeof value === "string") {
      return new Date(value).getTime();
    } else {
      return 0; // FieldValue 등 아직 날짜로 변환 불가한 경우
    }
  };

  const queryClient = useQueryClient();
  useEffect(() => {
    const cached = queryClient.getQueryData<Post[]>(["likedPosts"]);
    if (cached) {
      setPosts(cached);
      setLoading(false);
      return;
    }

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

        // ✅ 캐시에 저장
        queryClient.setQueryData(["likedPosts"], likedPosts);
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
          (a, b) => getTimeValue(b.createdAt) - getTimeValue(a.createdAt)
        );
      case "oldest":
        return [...posts].sort(
          (a, b) => getTimeValue(a.createdAt) - getTimeValue(b.createdAt)
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

  if (loading)
    return (
      <div>
        <Loaiding message="북마크페이지로 이동중입니다..." />
      </div>
    );

  function getTimeAgo(time: string | Timestamp | FieldValue): string {
    let createdTime: Date;

    if (typeof time === "string") {
      createdTime = new Date(time);
    } else if (time instanceof Timestamp) {
      createdTime = time.toDate();
    } else {
      // FieldValue인 경우는 렌더링 시점에는 있을 수 없음
      return "시간 정보 없음";
    }

    const now = new Date();
    const diff = now.getTime() - createdTime.getTime();

    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    const week = 7 * day;

    if (diff < minute) return "방금 전";
    if (diff < hour) return `${Math.floor(diff / minute)}분 전`;
    if (diff < day) return `${Math.floor(diff / hour)}시간 전`;
    if (diff < week) return `${Math.floor(diff / day)}일 전`;
    return `${Math.floor(diff / week)}주 전`;
  }

  return (
    <div className="flex flex-col mx-auto p-2 lg:w-3/4 w-full ">
      <div className="flex items-center justify-between mb-4 gap-2.5">
        <p className="sm:text-xl font-bold flex gap-2.5">
          {" "}
          <FcLike /> 내가 좋아요한 게시글
        </p>
        <button
          onClick={handleBack}
          className="text-sm font-medium text-emerald-600 dark:text-emerald-200 hover:scale-105  hover:text-emerald-700 dark:hover:text-emerald-100 transition-all duration-200"
        >
          ← 이전 페이지
        </button>
      </div>
      {posts.length === 0 ? (
        <p className="text-gray-500">좋아요한 게시글이 없습니다.</p>
      ) : (
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
                  ? "bg-emerald-500 text-white border-emerald-200 dark:text-gray-200 dark:bg-emerald-500 dark:border-emerald-700"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100 dark:bg-gray-600 dark:border-gray-800 dark:text-gray-300 scale-90"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mb-20 p-1.5 m-1 w-full max-w-screen-lg mx-auto transition-all">
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
              className="hover:bg-gray-100 border overflow-hidden border-gray-200  dark:border-gray-600 dark:hover:bg-zinc-700 rounded-2xl p-1.5 cursor-pointer relative"
            >
              <div className="flex items-center gap-1.5 ">
                <img
                  src={post.userProfileImage}
                  alt="userProfileImage"
                  className="w-8 h-8 rounded-2xl"
                />
                <div className="font-bold">{post.userNickname}</div>
              </div>

              <div className="mt-2 relative rounded-xl overflow-hidden">
                <img
                  src={image}
                  alt="Post image"
                  className="w-full h-80 object-cover transition-all duration-500 ease-in-out transform hover:scale-[1.01] rounded-xl"
                />
                {Array.isArray(post.imgs) && post.imgs.length > 1 && (
                  <div className="absolute top-2 right-2 bg-gray-800 opacity-80 text-white text-xs p-1.5 rounded-xl">
                    +{post.imgs.length}
                  </div>
                )}
              </div>
              <div className="pt-2 pb-1 flex justify-between items-center">
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLike(post.id!);
                  }}
                  className="flex items-center"
                >
                  <LikeButton
                    postId={post.uid}
                    likedBy={post.likes}
                    postOwnerId={post.uid}
                  />
                </div>
                <div className="items-baseline text-end text-gray500 text-sm">
                  {getTimeAgo(post.createdAt)}
                </div>
              </div>
              <p className="truncate font-bold">{post.title}</p>
              <div className="flex flex-wrap">
                {post.tags.map((tag: Tag) => (
                  <div
                    key={tag.id}
                    className="px-2 py-1 text-xs text-gray-600 dark:text-gray-300"
                  >
                    <p>{tag.name}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="col-span-2 lg:col-span-3 pb-20 ">
        <UpPlaceBookMark />
      </div>
      {sortedPosts.map((post) => {
        const image =
          typeof post.imageUrl === "string"
            ? post.imageUrl
            : Array.isArray(post.imageUrl)
            ? post.imageUrl[0]
            : null;

        const safePostImage =
          image && image.trim() !== "" && image !== "undefined"
            ? image
            : "/image/logo1.png";

        const safeProfileImage =
          post.userProfileImage &&
          post.userProfileImage.trim() !== "" &&
          post.userProfileImage !== "undefined"
            ? post.userProfileImage
            : "/image/logo1.png";

        return (
          <div
            key={post.id}
            onClick={() => handleOpenPost(post)}
            className="hover:bg-gray-100 border overflow-hidden border-gray-200  dark:border-gray-600 dark:hover:bg-zinc-700 rounded-2xl p-1.5 cursor-pointer relative"
          >
            <div className="flex items-center gap-1.5 ">
              <img
                src={safeProfileImage}
                alt="userProfileImage"
                className="w-8 h-8 rounded-2xl"
              />
              <div className="font-bold">{post.userNickname}</div>
            </div>

            <div className="mt-2 relative rounded-xl overflow-hidden">
              <img
                src={safePostImage}
                alt="Post image"
                className="w-full h-80 object-cover transition-all duration-500 ease-in-out transform hover:scale-[1.01] rounded-xl"
              />
              {Array.isArray(post.imgs) && post.imgs.length > 1 && (
                <div className="absolute top-2 right-2 bg-gray-800 opacity-80 text-white text-xs p-1.5 rounded-xl">
                  +{post.imgs.length}
                </div>
              )}
            </div>

            <div className="pt-2 pb-1 flex justify-between items-center">
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLike(post.id!);
                }}
                className="flex items-center"
              >
                <LikeButton
                  postId={post.uid}
                  likedBy={post.likes}
                  postOwnerId={post.uid}
                />
              </div>
              <div className="items-baseline text-end text-gray500 text-sm">
                {getTimeAgo(post.createdAt)}
              </div>
            </div>
            <p className="truncate font-bold">{post.title}</p>
            <div className="flex flex-wrap">
              {post.tags.map((tag: Tag) => (
                <div
                  key={tag.id}
                  className="px-2 py-1 text-xs text-gray-600 dark:text-gray-300"
                >
                  <p>{tag.name}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <TopButton />
    </div>
  );
};

export default BookmarkPage;

const defaultImgUrl = "/image/logo1.png"; // 기본 프로필 이미지 URL
