"use client";
import { Location, Post, Tag } from "@/types/post";
import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { twMerge } from "tailwind-merge";
import FileItem from "./FileItem";

import { v4 } from "uuid";
import { dbService, FBCollection, storageService } from "@/lib";

import { useRouter } from "next/navigation";
import { AUTH } from "@/contextapi/context";

import { getDownloadURL, uploadBytes } from "firebase/storage";
import JusoComponents from "./UpoladPostJusoComponents";
import Loaiding from "../Loading";

interface UploadPostProps extends Post {
  imgs: string[];
  tags: Tag[];
}

const initialState: UploadPostProps = {
  id: "",
  uid: "",
  userNickname: "",
  userProfileImage: "",
  imageUrl: null,
  title: "",
  content: "",
  lo: {
    latitude: 0,
    longitude: 0,
    address: "",
  },
  likes: [],
  shares: [],
  bookmarked: [],
  isLiked: false,
  createdAt: new Date().toLocaleString(),
  imgs: [],

  tags: [],
};

const UploadPostPage = () => {
  const { user } = AUTH.use();
  const [post, setPost] = useState<UploadPostProps>(initialState);
  const { content, title, tags } = post;
  const [files, setFiles] = useState<File[]>([]);

  const [tag, setTag] = useState("");

  const [juso, setJuso] = useState<Location>({
    latitude: 0,
    longitude: 0,
    address: "",
  });

  const navi = useRouter();
  const [isPending, startTransition] = useTransition();
  const titleRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const jusoRef = useRef<HTMLInputElement>(null);
  const tagRef = useRef<HTMLInputElement>(null);

  const titleMessage = useMemo(() => {
    if (title.length === 0 || title.trim() === "") {
      return "제목을 입력해주세요.";
    }
  }, [title]);
  const descMessage = useMemo(() => {
    if (content.length === 0 || content.trim() === "") {
      return "내용을 입력해주세요.";
    }
  }, [content]);

  const jusoMessage = useMemo(() => {
    if (juso.address.length === 0 || juso.address.trim() === "") {
      return "주소를 입력해주세요.";
    }
  }, [juso]);

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

  const tagsMessage = useMemo(() => {
    if (tags.length === 0) {
      return "태그를 추가해주세요.";
    }
  }, [tags]);

  const onChangeFiles = useCallback(
    (items: FileList) => {
      for (const file of items) {
        setFiles((prev) => [...prev, file]);
      }
    },
    [files]
  );

  const onSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (titleMessage) {
        alert(titleMessage);
        return titleRef.current?.focus();
      }
      if (descMessage) {
        alert(descMessage);
        return descRef.current?.focus();
      }
      if (jusoMessage) {
        alert(jusoMessage);
        return jusoRef.current?.focus();
      }
      if (tagsMessage) {
        alert(tagsMessage);
        return tagRef.current?.focus();
      }

      startTransition(async () => {
        try {
          if (!user) {
            alert("로그인 후 사용해주세요.");
            return navi.push("/singin");
          }
          const imgUrls: string[] = [];
          //1. 파일을 Firebase Storage에 업로드
          for (const file of files) {
            const imgRef = storageService.ref(`${user.uid}/post/${v4()}`);
            await uploadBytes(imgRef, file);
            const url = await getDownloadURL(imgRef);
            imgUrls.push(url);
          }
          //2. Firestore에 새 게시글 추가 (add 사용)
          await dbService.collection(FBCollection.POSTS).add({
            uid: user.uid,
            imageUrl: imgUrls[0] || null, // 대표 이미지
            imgs: imgUrls,
            content: content,
            title: title,
            lo: {
              latitude: juso.latitude,
              longitude: juso.longitude,
              address: juso.address,
            },
            likes: [],
            shares: [],
            bookmarked: [],
            isLiked: false,
            createdAt: new Date().toLocaleString(),
            tags: post.tags,
            userNickname: user.nickname,
            userProfileImage: user.profileImageUrl,
          } as UploadPostProps);

          alert("게시물이 성공적으로 등록되었습니다!");
          //게시된후 초기화
          setTag("");
          setPost(initialState);
          setJuso({
            latitude: 0,
            longitude: 0,
            address: "",
          });
          setFiles([]);
          return navi.back(); // 게시 후  이동
        } catch (error: any) {
          return alert(`에러:${error.message}`);
        }
      });
    },
    [title, titleMessage, post, content, descMessage, juso, jusoMessage, user]
  );

  return (
    <form
      action=""
      onSubmit={onSubmit}
      className="flex-1 grid grid-cols-1 gap-2 dark:text-gray-700  lg:grid-cols-2 lg:gap-5 mt-5 max-w-300 mx-auto bg-[rgba(250,255,254)] dark:bg-gray-500 p-5  border rounded border-gray-400 h-full relative"
    >
      {isPending && <Loaiding />}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-black">새글작성</h1>
        <input
          type="text"
          value={title}
          onChange={(e) =>
            setPost((prev) => ({
              ...prev,
              title: e.target.value,
            }))
          }
          className={input}
          ref={titleRef}
          placeholder="제목을 입력하세요."
        />
        <textarea
          name=""
          id=""
          placeholder="소개하고 싶은 관광지의 소개글이나 리뷰를 작성해주세요."
          className={twMerge("h-50 resize-none", input)}
          value={content}
          ref={descRef}
          // 변경은 post는 객체라서 전개연산자 사용후 content만 변경
          onChange={(e) =>
            setPost((prev) => ({
              ...prev,
              content: e.target.value,
            }))
          }
        />
        <div>
          <ul className="flex items-center gap-2.5">
            {files.map((file) => (
              <li key={file.name}>
                <FileItem
                  file={file}
                  // 파일을 삭제하기 위해 onDeleteFiles를 사용
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

      <div className="flex flex-col gap-2 lg:mt-11">
        <div className="flex gap-x-2">
          <input
            type="text"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            ref={tagRef}
            className={twMerge("w-full ", input)}
            placeholder="태그를 입력후 추가버튼을 눌러주세요."
          />
          <button
            type="button"
            onClick={() => {
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
            }}
            className=" min-w-20 flex-1 rounded bg-[rgba(116,212,186)] cursor-pointer"
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

        <JusoComponents juso={juso} setJuso={setJuso} jusoRef={jusoRef} />
      </div>

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

const input = "bg-white border rounded px-2 py-2 border-gray-400";
const button = " rounded px-2.5 py-1 cursor-pointer";
