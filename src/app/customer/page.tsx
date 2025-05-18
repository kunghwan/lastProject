"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { TiPlus } from "react-icons/ti";
import { IoClose } from "react-icons/io5";
import { LuMailPlus } from "react-icons/lu";
import { IoSearchOutline } from "react-icons/io5";
import { twMerge } from "tailwind-merge";
import { AiOutlineQuestionCircle } from "react-icons/ai";

interface QnA {
  question: string;
  answer: string[];
}
const QnaPage = () => {
  //useState로 상태 관리(openQuestion 상태를 추가하여 현재 열려 있는 질문을 관리,null이면 아무 질문도 열려 있지 않은 상태)
  const [isanswerShowing, setIsanswerShowing] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const qnaRef = useRef<HTMLInputElement>(null);
  //클릭한 질문이 이미 열려 있으면 닫고, 그렇지 않으면 해당 질문을 엽니다.
  //"isanswerShowing과 item.question이 같은지"를 비교한 결과로 true 또는 false가 나오는 것
  const toggleQuestion = useCallback(
    (question: string) => {
      setIsanswerShowing((prev) => (prev === question ? null : question));
    },
    [isanswerShowing]
  );

  //! 검색어가 포함된 질문만 필터링
  //Todo: includes() → 문자열 안에 다른 문자열이 들어있는지 확인하는 함수
  const filteredQna = qna.filter((item) => item.question.includes(searchTerm));

  useEffect(() => {
    qnaRef.current?.focus();
  }, []);

  //! esc키를 누르면 닫히게하기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsanswerShowing(null);
        return setIsModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="mt-5  relative min-h-full  hsecol gap-y-2.5 px-5  ">
      <div className=" flex gap-x-1 ">
        <div className="relative z-[2]   max-w-full   mx-auto [@media(max-width:375px)]:mx-0">
          <input
            type="text"
            placeholder="어떤 질문을 찾고 계신가요?"
            ref={qnaRef}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className=" outline-none min-w-80 [@media(max-width:360px)]:min-w-70 focus:border-primary max-w-96 p-2.5  sm:w-4/5  rounded-full border bg-white dark:bg-zinc-700 dark:placeholder:text-gray-100 border-gray-500 dark:border-white dark:text-white [@media(max-width:344px)]:p-2 placeholder-gray-400"
          />
          <IoSearchOutline className=" absolute hover:text-[rgba(151,218,200)] dark:hover:text-[rgba(151,218,200,0.5)] right-5 [@media(max-width:375px)]:right-0 [@media(max-width:375px)]:left-70 [@media(max-width:344px)]:text-md [@media(max-width:360px)]:hidden top-1/2 -translate-y-1/2 text-green-950 dark:text-white text-3xl" />
        </div>
        <div
          onClick={() => setIsModalOpen(true)}
          className={twMerge(
            "relative z-[2] group flex items-center justify-center w-12 h-12  hover:bg-gray-50 dark:hover:bg-zinc-700 hover:text-primary  rounded-xl cursor-pointer"
          )}
        >
          <AiOutlineQuestionCircle className="text-2xl [@media(max-width:375px)]:text-xl text-gray-300 dark:text-gray-400 group-hover:text-primary " />
          <div className="absolute top-full mt-1 z-30 left-1/2 -translate-x-1/2  border border-gray-100  dark:border-gray-800 hidden group-hover:block bg-emerald-50 dark:bg-[#35423a] text-xs text-zinc-600 dark:text-gray-300 px-2 py-1  rounded whitespace-nowrap">
            방방콕콕이란?
          </div>
        </div>
      </div>
      {isModalOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-white/60 dark:bg-zinc-900/60 "
          onClick={() => setIsModalOpen(false)}
        >
          {/* w-11/12 전체 가로폭(width)의 약 91.6%  */}
          <div
            onClick={(e) => e.stopPropagation()} // 이벤트 전파 방지
            className="hsecol z-50 justify-center items-center bg-white border border-gray-200 dark:border-zinc-700 dark:bg-zinc-800 p-6 rounded shadow-lg w-11/12 max-w-sm md:max-w-xl relative [@media(max-width:375px)]:max-w-xs"
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 text-xl "
            >
              <IoClose />
            </button>
            <h2 className="text-lg md:text-xl font-bold mb-2">방방콕콕이란?</h2>
            <p className="qnamodalp">
              방방콕콕은 대전의 여행장소를 올리는 sns입니다!
            </p>
            <p className="qnamodalp">
              대전의 추천장소와 정보를 확인할 수 있습니다.
            </p>
            <p className="qnamodalp">
              다녀온 장소에 대한 글을 올려 다른 유저에게 추천해 보세요!
            </p>
          </div>
        </div>
      )}
      <hr className="mb-2 text-gray-300" />
      <div className="z-[4] mt-1">
        <ul className="">
          {filteredQna.length === 0 && (
            <li className="text-gray-800 dark:text-white">
              <p className="flex  justify-center min-h-50 font-bold items-center text-2xl">
                검색 결과가 없습니다.
              </p>
            </li>
          )}
          {filteredQna.map((item) => (
            <li key={item.question} className=" hsecol mb-2 w-full ">
              <button
                onClick={() => toggleQuestion(item.question)}
                className={twMerge(
                  "hover:underline text-xs sm:text-sm text-left font-bold text-white flex justify-between items-center p-2.5 rounded bg-green-300 focus:bg-primary dark:bg-[rgba(151,218,200,0.5)] md:text-xl cursor-pointer dark:text-gray-300",
                  isanswerShowing === item.question && "rounded-b-none"
                )}
              >
                <p> Q. {item.question}</p>
                <span>
                  {isanswerShowing === item.question ? (
                    <IoClose className="text-2xl font-bold " />
                  ) : (
                    <TiPlus className="text-2xl" />
                  )}
                </span>
              </button>
              {/*조건부 렌더링: openQuestion === item.question일 때만 답변을 표시합니다.
               */}
              {/* isanswerShowing에 저장된 질문이랑 아이템의 질문이랑 같으면 true */}
              {isanswerShowing === item.question && (
                <div
                  className={twMerge(
                    "hsecol border-t-2 border-gray-100 gap-y-1.5 text-xs  dark:text-white text-gray-700 rounded rounded-t-none p-2.5 bg-emerald-100 dark:bg-[rgba(240,255,251,0.5)] md:text-[16px] "
                  )}
                >
                  {item.answer.map((text, index) => (
                    <div key={index}>{text}</div>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 font-bold hsecol items-center     w-full xl:mb-16">
        <p className="text-gray-500 dark:text-white text-[13px] md:text-xl">
          추가로 질문사항이 있으시면
        </p>
        <div className="z-[4] flex  text-[13px] text-gray-500 dark:text-white  md:text-xl [@media(max-width:360px)]:text-[12px]">
          <a
            href="https://mail.naver.com/write?to=test@test.com"
            target="_blank"
            rel="noopener noreferrer" //!링크를 클릭할 때 생길 수 있는 보안 문제를 막기 위한 설정 //위험: 새 창이 부모 창을 조작할 수 있음
            className=" group flex gap-x-1 items-center  text-green-800 font-bold hover:underline dark:text-green-200 "
          >
            <LuMailPlus className=" opacity-0 group-hover:opacity-100 transition-opacity " />
            test@test.com
          </a>
          <p>으로 메일을 보내주시면 감사하겠습니다.</p>
        </div>
      </div>
      {/* 빈화면을 눌러도 닫히게 코드 추가 z를 0주고 나머지 요소들은 위로 보이게 z를 3을 줌 */}
      <span
        className=" w-full absolute size-full top-0 left-0 z-0"
        onClick={() => setIsanswerShowing(null)}
      />
    </div>
  );
};

export default QnaPage;

const qna: QnA[] = [
  {
    question: "알림을 한번에 읽는 방법은 없나요?",
    answer: [
      "알림페이지에 들어가시면 안읽은 알림이 있다면 맨 위에 모두읽기버튼이 있습니다. ",
      "그 버튼을 클릭하시면 알림이 한번에 다 읽을 수 있습니다.",
    ],
  },
  {
    question: "동영상은 못 올리나요?",
    answer: [
      "지금은 이미지랑 gif만 올릴 수 있습니다.",
      "동영상은 추후 추가 예정입니다.",
    ],
  },
  {
    question: "게시글 작성시에 태그 추가가 안되요.",
    answer: ["태그를 작성하시고 추가버튼을 눌러야지만 태그가 추가가 됩니다."],
  },
  {
    question: "게시글을 올릴때 정확한 주소를 다 알고 있어야 하나요?",
    answer: [
      "주소검색창에 장소명만 입력해도 목록이 뜹니다.",
      " 그 중에 원하시는 주소를 클릭하시면 됩니다.",
    ],
  },
  {
    question: "게시물작성시 추가한 태그를 삭제하고 싶어요.",
    answer: ["추가하신 태그를 클릭시 삭제가됩니다."],
  },
  {
    question: "추천장소로 들어가니까 장소가 바로안나와요.",
    answer: [
      "많은양의 데이터를 부르고 있어서 그 데이터들을 다 부르는데 시간이 걸립니다.",
    ],
  },
  {
    question: "회원가입시 닉네임은 중복되나요?",
    answer: [
      "유감스럽지만 회원가입시 닉네임중복은 안됩니다. ",
      "각자의 다른 닉네임을 설정하세요.",
    ],
  },
  {
    question: "대전말고 다른지역은 안되나요?",
    answer: ["추후 개발및 추가할 예정입니다. "],
  },
  {
    question: "업로드한 이미지가 정상적으로 보이지 않나요?",
    answer: [
      "권장 사이즈로 업로드해 주세요! (권장 이미지 크기: 480px X 300px) ",
      "보다 선명하고 전체가 보이게 표시됩니다.",
    ],
  },
];
