"use client";
import React, { useState } from "react";

const UploadPostPage = () => {
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tag, setTag] = useState("");
  return (
    <div>
      <div>
        <h1>새글작성</h1>
        <form
          action=""
          onSubmit={(e) => e.preventDefault()}
          className="flex flex-col gap-2"
        >
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border"
            placeholder="제목을 입력하세요."
          />
          <textarea
            name=""
            id=""
            placeholder="소개하고 싶은 관광지의 소개글이나 리뷰를 작성해주세요."
            className="border "
          ></textarea>

          <input
            type="text"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            onKeyDown={(e) => {
              const { key, nativeEvent } = e;
              if (key === "Enter" && !nativeEvent.isComposing) {
              }
            }}
            className="border"
            placeholder="태그를 입력하세요."
          />
          <div>
            <ul>
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
