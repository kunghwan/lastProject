import React from "react";
import { IoRestaurant, IoSubway } from "react-icons/io5";
import { FaLandmark, FaBuilding } from "react-icons/fa6";
import { twMerge } from "tailwind-merge";

// 개별 키워드 버튼의 속성 타입 정의
interface KeywordButtonProps {
  name: string;
  icon: React.ReactNode;
  onClick: (name: string) => void;
  selected: boolean;
}

// 키워드 버튼들을 감싸는 컴포넌트의 속성 타입 정의
interface KeywordButtonsProps {
  onKeywordClick: (keyword: string) => void;
  selectedKeyword: string | null;
}

const baseStyle =
  "group bg-gray-50 border dark:border-gray-500 border-gray-100 p-2.5 rounded-full shadow-sm gap-x-1 flex items-center justify-center font-semibold dark:bg-[#555555] dark:text-[#E5E7EB] sm:text-sm text-xs";
const hoverFocusStyle =
  "hover:border-primary focus:bg-primary focus:border-none";
const selectedStyle = "bg-primary text-white border-none dark:text-zinc-900";

const KeywordButton = ({
  name,
  icon,
  onClick,
  selected,
}: KeywordButtonProps) => {
  const buttonClass = twMerge(
    baseStyle,
    hoverFocusStyle,
    selected ? selectedStyle : ""
  );

  const iconClass = twMerge(
    "text-primary sm:text-lg text-base",
    selected && "text-white dark:text-zinc-900"
  );

  const textClass = twMerge(selected ? "text-white dark:text-zinc-900" : "");

  return (
    <button className={buttonClass} onClick={() => onClick(name)}>
      <p className={iconClass}>{icon}</p>
      <span className={textClass}>{name}</span>
    </button>
  );
};

const KeywordButtons = ({
  onKeywordClick,
  selectedKeyword,
}: KeywordButtonsProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {keywordBtn.map((word) => (
        <KeywordButton
          key={word.name}
          name={word.name}
          icon={word.icon}
          onClick={onKeywordClick}
          selected={selectedKeyword === word.name}
        />
      ))}
    </div>
  );
};

export default KeywordButtons;

const keywordBtn = [
  { name: "맛집", icon: <IoRestaurant /> },
  { name: "명소", icon: <FaLandmark /> },
  { name: "백화점", icon: <FaBuilding /> },
  { name: "지하철", icon: <IoSubway /> },
];
