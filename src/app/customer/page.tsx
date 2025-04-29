"use client";

import React, { useCallback, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
interface QnA {
  question: string;
  answer: string[];
}
const QnaPage = () => {
  //useState로 상태 관리(openQuestion 상태를 추가하여 현재 열려 있는 질문을 관리,null이면 아무 질문도 열려 있지 않은 상태)
  const [isanswerShowing, setIsanswerShowing] = useState<string | null>(null);
  //클릭한 질문이 이미 열려 있으면 닫고, 그렇지 않으면 해당 질문을 엽니다.
  const toggleQuestion = useCallback(
    (question: string) => {
      setIsanswerShowing((prev) => (prev === question ? null : question));
    },
    [isanswerShowing]
  );

  return (
    <div className="mt-5 relative h-screen flex flex-col gap-y-2.5 ">
      <div className="z-50">
        <ul className="px-2">
          {qna.map((item) => (
            <li key={item.question} className="flex flex-col mb-2 w-full">
              <button
                onClick={() => toggleQuestion(item.question)}
                className="text-sm text-left font-bold  flex justify-between items-center p-2.5 rounded bg-[rgba(151,218,200)] dark:bg-[rgba(151,218,200,0.5)] md:text-xl cursor-pointer"
              >
                <p> {item.question}</p>
                <span>
                  {isanswerShowing === item.question ? (
                    <IoClose className="text-2xl font-bold " />
                  ) : (
                    <FaPlus className="text-lg" />
                  )}
                </span>
              </button>
              {/*조건부 렌더링: openQuestion === item.question일 때만 답변을 표시합니다.
               */}
              {isanswerShowing === item.question && (
                <div className="mt-1 flex flex-col gap-y-1.5 text-sm text-gray-600 rounded p-2.5 bg-[rgba(240,255,251)] dark:bg-[rgba(240,255,251,0.5)] md:text-xl dark:text-white">
                  {item.answer[0]}
                  <div className="text-sm md:text-xl">{item.answer[1]}</div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className=" md:text-xl font-bold flex flex-col justify-end items-center  ">
        <p>추가로 질문사항이 있으시면 </p>
        <p className="z-50">
          <a
            href="mailto:test@test.com"
            className="text-green-800 font-bold hover:underline dark:text-green-200 "
          >
            test@test.com
          </a>
          으로 메일을 보내주시면 감사하겠습니다.
        </p>
      </div>
      {/* 빈화면을 눌러도 닫히게 코드 추가 z를 0주고 나머지 요소들은 위로 보이게 z를 50을 줌 */}
      <span
        className=" w-full absolute size-full top-0 left-0 z-0"
        onClick={() => setIsanswerShowing(null)}
      />
    </div>
  );
};

export default QnaPage;

export const qna: QnA[] = [
  {
    question: "알림을 한번에 읽는 방법은 없나요?",
    answer: [
      "알림페이지에 들어가시면 안읽은 알림이 있다면 맨 위에 모두읽기버튼이 있습니다. ",
      "그 버튼을 클릭하시면 알림이 한번에 다 읽을 수 있습니다.",
    ],
  },
  {
    question: "게시글 작성시에 태그 추가가 안되요.",
    answer: ["태그를 작성하시고 추가버튼을 눌러야지만 태그가 추가가 됩니다."],
  },
  {
    question: "게시글을 올릴때 정확한 주소를 다 알고 있어야 하나요?",
    answer: [
      "주소검색창에 장소명만 입력해도 목록이 뜹니다. 그 중에 원하시는 주소를 클릭하시면 됩니다.",
    ],
  },
  {
    question: "이페이지는 어떤?",
    answer: [
      "이 코드는 SNS 페이지의 피드 컴포넌트와 관련된 타입 정의 및 게시물 업로드 페이지를 구현하는 코드입니다.",
      "사용자가 게시물을 작성하고 태그를 추가할 수 있는 기능을 포함하고 있습니다.",
    ],
  },
];
