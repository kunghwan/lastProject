"use client";

import { Tag } from "@/types/post";
import React, { useCallback, useMemo } from "react";
import { twMerge } from "tailwind-merge";
import { UploadPostProps } from "./UploadPage";
import { v4 } from "uuid";

interface Props {
  tag: string;
  setTag: (value: string) => void;
  tagRef: React.RefObject<HTMLInputElement | null>;
  tags: Tag[];
  post: UploadPostProps;
  setPost: React.Dispatch<React.SetStateAction<UploadPostProps>>;
}

const UploadTag = ({ post, setPost, setTag, tag, tagRef, tags }: Props) => {
  const tagMessage = useMemo(() => {
    const validateText = /^[\p{L}\p{N}\s]+$/u;
    if (!validateText.test(tag)) {
      return "특수기호를 포함하면 안됩니다.";
    }
    if (tag.length === 0) {
      return "태그를 입력해 주세요.";
    }
    if (tag.trim() === "") {
      return "공백은 입력이 안됩니다";
    }
  }, [tag]);

  const onClickTag = useCallback(() => {
    if (tagMessage) {
      alert(tagMessage);
      tagRef.current?.focus();
      return;
    }
    const formattedTag = tag.startsWith("#") ? tag : `#${tag}`;
    const newTag: Tag = {
      id: v4(),
      name: formattedTag,
    };

    if (tags.find((t) => t.name === newTag.name)) {
      return alert("이미 존재하는 태그입니다.");
    }
    setPost((prev) => ({
      ...prev,
      tags: [...prev.tags, newTag],
    }));
    return setTag("");
  }, [tagMessage, tags, post, tag]);

  return (
    <>
      <div className="flex gap-x-2">
        <input
          type="text"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          ref={tagRef}
          className={twMerge("w-full upPostInput")}
          placeholder="태그를 입력후 추가버튼을 눌러주세요."
        />
        <button
          type="button"
          onClick={onClickTag}
          className={twMerge(
            "hover:shadow-md min-w-20 flex-1 rounded bg-[rgba(116,212,186)] dark:bg-[rgba(116,212,186,0.5)] dark:text-white "
          )}
        >
          추가
        </button>
      </div>
      <div>
        <ul className="flex gap-x-2 items-center flex-wrap">
          {tags.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => {
                  if (confirm("삭제하시겠습니까?")) {
                    return setPost((prev) => ({
                      ...prev,
                      tags: prev.tags.filter((tag) => tag.id !== t.id),
                    }));
                  } else {
                    return alert("취소되었습니다.");
                  }
                }}
                className="cursor-pointer font-bold hover:text-lime-500 hover:underline"
              >
                {t.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default UploadTag;
