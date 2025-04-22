"use client";

import { Post } from "@/types/post";
import { useEffect, useState } from "react";
import { FcRemoveImage } from "react-icons/fc";
import { IoSettingsOutline } from "react-icons/io5";
import "../app/globals.css";

const ProfileLayout = ({
  posts,
  isMyPage,
}: {
  posts: Post[];
  isMyPage: boolean;
}) => {
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 930);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex flex-col w-full h-screen">
      {!isSmallScreen ? (
        <div className="flex flex-col m-5 mx-auto">
          <div className="flex m-10 mb-0 pr-20 pl-20 gap-2.5 justify-center ">
            <img
              src={posts[0].userProfileImage}
              alt={`${posts[0].userNickname}'s profile`}
              className="w-40 h-40 rounded-full bg-gray-600 sm:x-auto"
            />
            <div className="ml-10 w-120 flex-col flex flex-1 ">
              <p className="flex justify-between">
                <h1 className="font-medium text-4xl p-1">
                  {posts[0].userNickname}
                </h1>
                {posts[0] && (
                  <button className="text-2xl hover:animate-spin cursor-pointer p-2.5 active:text-gray-800  hover:text-gray-400">
                    <IoSettingsOutline />
                  </button>
                )}
              </p>
              <div className="flex ml-2.5 gap-5">
                <p className="flex gap-2.5 p-2.5">
                  게시물 <p>{posts.length}</p>
                </p>
                <p className="flex gap-2.5 p-2.5">
                  구독수 <p>{posts[0].shares.length}</p>
                </p>
              </div>
              <p className="pb-5 text-xl">
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Explicabo molestias quibusdam cum id assumenda nulla neque
                voluptas sint deserunt aliquam veniam consequatur cupiditate
                ipsum, aut impedit iure dolorum libero et.
              </p>
            </div>
          </div>
          <div className="flex text-2xl p-2.5 ml-30 mr-30">#tag1 #tag2 </div>
        </div>
      ) : (
        <div className="flex flex-col m-5 sm:m-10 mx-auto">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-10">
            <img
              src={posts[0].userProfileImage}
              alt={`${posts[0].userNickname}'s profile`}
              className="w-24 h-24 sm:w-40 sm:h-40 rounded-full bg-gray-600 object-cover"
            />
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
              <h1 className="font-medium text-2xl sm:text-4xl">
                {posts[0].userNickname}
              </h1>
              {posts[0] && (
                <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded text-sm sm:text-base">
                  Edit Profile
                </button>
              )}
              <div className="flex gap-3 sm:gap-5 mt-4">
                <p className="text-sm sm:text-base">게시물: {posts.length}</p>
                <p className="text-sm sm:text-base">
                  구독수: {posts[0].shares.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="flex border-t pt-10 border-blue-200 lg:w-[1024px] mx-auto">
        <ul className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
          {posts.map((post) => (
            <li key={post.id} className="border">
              <div>
                {post.imageUrl ? (
                  <p className="flex justify-center items-center:">
                    <img
                      src={post.imageUrl}
                      alt="Post image"
                      className="w-full h-96 object-cover mb-2.5"
                    />
                  </p>
                ) : (
                  <p className="flex justify-center items-center">
                    <FcRemoveImage className=" w-96 h-96 object-cover rounded-lg mb-2.5" />
                  </p>
                )}
                <div>
                  <h3>{post.content}</h3>
                  <p>좋아요 수: {post.likes.length}</p>
                  <p>공유 수: {post.shares.length}</p>
                  <p>위치: {posts[0].lo.address || "위치 정보 없음"}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProfileLayout;
