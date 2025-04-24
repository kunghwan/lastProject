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
import { IoLocationSharp } from "react-icons/io5";
import { IoIosSearch } from "react-icons/io";
import { AUTH } from "@/contextapi/context";
import Loaiding from "../Loading/page";
import { getDownloadURL, uploadBytes } from "firebase/storage";

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
  const [address, setAddress] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [juso, setJuso] = useState<Location>({
    latitude: 0,
    longitude: 0,
    address: "",
  });

  const [isJusoShowing, setIsJusoShowing] = useState(false);
  const [isJusoUlShowing, setIsJusoUlShowing] = useState(false);
  const navi = useRouter();
  const [isPending, startTransition] = useTransition();
  const titleRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const jusoRef = useRef<HTMLInputElement>(null);

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

  const onChangeFiles = useCallback(
    (items: FileList) => {
      for (const file of items) {
        setFiles((prev) => [...prev, file]);
      }
    },
    [files]
  );
  const searchAddress = useCallback(
    async (query: string) => {
      const res = await fetch(
        `https://dapi.kakao.com/v2/local/search/keyword.json?query=${query}`,
        {
          method: "GET",
          headers: {
            Authorization: `KakaoAK ${process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY}`,
          },
        }
      );
      const data = await res.json();
      console.log(data, 79);
      setSearchResults(data.documents);
    },
    [searchResults]
  );

  const onSubmit = useCallback(
    (e) => {
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

      startTransition(async () => {
        try {
          if (!user) {
            alert("로그인 후 사용해주세요.");
            return navi.push("/singin");
          }
          const imgUrls: string[] = [];
          for (const file of files) {
            const imgRef = storageService.ref(`${user.uid}/post/${v4()}`);
            await uploadBytes(imgRef, file);
            const url = await getDownloadURL(imgRef);
            imgUrls.push(url);
          }

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
            className={twMerge("w-full ", input)}
            placeholder="태그를 입력후 추가버튼을 눌러주세요."
          />
          <button
            type="button"
            onClick={() => {
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
            className=" min-w-20 flex-1 rounded bg-[rgba(116,212,186)]"
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
                  className="cursor-pointer font-extrabold"
                >
                  {t.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex gap-x-2 items-center">
            {juso.address.length > 0 && (
              <label className=" flex w-full border bg-emerald-100 p-2.5 rounded items-center  border-gray-400 dark:text-gray-900">
                <span>
                  <IoLocationSharp className="text-2xl" />
                </span>
                {juso.address}
              </label>
            )}

            {isJusoShowing && (
              <div>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("다시 검색하시겠습니까?")) {
                      setJuso({
                        latitude: 0,
                        longitude: 0,
                        address: "",
                      });
                      setSearchResults([]);
                      setAddress("");
                      return setIsJusoShowing(false);
                    } else {
                      return alert("취소되었습니다.");
                    }
                  }}
                  className={twMerge(
                    "border border-gray-400 p-2.5 rounded bg-gray-100 flex-1 min-w-20 cursor-pointer"
                  )}
                >
                  다시검색
                </button>
              </div>
            )}
          </div>
          {!isJusoShowing && (
            <div>
              <div className="flex gap-x-2">
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={twMerge("w-full ", input)}
                  ref={jusoRef}
                  placeholder="주소를 입력후 검색버튼을 눌러주세요."
                />
                <button
                  type="button"
                  onClick={() => {
                    searchAddress(address);
                    setIsJusoUlShowing(true);
                    return setIsJusoShowing(true);
                  }}
                  className="flex justify-center items-center flex-1 rounded bg-[rgba(116,212,186)] min-w-20"
                >
                  <IoIosSearch className="text-3xl font-bold" />
                </button>
              </div>
            </div>
          )}
          {isJusoUlShowing && (
            <ul className="mt-2 flex flex-col gap-y-2 bg-gray-50 border border-gray-400  rounded p-2.5 max-h-50 overflow-y-auto">
              {searchResults.map((item) => (
                <li
                  key={item.id}
                  className="cursor-pointer bg-white rounded gap-y-2.5 hover:underline border p-1.5 hover:text-green-800 "
                  onClick={() => {
                    setJuso({
                      address: item.address_name,
                      latitude: Number(item.y),
                      longitude: Number(item.x),
                    });
                    setSearchResults([]);
                    setIsJusoUlShowing(false);
                    return setAddress(item.address_name);
                  }}
                >
                  {item.address_name}
                  {item.place_name}
                </li>
              ))}
            </ul>
          )}
        </div>
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
