"use client";
import React, { useCallback, useState } from "react";

const UploadPostPage = () => {
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
    },
    [title]
  );
  return (
    <div>
      <div className="bg-[rgba(250,255,254)] px-5 border">
        <h1 className="text-3xl font-bold">새글작성</h1>
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
            className={input}
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
                <li key={index}>{t}</li>
              ))}
            </ul>
          </div>

          <div className="flex">
            <button>취소</button>
            <button>게시</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadPostPage;

const input = "bg-white border rounded px-2";
