"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { getAllPostsPaginated } from "@/lib/fbdata";
import { Post, Post as PostType, Tag } from "@/types/post";
import LikeButton from "./LikeButton";
import ShareButton from "./ShareButton";
import LocationButton from "./LocationButton";
import { useRouter } from "next/navigation";
import { authService } from "@/lib";
import { FieldValue, Timestamp } from "firebase/firestore";
import { HiOutlineX } from "react-icons/hi";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useQueryClient } from "@tanstack/react-query";
import Loaiding from "../Loading";

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

  const queryClient = useQueryClient();

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

  useEffect(() => {
    const cached = queryClient.getQueryData<PostType[]>(["cachedPosts"]);
    if (cached && cached.length > 0) {
      setPosts(cached);
      setHasMore(true);
    } else {
      loadMorePosts(); // 최초 호출
    }
  }, []);

  //! 날짜 변환 함수 (파이어베이스에 저장된객체를 우리가 볼 수 있는 문자열로 바꿈)
  //Todo: Post["createdAt"] => 타입에 접근하려는 문법(Post에 정의된 createdAt 타입을 그대로 받아오겠다"는 뜻)
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

  const loadMorePosts = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const { posts: newPosts, lastDoc } = await getAllPostsPaginated(
      lastDocRef.current
    );

    setPosts((prev) => {
      const ids = new Set(prev.map((p) => p.id));
      const filteredNewPosts = newPosts.filter((p) => !ids.has(p.id));
      const updatedPosts = [...prev, ...filteredNewPosts];

      // ✅ 캐시에 저장
      queryClient.setQueryData(["cachedPosts"], updatedPosts);

      return updatedPosts;
    });

    lastDocRef.current = lastDoc;
    setHasMore(newPosts.length > 0);
    setLoading(false);
  }, [loading, hasMore]);

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
  }, [loadMorePosts]);

  const handleClick = useCallback(
    (postUid: string, postNickname: string) => {
      const loginUid =
        typeof window !== "undefined"
          ? localStorage.getItem("uid") || authService.currentUser?.uid
          : null;

      if (loginUid && loginUid === postUid) {
        router.push("/profile");
      } else {
        router.push(`/profile/${encodeURIComponent(postNickname)}`);
      }
    },
    [router]
  );

  const handleOpenPost = useCallback((post: PostType) => {
    const images = Array.isArray(post.imgs)
      ? post.imgs.filter((img): img is string => typeof img === "string")
      : [];

    setSelectedPost(post);
    setModalImages(images);
    setCurrentIndex(0);
  }, []);

  const handlePrev = useCallback(() => {
    if (modalImages.length === 0) return;
    setCurrentIndex((prev) => (prev === 0 ? modalImages.length - 1 : prev - 1));
  }, [modalImages.length]);

  const handleNext = useCallback(() => {
    if (modalImages.length === 0) return;
    setCurrentIndex((prev) => (prev === modalImages.length - 1 ? 0 : prev + 1));
  }, [modalImages.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedPost(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const [currentUid, setCurrentUid] = useState<string | null>(null);

  useEffect(() => {
    const user = authService.currentUser;
    setCurrentUid(user?.uid || null);
  }, []);

  return (
    <div className="grid grid-cols-1 gap-y-3 mb-20 md:grid-cols-2 lg:grid-cols-3 ml-2.5 mr-2.5">
      {posts
        .slice()
        .sort((a, b) => {
          const aDate =
            a.createdAt instanceof Timestamp
              ? a.createdAt.toDate().getTime()
              : new Date(a.createdAt as string).getTime();

          const bDate =
            b.createdAt instanceof Timestamp
              ? b.createdAt.toDate().getTime()
              : new Date(b.createdAt as string).getTime();

          return bDate - aDate;
        })
        .map((post) => {
          const images = Array.isArray(post.imageUrl)
            ? post.imageUrl
            : [post.imageUrl];

          return (
            <div
              key={post.id}
              className="p-1.5 pb-2.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-2xl"
            >
              <button
                className="flex gap-1.5 items-center text-center m-1.5"
                onClick={() => handleClick(post.uid, post.userNickname)}
              >
                <img
                  className="w-8 h-8 border rounded-2xl pb-2.5 border-gray-200"
                  src={post.userProfileImage || defaultImgUrl}
                  alt="user profile image"
                />
                <div className="font-bold">{post.userNickname}</div>
              </button>

              <div
                className="relative cursor-pointer "
                onClick={() => handleOpenPost(post)}
              >
                <div className="overflow-hidden rounded-lg  border-gray-300 border">
                  <img
                    src={images[0] || defaultImgUrl}
                    alt="Post image"
                    className="w-full opacity-70 rounded-lg h-80 sm:h-128 object-cover transition-all duration-500 ease-in-out transform hover:scale-[1.01]  "
                  />
                </div>

                {Array.isArray(post.imgs) && post.imgs.length > 1 && (
                  <div className="absolute top-3 right-3 bg-gray-800 opacity-70 text-white text-xs p-2 rounded-full">
                    +{post.imgs.length - 1}
                  </div>
                )}
              </div>

              <div className="flex gap-20 justify-between pt-1 items-center text-s text-gray-500 mt-1 dark:text-gray-300">
                <div className="flex gap-5">
                  <div className="flex-1/4 text-m text-gray-500 dark:text-gray-300">
                    <LikeButton
                      likedBy={post.likes}
                      postId={post.id!}
                      postOwnerId={post.uid}
                    />
                  </div>
                  <div className="flex-1/4 text-m text-gray-500 dark:text-gray-300">
                    <ShareButton userNickname={post.userNickname} />
                  </div>
                </div>
                <div className="flex-1/2 text-xs text-gray-500 dark:text-gray-300 truncate">
                  <LocationButton /> {post.lo?.address || "주소 없음"}
                </div>
              </div>
              <p
                className="text-lg font-semibold truncate pt-2.5 overflow-y-auto
            "
              >
                {post.content}
              </p>
              <div className="flex pt-2.5 flex-wrap">
                {post.tags.map((tag: Tag) => (
                  <div
                    key={tag.id}
                    className="px-2 py-1 text-xs text-gray-600 dark:text-gray-300"
                  >
                    <p>{tag.name}</p>
                  </div>
                ))}
              </div>

              <div className="items-baseline text-end text-gray500 text-sm">
                {getTimeAgo(post.createdAt)}
              </div>
            </div>
          );
        })}

      <div ref={observerRef} className="col-span-full h-10" />
      {loading && (
        <div>
          <Loaiding />
        </div>
      )}

      {selectedPost && (
        <div
          className="fixed inset-0 z-[999] bg-black/30 backdrop-blur-sm flex justify-center items-center"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="bg-white pb-5 dark:bg-gray-700 rounded-lg w-5/6 md:w-4/5  lg:w-1/2 relative overflow-y-auto transition-all duration-300 transform "
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute z-40 top-2 right-2 p-1 md:text-2xl md:top-3 md:right-3 text-xl font-bold text-gray-700 dark:text-white hover:text-gray-400 transition-all"
            >
              <HiOutlineX />
            </button>
            {/* 이미지 슬라이드 영역 */}
            <div className="relative w-full pt-8 md:pt-10 flex items-center justify-center">
              <img
                src={
                  modalImages.length > 0
                    ? modalImages[currentIndex]
                    : selectedPost.imageUrl?.[0] || defaultImgUrl
                }
                alt={`image-${currentIndex}`}
                className="object-contain md:w-140 h-80 md:h-120 rounded"
                loading="lazy"
              />

              {modalImages.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    className="absolute left-3 text-2xl text-gray-700 dark:text-white hover:text-gray-400 rounded-full p-1.5 hover:bg-black/80 hover:scale-110 transition-all bg-white/40"
                  >
                    <FaChevronLeft />
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-3 text-2xl bg-white/40 text-gray-700 dark:text-white hover:text-gray-400 rounded-full p-1.5 hover:bg-black/80 hover:scale-110 transition-all"
                  >
                    <FaChevronRight />
                  </button>
                </>
              )}
            </div>

            {/* 게시물 정보 */}
            <div className="p-3 justify-end flex flex-col pr-2 pl-2 md:h-40 sm:pr-10 sm:pl-10">
              <div className="text-[10px] text-gray-500 dark:text-gray-300 mt-2 flex justify-between pb-2">
                <div>장소 : {selectedPost.lo?.address || "주소 없음"}</div>
                <div>{getFormattedDate(selectedPost.createdAt)}</div>
              </div>
              <div className="text-lg font-bold pb-4 dark:text-white truncate">
                {selectedPost.title}
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-200 break-words overflow-y-auto h-30 pr-2">
                {selectedPost.content}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostComponent;

const defaultImgUrl = "/image/logo1.png"; // 기본 프로필 이미지 URL
