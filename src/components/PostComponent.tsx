"use client";

import React from "react";
import { Post as PostType } from "@/types/post";
import { FcRemoveImage } from "react-icons/fc";

interface PostDateProps {
  post: PostType; // Post 데이터를 받아오는 props
}

const Post: React.FC<PostDateProps> = ({ post }) => {
  const { imageUrl, content, likes, shares, lo } = post;

  return (
    <div className="border rounded-lg p-4 shadow-md">
      {imageUrl ? (
        <div className="flex justify-center items-center">
          <img
            src={imageUrl}
            alt="Post image"
            className="w-full h-96 object-cover mb-2.5 rounded-lg"
          />
        </div>
      ) : (
        <div className="flex justify-center items-center">
          <FcRemoveImage className="w-96 h-96 object-cover rounded-lg mb-2.5" />
        </div>
      )}

      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">{content}</h3>
        <p className="text-sm text-gray-600">좋아요 수: {likes.length}</p>
        <p className="text-sm text-gray-600">공유 수: {shares.length}</p>
        <p className="text-sm text-gray-600">
          위치: {lo?.address || "위치 정보 없음"}
        </p>
      </div>
    </div>
  );
};

export default Post;
