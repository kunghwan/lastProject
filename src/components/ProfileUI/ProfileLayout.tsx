"use client";

import { Post, Tag } from "@/types/post";
import { useEffect, useState } from "react";
import { IoSettingsOutline } from "react-icons/io5";
import ProfileFeed from "./ProfileFeed";
import { getUserNickname } from "@/app/profile/page";

const ProfileLayout = ({
  posts,
  isMyPage,
  tags = [],
}: {
  posts: Post[];
  isMyPage: boolean;
  tags?: Tag[];
}) => {
  const [nickname, setNickname] = useState<string | null>(null);

  useEffect(() => {
    const fetchNickname = async () => {
      const userNickname = await getUserNickname();
      setNickname(userNickname);
    };

    fetchNickname();
  }, []);

  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const actualPostCount = posts.filter((post) => post.id !== "default").length;

  return (
    <div className="flex flex-col w-full h-screen">
      {!isSmallScreen ? (
        <div className="flex flex-col m-5 mx-auto">
          <div className="flex m-10 mb-0 pr-20 pl-20 gap-2.5 justify-center ">
            <div className="relative w-40 h-40">
              <img
                src={posts[0]?.userProfileImage || defaultImgUrl}
                alt={`${nickname || "유저"}'s profile`}
                className="w-full h-full rounded-full border border-gray-300 sm:x-auto hover:scale-103 transition-all cursor-pointer"
              />
              {isMyPage && (
                <button className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-sm font-medium rounded-full opacity-0 hover:opacity-70 transition-opacity">
                  수정하기
                </button>
              )}
            </div>
            <div className="ml-10 w-120 flex-col flex flex-1 ">
              <p className="flex justify-between">
                <h1 className="font-medium text-4xl p-1 hover:scale-103 hover:animate-pulse  transition-all relative inline-block cursor-pointer after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-current after:transition-width after:duration-300 hover:after:w-full">
                  {nickname || `${posts[0]?.userNickname || `MyProfile`}`}
                </h1>
                {!posts[0] && (
                  <button className="text-2xl hover:animate-spin hover:scale-105  cursor-pointer p-2.5 active:text-gray-800  hover:text-gray-400">
                    <IoSettingsOutline />
                  </button>
                )}
              </p>
              <div className="flex ml-2.5 gap-5 ">
                <p className="flex gap-2.5 p-2.5  hover:scale-103 hover:animate-pulse  transition-all cursor-pointer active:text-gray-800 ">
                  게시물 <p>{actualPostCount}</p>
                </p>
                <p className="flex gap-2.5 p-2.5  hover:scale-103 hover:animate-pulse  transition-all cursor-pointer active:text-gray-800 ">
                  구독수 <p>{posts[0]?.shares?.length || 0}</p>
                </p>
              </div>
              <p className="relative inline-block cursor-pointer after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-blue-500 after:transition-all after:duration-500 hover:after:w-full">
                Lorem, ipsum dolor sit amet consectetur adipisicing elit.
                Laborum dolore quos vero quia, cum exercitationem ullam? Quasi
                facere repellat aliquid! Iusto doloremque sint tempore dolore
                qui eligendi aliquid placeat earum.
              </p>
            </div>
          </div>
          <div className="flex text-2xl p-2.5 ml-30 mr-30">
            <ul className="flex gap-2.5 ">
              {tags.map((tag) => (
                <li key={tag.id}>
                  <button className="p-2.5 hover:animate-pulse transition-all relative inline-block cursor-pointer after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-current after:transition-width after:duration-300 hover:after:w-full">
                    #{tag.content}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="flex flex-col m-5 sm:m-10 mx-auto">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-10">
            <img
              src={posts[0]?.userProfileImage || defaultImgUrl}
              alt={`${nickname || "유저"}'s profile`}
              className="w-24 h-24 sm:w-40 sm:h-40 rounded-full bg-gray-600 object-cover"
            />
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
              <h1 className="font-medium text-2xl sm:text-4xl hover:animate-pulse transition-all cursor-pointer">
                {nickname || `${posts[0]?.userNickname || `MyProfile`}`}
              </h1>

              <div className="flex gap-3 sm:gap-5 mt-4">
                <p className="text-sm sm:text-base">게시물 {actualPostCount}</p>
                <p className="text-sm sm:text-base">
                  구독수 {posts[0]?.shares?.length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col items-center justify-center">
        {posts?.length > 1 ? (
          <ProfileFeed posts={posts} isMyPage={isMyPage} />
        ) : (
          <div className="flex border-t pt-10 border-blue-200 sm:w-[1024px]  mx-auto justify-center">
            <div className="text-gray-800 text-xl mt-30 animate-bounce">
              게시물이 없습니다.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileLayout;

const defaultImgUrl =
  "https://i.pinimg.com/1200x/3e/c0/d4/3ec0d48e3332288604e8d48096296f3e.jpg";
