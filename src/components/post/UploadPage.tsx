"use client";
import { Location, Post, Tag } from "@/types/post";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { twMerge } from "tailwind-merge";
import FileItem from "./FileItem";
import { serverTimestamp } from "firebase/firestore";
import { v4 } from "uuid";
import { dbService, FBCollection, storageService } from "@/lib";

import { useRouter } from "next/navigation";
import { AUTH } from "@/contextapi/context";
import { FaPencilAlt } from "react-icons/fa";
import { getDownloadURL, uploadBytes } from "firebase/storage";
import JusoComponents from "./UpoladPostJusoComponents";
import Loaiding from "../Loading";
import UploadTag from "./UploadTag";
import AlertModal from "../AlertModal";
import { TypeAnimation } from "react-type-animation";
import { useAlertModal } from "../AlertStore";

export interface UploadPostProps extends Post {
  imgs: string[];
  tags: Tag[];
}

const initialState: UploadPostProps = {
  id: "",
  uid: "",
  userNickname: "",
  userProfileImage: "",
  imageUrl: "",
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
  const [isTypingTag, setIsTypingTag] = useState(false);

  const titleRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const jusoRef = useRef<HTMLInputElement>(null);
  const tagRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const { openAlert } = useAlertModal();

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

  const tagsMessage = useMemo(() => {
    if (tags.length === 0) {
      return "태그를 추가해주세요.";
    }
  }, [tags]);

  const onChangeFiles = useCallback(
    (items: FileList) => {
      //! 사진은 최대 10개까지만 가능하게
      //Todo: files.length만 비교하거나 items.length만 본다면, 합쳐서 10개 초과하는 걸 막지 못하게 됨
      if (files.length + items.length > 10) {
        openAlert(
          "이미지 최대 갯수는 10개 입니다.",
          [
            {
              text: "확인",
              isGreen: true,
              autoFocus: true,
            },
          ],
          "알림"
        );

        return;
      }

      for (const file of items) {
        setFiles((prev) => [...prev, file]);
      }
    },
    [files, openAlert]
  );

  const onSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (isTypingTag) {
        return;
      }
      const targetRefs = [titleRef, descRef, jusoRef, tagRef];
      if (titleMessage) {
        openAlert(
          titleMessage,
          [
            {
              text: "확인",
              isGreen: true,
              autoFocus: true,
              target: 0,
            },
          ],

          "알림",
          targetRefs
        );
        return;
      }
      if (descMessage) {
        openAlert(
          descMessage,
          [
            {
              text: "확인",
              isGreen: true,
              autoFocus: true,
              target: 1,
            },
          ],

          "알림",
          targetRefs
        );
        return;
      }
      if (jusoMessage) {
        openAlert(
          jusoMessage,
          [
            {
              text: "확인",
              isGreen: true,
              autoFocus: true,
              target: 2,
            },
          ],

          "알림",
          targetRefs
        );
        return;
      }
      if (tagsMessage) {
        openAlert(
          tagsMessage,
          [
            {
              text: "확인",
              isGreen: true,
              autoFocus: true,
              target: 3,
            },
          ],

          "알림",
          targetRefs
        );
        return;
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
            createdAt: serverTimestamp(),
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

          return navi.push("/feed");
        } catch (error: any) {
          openAlert(
            `에러:${error.message}`,
            [
              {
                text: "확인",
                isGreen: true,
                autoFocus: true,
              },
            ],

            "알림"
          );
          return;
        }
      });
    },
    [
      title,
      titleMessage,
      post,
      content,
      descMessage,
      juso,
      jusoMessage,
      user,
      files,
      tagsMessage,
      navi,
      isTypingTag,
      openAlert,
    ]
  );

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  //! 마우스 휠 가로로 변경
  useEffect(() => {
    const el = scrollRef.current; //ref로 지정한 DOM 요소(예: <div ref={scrollRef}>)를 가져옴
    if (!el) return; //만약 DOM이 아직 준비 안 되었으면 아무 것도 안 하고 종료
    //! wheelevent가 발생했을 경우
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY === 0) {
        return;
      } //수직 방향 휠 스크롤이 0일 때는 아무 일도 하지 않음(즉, 스크롤이 실제로 움직였을 때만 처리)
      e.preventDefault(); //브라우저 기본 동작(세로 스크롤)을 막음
      el.scrollLeft += e.deltaY; //수직 스크롤 값(deltaY)을 가로 스크롤로 바꿔서 실행
    };
    //passive: false는 preventDefault()가 작동할 수 있도록 허용하는 설정
    el.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      //휠 이벤트를 제거해서 메모리 누수 방지
      el.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return (
    <form
      action=""
      onSubmit={onSubmit}
      className="bg-gray-50/80  dark:bg-[#484848] relative  h-full overflow-y-auto flex-1  grid grid-cols-1 gap-2 dark:text-gray-700  md:grid-cols-2 md:gap-5  max-w-300 mx-auto  p-5  border rounded-2xl shadow-sm border-gray-400 "
    >
      {isPending && <Loaiding message="게시글 등록중 ..." />}

      <div className="hsecol gap-4  ">
        {/* <h1 className=" w-fit  text-3xl font-bold text-black dark:text-white">새글작성</h1> */}
        <div className="flex gap-x-1.5 items-center">
          <FaPencilAlt className="text-3xl hover:text-green-800 dark:text-white" />
          <TypeAnimation
            sequence={[
              "새",
              500,
              "새글",
              500,
              "새글작",
              500,
              "새글작성",
              5000, //! 5초 유지
            ]}
            speed={95} //! 글자 하나씩 타이핑하는 속도 (ms). 숫자가 클수록 느림
            repeat={5} //! 애니메이션 반복 횟수 (처음 포함 총 6번 실행됨)
            className="w-fit  text-3xl font-bold text-black dark:text-white"
          />
        </div>
        <div className="hsecol gap-y-6 ">
          <div className="hsecol gap-y-1 ">
            <label
              htmlFor="title"
              className=" w-fit  font-bold text-md text-gray-500 dark:text-white"
            >
              제목
            </label>

            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) =>
                setPost((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
              className={twMerge(
                "upPostInput shadow-sm darkTextInput [@media(max-width:375px)]:placeholder:text-[0.75rem]"
              )}
              ref={titleRef}
              placeholder="제목을 입력하세요."
            />
          </div>

          <div className="hsecol gap-y-1">
            <label
              htmlFor="content"
              className=" inline-block w-fit font-bold text-md text-gray-500 dark:text-white"
            >
              소개글 or 리뷰
            </label>
            <textarea
              name=""
              id="content"
              placeholder="관광지의 소개글이나 리뷰를 작성해주세요."
              className={twMerge(
                "h-50 shadow-sm resize-none upPostInput darkTextInput [@media(max-width:375px)]:placeholder:text-[0.75rem] green-scrollbar"
              )}
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
          </div>
        </div>
        <div
          ref={scrollRef}
          className=" w-full overflow-x-auto hide-scrollbar "
        >
          <ul
            className=" flex  items-center gap-2.5 flex-nowrap scroll-smooth "
            style={{ WebkitOverflowScrolling: "touch" }} // 모바일 터치 스와이프 부드럽게
          >
            <li className="hsecol gap-y-1 items-center">
              <div className="flex   w-30">
                <p className="font-bold text-md text-gray-500  dark:text-white">
                  사진추가 (
                  <span
                    className={twMerge(
                      "text-[rgba(62,188,154)]",
                      files.length === 10 && "text-red-500"
                    )}
                  >
                    {files.length}
                  </span>
                  /10)
                </p>
              </div>
              <FileItem onChangeFiles={onChangeFiles} />
            </li>

            {files.map((file, index) => (
              <li key={index} className="mt-7 shrink-0 w-24 h-24">
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
          </ul>
        </div>
      </div>

      <div className="hsecol  gap-y-2.5 md:mt-14">
        <UploadTag
          setIsTypingTag={setIsTypingTag}
          post={post}
          setPost={setPost}
          setTag={setTag}
          tag={tag}
          tagRef={tagRef}
          tags={tags}
          submitButtonRef={submitButtonRef}
        />
        <JusoComponents
          setIsTypingTag={setIsTypingTag}
          juso={juso}
          setJuso={setJuso}
          jusoRef={jusoRef}
          submitButtonRef={submitButtonRef} //! 주소 선택 후 바로 내용인풋에 포컷스를 하기 위해서
        />
      </div>

      <div className="flex justify-end gap-x-2.5 mt-4 md:col-span-2">
        <button
          type="button"
          onClick={() => {
            openAlert(
              "취소 하시겠습니까?",
              [
                {
                  text: "확인",
                  isGreen: true,
                  autoFocus: true,
                  onClick: () => {
                    return navi.back();
                  },
                },
                {
                  text: "취소",
                  isGreen: false,
                  autoFocus: false,
                },
              ],

              "알림"
            );
            return;
          }}
          className={twMerge(
            " bg-gray-300 hover:bg-gray-200 transition duration-300  upPostButton"
          )}
        >
          취소
        </button>
        <button
          type="submit"
          ref={submitButtonRef}
          className={twMerge(
            " outline-lime-100 hover:bg-[rgba(116,212,186,0.7)]  bg-primary transition duration-300 upPostButton dark:bg-[rgba(116,212,186,0.5)] dark:text-white"
          )}
        >
          게시
        </button>
      </div>
    </form>
  );
};

export default UploadPostPage;
