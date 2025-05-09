"use client";

import { Tag } from "@/types/post";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { twMerge } from "tailwind-merge";
import { UploadPostProps } from "./UploadPage";
import { v4 } from "uuid";
import AlertModal from "../AlertModal";

interface Props {
  tag: string;
  setTag: (value: string) => void;
  tagRef: React.RefObject<HTMLInputElement | null>;
  tags: Tag[];
  post: UploadPostProps;
  setPost: React.Dispatch<React.SetStateAction<UploadPostProps>>;
  setIsTypingTag: React.Dispatch<React.SetStateAction<boolean>>;
}

const UploadTag = ({
  post,
  setPost,
  setTag,
  tag,
  tagRef,
  tags,
  setIsTypingTag,
}: Props) => {
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [focusTarget, setFocusTarget] = useState<"tag" | null>(null);

  const tagMessage = useMemo(() => {
    const validateText = /^[\p{L}\p{N}\s]+$/u;

    if (tag.trim() === "") {
      return "공백은 입력이 안됩니다";
    }
    if (!validateText.test(tag)) {
      return "특수기호를 포함하면 안됩니다.";
    }
    if (tag.length === 0) {
      return "태그를 입력해 주세요.";
    }

    return null;
  }, [tag]);

  const onClickTag = useCallback(() => {
    console.log("tagMessage value:", tagMessage);
    if (tagMessage) {
      setAlertMessage(tagMessage);
      setFocusTarget("tag");
      return;
    }

    const formattedTag = tag.startsWith("#") ? tag : `#${tag}`;
    const newTag: Tag = {
      id: v4(),
      name: formattedTag,
    };

    if (tags.find((t) => t.name === newTag.name)) {
      setAlertMessage("이미 존재하는 태그입니다.");
      setFocusTarget("tag");
      return;
    }
    setPost((prev) => ({
      ...prev,
      tags: [...prev.tags, newTag],
    }));

    return setTag("");
  }, [tagMessage, tags, post, tag]);

  useEffect(() => {
    if (alertMessage === null && focusTarget === "tag") {
      setTimeout(() => {
        tagRef.current?.focus();
        setFocusTarget(null);
      }, 0);
    }
  }, [alertMessage, focusTarget]);

  return (
    <>
      <div>
        {alertMessage != null && (
          <AlertModal
            message={alertMessage}
            onClose={() => setAlertMessage(null)}
          />
        )}
        <label
          htmlFor="tags"
          className=" font-bold text-md text-gray-500 dark:text-white"
        >
          태그
        </label>
        <div className="flex gap-x-2">
          <input
            id="tags"
            type="text"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            ref={tagRef}
            className={twMerge("w-full upPostInput shadow-sm")}
            placeholder="입력후 추가버튼 또는 스페이스를 눌러주세요."
            onKeyDown={(e) => {
              const { key } = e;
              if (key === "Enter") {
                //React에서 setState는 비동기로 처리되기 때문에, 렌더링이 끝나기 전까지 <AlertModal /> 조건부 렌더링이 반응하지 않을 수 있음 =>setTimeout(() => ...)으로 defer 처리하면 렌더링 큐가 정리된 뒤 실행되어 modal이 보장됨
                setTimeout(() => onClickTag(), 0);
              } else if (key === " ") {
                if (!e.nativeEvent.isComposing) {
                  onClickTag();
                }
              }
            }}
            onFocus={() => setIsTypingTag(true)}
            onBlur={() => setIsTypingTag(false)}
          />
          <button
            type="button"
            onClick={onClickTag}
            className={twMerge(
              "hover:bg-[rgba(116,212,186,0.7)] hover:shadow-md min-w-20 flex-1 rounded bg-[rgba(116,212,186)] dark:bg-[rgba(116,212,186,0.5)] dark:text-white "
            )}
          >
            추가
          </button>
        </div>
      </div>
      <div>
        <ul className="flex gap-x-2 items-center flex-wrap">
          {tags.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => {
                  return setPost((prev) => ({
                    ...prev,
                    tags: prev.tags.filter((tag) => tag.id !== t.id),
                  }));
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
