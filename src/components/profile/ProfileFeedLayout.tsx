"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Post } from "@/types/post";
import { doc, deleteDoc, FieldValue } from "firebase/firestore";
import { dbService } from "@/lib/firebase";
import { ImCancelCircle } from "react-icons/im";
import { getUserPostsPaginated } from "@/lib/fbdata";
import LikeButton from "../post/LikeButton";
import { Timestamp } from "firebase/firestore";
import { HiOutlineX } from "react-icons/hi";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useAlertModal } from "../AlertStore";

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

  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [modalImages, setModalImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setPostList(posts);
  }, [posts]);
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

  //! 날짜 변환 함수 (파이어베이스에 저장된객체를 우리가 볼 수 있는 문자열로 바꿈)
  const getFormattedDate = (createdAt: Post["createdAt"]) => {
    if (createdAt instanceof Timestamp) {
      return createdAt.toDate().toLocaleString();
    } else if (typeof createdAt === "string") {
      return new Date(createdAt).toLocaleString();
    } else {
      return "날짜 정보 없음";
    }
  };
  const { openAlert } = useAlertModal();

  const handleDelete = useCallback(
    (postId: string) => {
      openAlert("정말 이 게시물을 삭제하시겠습니까?", [
        {
          text: "삭제",
          isGreen: true,
          autoFocus: true,
          onClick: async () => {
            try {
              await deleteDoc(doc(dbService, "posts", postId));
              setPostList((prev) => prev.filter((p) => p.id !== postId));
            } catch (error) {
              console.error("삭제 실패:", error);
              openAlert("❌ 삭제에 실패했습니다.");
            }
          },
        },
        {
          text: "취소",
        },
      ]);
    },
    [openAlert]
  );
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

  const handleOpenPost = useCallback((post: Post) => {
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
      if (e.key === "Escape") setSelectedPost(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col p-5 border-t-2 border-emerald-200 w-full lg:w-[1024px] mx-auto">
      <ul className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {[...postList]
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
          .map((post) => (
            <li key={post.id} className="p-1">
              <div className="flex flex-col gap-1relative hover:bg-gray-100 dark:hover:bg-gray-600 rounded-2xl p-2.5 transition-all duration-200 cursor-pointer dark:border dark:border-gray-400">
                {post.imageUrl ? (
                  <div
                    onClick={() => handleOpenPost(post)}
                    className="relative"
                  >
                    <img
                      src={post.imgs?.[0] || defaultImgUrl}
                      alt="post"
                      className="w-full h-64 transition-all duration-500 ease-in-out transform hover:scale-[1.02] object-cover rounded"
                    />
                    {Array.isArray(post.imgs) && post.imgs.length > 1 && (
                      <div className="absolute top-2 right-2 bg-gray-800 opacity-80 text-white text-xs p-1.5 rounded-full">
                        +{post.imgs.length}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-64 bg-gray-300 items-center justify-center flex">
                    <img
                      src={defaultImgUrl}
                      alt="기본 이미지"
                      className="w-20 h-20 opacity-60 object-contain"
                    />
                  </div>
                )}

                <div className="flex justify-between text-s text-gray-500 mt-1 dark:text-gray-300">
                  <LikeButton
                    postId={post.id!}
                    likedBy={post.likes}
                    postOwnerId={post.uid}
                  />
                  {isMyPage && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // 클릭 이벤트 전파 방지
                        handleDelete(post.id!);
                      }}
                      className="text-s text-pink-700 hover:animate-pulse hover:scale-[1.02] cursor-pointer p-2 hover:text-pink-600 active:text-pink-700 dark:active:text-pink-100"
                    >
                      <ImCancelCircle />
                    </button>
                  )}
                </div>

                <div className="text-sm p-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold truncate">
                      {post.title || "제목 없음"}
                    </p>
                    <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                      {getTimeAgo(post.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-600 ml-1 mt-1 h-auto dark:text-gray-400">
                    {post.content?.slice(0, 60) || "내용 없음"}
                  </p>
                </div>
              </div>
            </li>
          ))}
      </ul>

      <div ref={observerRef} className="h-10" />

      {selectedPost && (
        <div
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex justify-center items-center "
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="bg-white rounded-lg w-11/12 md:w-3/5 lg:w-1/2 max-h-[60vh] md:max-h-[80vh] h-screen relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute z-40 top-0.5 right-1 md:text-3xl transition-all text-2xl font-bold text-gray-700 p-5 hover:text-gray-400"
            >
              <HiOutlineX />
            </button>

            <div className="relative overflow-hidden h-2/3 mt-7 md:mt-10 flex items-center justify-center">
              <img
                src={
                  modalImages.length > 0
                    ? modalImages[currentIndex]
                    : selectedPost.imageUrl?.[0] || defaultImgUrl
                }
                alt={`image-${currentIndex}`}
                className=" object-contain h-80 rounded md:h-110 md:w-110"
                loading="lazy"
              />
              {modalImages.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    className="absolute left-3 text-2xl text-gray-700 invert hover:text-gray-600 rounded-full p-1.5 hover:bg-black/80 hover:scale-110 hover:opacity-85 transition-all duration-200"
                  >
                    <FaChevronLeft />
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-3 text-2xl text-gray-700 invert hover:text-gray-600 rounded-full p-1.5 hover:bg-black/80 hover:scale-110 hover:opacity-85 transition-all duration-200"
                  >
                    <FaChevronRight />
                  </button>
                </>
              )}
            </div>

            <div className="p-4 justify-end flex flex-col">
              <div className="text-xs text-gray-500 mt-2 flex justify-between mb-5">
                <div>장소 : {selectedPost.lo?.address || "주소 없음"}</div>
                <div>{getFormattedDate(selectedPost.createdAt)}</div>
              </div>
              <h2 className="text-lg font-bold mb-2 dark:text-gray-600 truncate">
                {selectedPost.title}
              </h2>
              <p className="text-sm text-gray-700 break-words overflow-y-auto max-h-12 md:max-h-24 pr-1">
                {selectedPost.content}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileFeedComponent;

const defaultImgUrl = "/image/logo1.png";
