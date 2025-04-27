"use client";

import { AUTH } from "@/contextapi/context";
import React, { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
interface QnA {
  question: string;
  answer: string;
}
const QnaPage = () => {
  //useState로 상태 관리(openQuestion 상태를 추가하여 현재 열려 있는 질문을 관리,null이면 아무 질문도 열려 있지 않은 상태)
  const [isanswerShowing, setIsanswerShowing] = useState<string | null>(null);
  //클릭한 질문이 이미 열려 있으면 닫고, 그렇지 않으면 해당 질문을 엽니다.
  const toggleQuestion = (question: string) => {
    setIsanswerShowing((prev) => (prev === question ? null : question));
  };

  return (
    <div className="mt-5 relative h-screen ">
      <div>
        <ul className="px-2">
          {qna.map((item) => (
            <li key={item.question} className="flex flex-col mb-2 w-full">
              <button
                onClick={() => toggleQuestion(item.question)}
                className="text-left font-bold  flex justify-between items-center p-2.5 rounded bg-[rgba(151,218,200)] dark:bg-[rgba(151,218,200,0.5)] lg:text-xl cursor-pointer"
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
                <p className="mt-1  text-gray-600 rounded p-2.5 bg-[rgba(240,255,251)] dark:bg-[rgba(240,255,251,0.5) lg:text-xl">
                  {item.answer}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="text-xl font-bold flex flex-col justify-end items-center absolute bottom-2 left-0 right-0 ">
        <p>추가로 질문사항이 있으시면 </p>
        <p>
          <a
            href="mailto:test@test.com"
            className="text-green-800 font-bold hover:underline"
          >
            test@test.com
          </a>
          으로 메일을 보내주시면 감사하겠습니다.
        </p>
      </div>
    </div>
  );
};

export default QnaPage;

export const qna: QnA[] = [
  {
    question: "이페이지는 뭐임?",
    answer:
      "이 코드는 SNS 페이지의 피드 컴포넌트와 관련된 타입 정의 및 게시물 업로드 페이지를 구현하는 코드입니다. 사용자가 게시물을 작성하고 태그를 추가할 수 있는 기능을 포함하고 있습니다.",
  },
  {
    question: "이페이지는 무슨페이지?",
    answer:
      "이 코드는 SNS 페이지의 피드 컴포넌트와 관련된 타입 정의 및 게시물 업로드 페이지를 구현하는 코드입니다. 사용자가 게시물을 작성하고 태그를 추가할 수 있는 기능을 포함하고 있습니다.",
  },
  {
    question: "이페이지는 무슨일?",
    answer:
      "이 코드는 SNS 페이지의 피드 컴포넌트와 관련된 타입 정의 및 게시물 업로드 페이지를 구현하는 코드입니다. 사용자가 게시물을 작성하고 태그를 추가할 수 있는 기능을 포함하고 있습니다.",
  },
  {
    question: "이페이지는 어떤?",
    answer:
      "이 코드는 SNS 페이지의 피드 컴포넌트와 관련된 타입 정의 및 게시물 업로드 페이지를 구현하는 코드입니다. 사용자가 게시물을 작성하고 태그를 추가할 수 있는 기능을 포함하고 있습니다.",
  },
];
