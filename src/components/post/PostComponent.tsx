"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchPosts } from "@/lib/post"; // fetchPosts 함수
import { Post as PostType } from "@/types/post"; // Post 타입 정의
import LikeButton from "./LikeButton";
import ShareButton from "./ShareButton";
import LocationButton from "./LocationButton";
import { useRouter } from "next/navigation"; // Next.js의 useRouter 훅

const PostComponent = () => {
  const router = useRouter(); // useRouter 훅 사용

  // React Query를 사용하여 Firestore에서 posts 데이터를 가져옴
  const {
    data: posts = [],
    isLoading,
    isError,
  } = useQuery<PostType[]>({
    queryKey: ["posts"], // queryKey를 객체로 전달
    queryFn: fetchPosts, // queryFn을 객체로 전달
    staleTime: 1000 * 60 * 5, // 데이터 캐싱 시간: 5분
  });

  if (isLoading) {
    return <h1>로딩 중...</h1>;
  }

  if (isError) {
    return <h1>데이터를 불러오는 중 오류가 발생했습니다.</h1>;
  }

  return (
    <div className="grid grid-cols-1 gap-y-3 mb-20 md:grid-cols-2 lg:grid-cols-3 ml-2.5 mr-2.5">
      {posts.map((post) => {
        const {
          id,
          imageUrl,
          content,
          likes,
          shares,
          createdAt,
          lo,
          uid,
          userNickname,
          userProfileImage,
        } = post;

        if (userProfileImage === null) {
          return null;
        }

        return (
          <div key={id} className="rounded-lg p-1">
            <button
              className="flex gap-2.5 items-center text-center mb-1.5 ml-1"
              onClick={() => router.push(`/profile/${userNickname}`)} // 클릭 시 이동
            >
              {userProfileImage ? (
                <img
                  className="w-10 h-10 rounded-full border border-gray-200"
                  src={userProfileImage}
                  alt="user profile image"
                />
              ) : (
                <img
                  src={defaultImgUrl}
                  alt="defaultImgUrl"
                  className="w-10 h-10 rounded-full border border-gray-200"
                />
              )}

              <div className="font-black">{userNickname}</div>
            </button>
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Post image"
                className="w-full h-128 object-cover rounded-lg mb-2"
              />
            ) : (
              <div className="w-full h-128 bg-gray-200 flex items-center justify-center rounded-lg mb-2">
                <img
                  src="/image/whitelogo1.png" // public 폴더의 이미지 경로
                  alt="No image available"
                  className="w-40 h-40 object-contain"
                />
              </div>
            )}
            <div className="flex gap-4 ml-1">
              <p className="flex-1/4 text-m text-gray-500 dark:text-gray-300">
                <LikeButton /> {likes?.length}
              </p>
              <p className="flex-1/4 text-m text-gray-500 dark:text-gray-300">
                <ShareButton /> {shares?.length}
              </p>
              <p className="flex-1/2 text-sm text-gray-500 dark:text-gray-300">
                <LocationButton /> {lo?.latitude} {lo?.longitude}
              </p>
            </div>
            <p className="text-lg font-semibold">{content}</p>
            <div className="items-baseline text-end text-gray500 text-sm">
              {createdAt}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PostComponent;

const defaultImgUrl =
  "https://i.pinimg.com/1200x/3e/c0/d4/3ec0d48e3332288604e8d48096296f3e.jpg";
