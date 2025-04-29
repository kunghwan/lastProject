"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchPosts } from "@/lib/post"; // fetchPosts 함수
import { Post as PostType } from "@/types/post"; // Post 타입 정의

const PostComponent = () => {
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ml-2.5 mr-2.5">
      {posts.map((post) => {
        const {
          id,
          imageUrl,
          content,
          likes,
          shares,
          title,
          bookmarked,
          createdAt,
          isLiked,
          lo,
          uid,
          userNickname,
          userProfileImage,
        } = post;
        return (
          <div key={id} className="rounded-lg p-4 border">
            <button className="flex gap-2.5">
              <img
                className="w-12 h-12 rounded-full"
                src={userProfileImage}
                alt="user profile image"
              />
              <div>{userNickname}</div>
            </button>
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Post image"
                className="w-full h- object-cover rounded-lg mb-2"
              />
            ) : (
              <div className="w-full h-68 bg-gray-200 flex items-center justify-center rounded-lg mb-2">
                이미지 없음
              </div>
            )}
            <p>{title}</p>
            <p>{bookmarked}</p>

            <p>{createdAt}</p>
            <p>{isLiked}</p>
            <p>{userNickname}</p>
            <p>{userProfileImage}</p>
            <p>{uid}</p>
            <h3 className="text-lg font-semibold">{content}</h3>
            <div className="flex gap-4">
              <p className="text-sm text-gray-600">좋아요: {likes?.length}</p>
              <p className="text-sm text-gray-600">공유: {shares?.length}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PostComponent;
