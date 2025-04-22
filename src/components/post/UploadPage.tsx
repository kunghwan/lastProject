"use client";
import { Post } from "@/types/post";
import React, { useCallback, useState } from "react";
import { twMerge } from "tailwind-merge";
import FileItem from "./FileItem";

interface Tag {
  id: string;
  name: string;
}

interface UploadPostProps extends Post {
  imgs: [];
  onChangeFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteFile: () => void;
  tags: Tag[] | null;
}

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
  const [files, setFiles] = useState<File[]>([]);
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
            <ul>
              {files.map((file) => (
                <li key={file.name}>
                  <FileItem />
                </li>
              ))}
            </ul>
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
