"use client";

import React, { useState } from "react";
interface QnA {
  question: string;
  answer: string;
}
const QnaPage = () => {
  const [isanswerShowing, setIsanswerShowing] = useState<string | null>(null);

  const toggleQuestion = (question: string) => {
    setIsanswerShowing((prev) => (prev === question ? null : question));
  };

  return (
    <div className="mt-5">
      <ul>
        {qna.map((item) => (
          <li key={item.question} className="flex flex-col mb-2">
            <button
              onClick={() => toggleQuestion(item.question)}
              className="text-left font-bold"
            >
              {item.question}
              <span>{isanswerShowing === item.question ? "X" : "+"}</span>
            </button>
            {isanswerShowing === item.question && (
              <p className="mt-2 text-gray-600">{item.answer}</p>
            )}
          </li>
        ))}
      </ul>
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
