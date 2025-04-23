"use client";
import { Location, Post } from "@/types/post";
import React, { useCallback, useState } from "react";
import { twMerge } from "tailwind-merge";
import FileItem from "./FileItem";
// import { v4 } from "uuid";
import { dbService, FBCollection } from "@/lib";
import { useRouter } from "next/navigation";

interface Tag {
  id: string;
  name: string;
}

interface UploadPostProps extends Post {
  imgs: [];
  onChangeFile?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteFile?: () => void;

  tags: Tag[] | null;
}

const initialState: UploadPostProps = {
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
  imgs: [],
  tags: null,
};

const UploadPostPage = () => {
  const [post, setPost] = useState<UploadPostProps>(initialState);
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<Tag[]>([]);
  const [tag, setTag] = useState("");
  const [desc, setDesc] = useState("");
  const [juso, setJuso] = useState<Location>({
    latitude: 0,
    longitude: 0,
    address: "",
  });
  const navi = useRouter();

  const onChangeFiles = useCallback(
    (items: FileList) => {
      for (const file of items) {
        setFiles((prev) => [...prev, file]);
      }
    },
    [files]
  );

  const onSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (title.length === 0 || title.trim() === "") {
        return alert("제목을 입력해주세요.");
      }
      if (desc.length === 0 || desc.trim() === "") {
        return alert("내용을 입력해주세요.");
      }

      // try {
      //   const ref = await dbService.collection(FBCollection.POSTS).doc(post.id);
      //   const snap = await ref.set(post)
      // } catch (error: any) {
      //   return alert(error.message);
      // }
    },
    [title]
  );

  return (
    <form
      action=""
      onSubmit={onSubmit}
      className="flex-1 grid grid-cols-1 gap-2  lg:grid-cols-2 lg:gap-5 mt-5 max-w-300 mx-auto bg-[rgba(250,255,254)] dark:bg-gray-500 p-5  border h-full relative"
    >
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-black">새글작성</h1>
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
          className={twMerge("h-50 resize-none", input)}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
        <div>
          <ul className="flex items-center gap-2.5">
            {files.map((file) => (
              <li key={file.name}>
                <FileItem
                  file={file}
                  onDeleteFiles={() =>
                    setFiles((prev) =>
                      prev.filter((item) => item.name !== file.name)
                    )
                  }
                />
              </li>
            ))}
            <li>
              <FileItem onChangeFiles={onChangeFiles} />
            </li>
          </ul>
        </div>
      </div>
      <div>
        <input
          type="text"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          onKeyDown={(e) => {
            const { key, nativeEvent } = e;
            if (key === "Shift" && !nativeEvent.isComposing) {
              const formattedTag = tag.startsWith("#") ? tag : `#${tag}`;
              const newTag: Tag = {
                id: v4(),
                name: formattedTag,
              };
              if (tags.find((t) => t.name === newTag.name)) {
                return alert("이미 존재하는 태그입니다.");
              }
              setTags((prev) => [...prev, newTag]);
              setTag("");
            }
          }}
          className={twMerge("w-full ", input)}
          placeholder="태그를 입력후 shift키를 눌러주세요."
        />
        <div>
          <ul className="flex gap-x-2">
            {tags.map((t) => (
              <li key={t.id}>
                <button>{t.name}</button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 주소 컴포넌트 자리 */}

      <div className="flex justify-end gap-x-2.5 mt-4 lg:col-span-2">
        <button
          type="button"
          onClick={() => {
            if (confirm("취소하시겠습니까?")) {
              navi.back();
            } else {
              return alert("취소되었습니다.");
            }
          }}
          className={twMerge("bg-gray-300 ", button)}
        >
          취소
        </button>
        <button className={twMerge("bg-[rgba(62,188,154)]", button)}>
          게시
        </button>
      </div>
    </form>
  );
};

export default UploadPostPage;

const input = "bg-white border rounded px-2";
const button = " rounded px-2.5 py-1";
