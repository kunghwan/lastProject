"use client";
import { Post } from "@/types/post";
import React, { useCallback, useState } from "react";
import { twMerge } from "tailwind-merge";
import { FaPlus } from "react-icons/fa6";

const initialState: Post = {
  id: "",
  uid: "",
  userNickname: "",
  userProfileImage: "",
  imageUrl: null,
  content: null,
  lo: {
    latitude: 0,
    longitude: 0,
    address: "",
  },
  likes: [],
  shares: [],
  bookmarked: [],
  isLiked: false,
  createdAt: Date(),
};

const UploadPostPage = () => {
  const [post, setPost] = useState<Post>(initialState);
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tag, setTag] = useState("");
  const [desc, setDesc] = useState("");

  const onSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (title.length === 0 || title.trim() === "") {
        return alert("제목을 입력해주세요.");
      }

      try {
      } catch (error: any) {
        return alert(error.message);
      }
    },
    [title]
  );
  return (
    <div>
      <div className="bg-[rgba(250,255,254)] px-5 border h-screen">
        <h1 className="text-3xl font-bold text-black">새글작성</h1>
        <form action="" onSubmit={onSubmit} className="flex flex-col gap-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={input}
            placeholder="제목을 입력하세요."
          />
          <textarea
            name=""
            id=""
            placeholder="소개하고 싶은 관광지의 소개글이나 리뷰를 작성해주세요."
            className={twMerge("h-20", input)}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          ></textarea>

          <input
            type="text"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            onKeyDown={(e) => {
              const { key, nativeEvent } = e;
              if (key === "Enter" && !nativeEvent.isComposing) {
                const formattedTag = tag.startsWith("#") ? tag : `#${tag}`;
                setTags((prev) => [...prev, formattedTag]);
                setTag("");
              }
            }}
            className={input}
            placeholder="태그를 입력하세요."
          />
          <div>
            <ul className="flex gap-x-2">
              {tags.map((t, index) => (
                <li key={index}>
                  <button>{t}</button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <input
              type="file"
              className="border max-w-20 min-h-20 border-black  absolute opacity-0 cursor-pointer z-30"
            />
            <div className="border max-w-20 min-h-20 border-black bg-white cursor-pointer flex justify-center items-center z-10">
              <FaPlus className="text-3xl text-black " />
            </div>
          </div>

          <div className="flex">
            <button className="text-black">취소</button>
            <button className="text-black">게시</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadPostPage;

const input = "bg-white border rounded px-2";
