"use client";
import { Post, Tag } from "@/types/post";
import { useEffect, useState } from "react";
import { IoSettingsOutline } from "react-icons/io5";
import ProfileFeed from "./ProfileFeed";
import { getUserNickname } from "@/app/profile/page";
import FollowButton from "../post/FollowButton";
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

    console.log(posts[0]);

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


  const getRandomColor = () => {
    let red = Math.floor(Math.random() * 256);
    let green = Math.floor(Math.random() * 256);
    let blue = Math.floor(Math.random() * 256);
    return `rgb(${red}, ${green}, ${blue})`;
  };


  return (
    <div className="flex flex-col w-full h-screen">
      {!isSmallScreen ? (
        <div className="flex flex-col mx-auto">
          <div className="flex m-5 mb-0 pr-20 pl-20 gap-2.5 justify-center ">
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
                <h1 className="font-medium text-4xl p-1 hover:scale-103 hover:animate-pulse transition-all relative inline-block cursor-pointer after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-current after:transition-width after:duration-300 hover:after:w-full">
                  {nickname || `${posts[0]?.userNickname || `MyProfile`}`}
                </h1>
                {isMyPage ? (
                  <button
                    type="button"
                    className="text-2xl hover:animate-spin hover:scale-105 cursor-pointer p-2.5 active:text-gray-800 hover:text-gray-400"
                  >
                    <IoSettingsOutline />
                  </button>
                ) : (

                  <button>
                    <FollowButton
                      followingId={posts[0].uid}
                      followNickName={posts[0].userNickname}
                    />
                  </button>
                )}

                {/*

                {isMyPage ? (

                  <button className="text-2xl hover:animate-spin hover:scale-105  cursor-pointer p-2.5 active:text-gray-800  hover:text-gray-400">
                    <IoSettingsOutline />
                  </button>
                ) : (
                  <button className="text-2xl cursor-pointer  ">
                    <FollowButton followingId={posts[0]?.uid} />
                  </button>
                )} */}
=======
                  <button type="button">
                    <FollowButton
                      followingId={posts[0].uid}
                      follwingNickname={posts[0].userNickname}
                    />
                  </button>

              </p>
              <div className="flex ml-2.5 gap-5 ">
                <p className="flex gap-2.5 p-2.5 hover:scale-103 hover:animate-pulse transition-all cursor-pointer active:text-gray-800 ">
                  게시물 <span>{actualPostCount}</span>
                </p>
                <p className="flex gap-2.5 p-2.5 hover:scale-103 hover:animate-pulse transition-all cursor-pointer active:text-gray-800 ">
                  구독수 <span>{posts[0]?.shares?.length || 0}</span>
                </p>
              </div>
            </div>
          </div>
          <div className="flex text-2xl p-2.5 ml-30 mr-30">
            <ul className="flex gap-2.5 ">
              {tags.map((tag) => (
                <li key={tag.id}>
                  <button
                    style={{
                      color: getRandomColor(),
                    }}
                    className="p-2.5 hover:animate-pulse transition-all relative inline-block cursor-pointer after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-current after:transition-width after:duration-300 hover:after:w-full"
                  >
                    #{tag.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-screen mx-auto overflow-hidden">
          <div className="flex  justify-center mt-5">
            <div className="relative w-32 h-32 ">
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
            {isMyPage ? (
              <button className="text-2xl absolute right-30 sm:right-50 hover:animate-spin hover:scale-105 cursor-pointer p-2.5 active:text-gray-800 hover:text-gray-400">
                <IoSettingsOutline />
              </button>
            ) : (
              <button className="absolute right-20 sm:right-40 hover:scale-105 cursor-pointer p-2.5 active:text-gray-800 hover:text-gray-400">
                <FollowButton
                  followingId={posts[0].uid}
                  follwingNickname={posts[0].userNickname}
                />
              </button>
            )}
          </div>
          <div className="flex flex-col justify-center items-center">
            <h1 className="font-medium text-2xl p-1 hover:scale-103 hover:animate-pulse transition-all relative inline-block cursor-pointer after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-current after:transition-width after:duration-300 hover:after:w-full">
              {nickname || `${posts[0]?.userNickname || `MyProfile`}`}
            </h1>
            <div className="flex flex-1 justify-center mx-auto">
              <div className="flex gap-5 ">
                <p className="flex gap-2.5 p-2.5 hover:scale-103 hover:animate-pulse transition-all cursor-pointer active:text-gray-800 ">
                  게시물 <span>{actualPostCount}</span>
                </p>
                <p className="flex gap-2.5 p-2.5 hover:scale-103 hover:animate-pulse transition-all cursor-pointer active:text-gray-800 ">
                  구독수 <span>{posts[0]?.shares?.length || 0}</span>
                </p>
              </div>
            </div>
            <div>
              <ul className="flex gap-2.5 ">
                {tags.map((tag) => (
                  <li key={tag.id}>
                    <button className="p-2.5 hover:animate-pulse transition-all relative inline-block cursor-pointer after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-current after:transition-width after:duration-300 hover:after:w-full">
                      #{tag.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col items-center justify-center">
        {posts?.length > 1 ? (
          <ProfileFeed posts={posts} isMyPage={isMyPage} />
        ) : (
          <div className="flex border-t pt-10 border-blue-200 w-full justify-center">
            <div className="text-gray-800 text-xl mt-30 animate-bounce">
              게시물이 없습니다
            </div>
          </div>
        )}
      </div>
    </div>
    // <div>
    //   {posts.map((post) => (
    //     <div key={post.id} className="post-item">
    //       <h2>{post.title}</h2> {/* 게시물 제목 */}
    //       <p>{post.content}</p> {/* 게시물 내용 */}
    //       <img
    //         src={post.imageUrl}
    //         alt={post.title}
    //         className="post-image"
    //       />{" "}
    //       {/* 게시물 이미지 */}
    //       <p>작성자: {post.userNickname}</p> {/* 작성자 닉네임 */}
    //       <p>좋아요 수: {post.likes.length}</p> {/* 좋아요 수 */}
    //       <p>공유 수: {post.shares.length}</p> {/* 공유 수 */}
    //       <p>북마크 수: {post.bookmarked.length}</p> {/* 북마크 수 */}
    //       <p>작성일: {new Date(post.createdAt).toLocaleDateString()}</p>{" "}
    //       {/* 작성일 */}
    //     </div>
    //   ))}
    // </div>
  );
};
export default ProfileLayout;
const defaultImgUrl =
  "https://i.pinimg.com/1200x/3e/c0/d4/3ec0d48e3332288604e8d48096296f3e.jpg";
