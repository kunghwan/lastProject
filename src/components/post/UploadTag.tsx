"use client";

import { Tag } from "@/types/post";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { twMerge } from "tailwind-merge";
import { UploadPostProps } from "./UploadPage";
import { IoIosAddCircleOutline } from "react-icons/io";
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
  submitButtonRef: React.RefObject<HTMLButtonElement | null>;
}

const UploadTag = ({
  post,
  setPost,
  setTag,
  tag,
  tagRef,
  tags,
  setIsTypingTag,
  submitButtonRef,
}: Props) => {
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [focusTarget, setFocusTarget] = useState<"tag" | null>(null);

  const tagMessage = useMemo(() => {
    const validateText = /^[\p{L}\p{N}\s]+$/u;

    if (tag.trim() === "") {
      return "공백은 입력이 안됩니다";
    }
    if ((tag.trim() === "") !== !validateText.test(tag)) {
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
        <div className="flex ">
          <input
            id="tags"
            type="text"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            ref={tagRef}
            className={twMerge(
              "w-full upPostInput rounded-r-none border-r-0 shadow-sm darkTextInput "
            )}
            placeholder="입력후 추가버튼 또는 스페이스를 눌러주세요."
            onKeyUp={(e) => {
              const { key } = e;

              if (
                (key === "Enter" || key === " ") &&
                tag.trim() === "" &&
                tags.length > 0
              ) {
                //! 공백 + 태그 있음이면 주소 인풋으로 포커스 이동
                submitButtonRef.current?.focus();
                return;
              }

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
              "bg-white border border-l-0 py-2 px-2  flex justify-center items-center rounded-r-md rounded-l-none  border-gray-400 dark:bg-[#666666]"
            )}
          >
            <IoIosAddCircleOutline className="text-2xl text-gray-500  hover:text-[rgba(116,212,186)] dark:text-white" />
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
                className=" dark:text-gray-200 cursor-pointer font-bold hover:text-green-600 hover:underline"
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
