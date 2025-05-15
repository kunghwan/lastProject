import React from "react";
import { IoRestaurant, IoSubway } from "react-icons/io5";
import { FaLandmark, FaBuilding } from "react-icons/fa6";

// 개별 키워드 버튼의 속성 타입 정의
interface KeywordButtonProps {
  name: string;
  icon: React.ReactNode;
  onClick: (name: string) => void;
}

// 키워드 버튼들을 감싸는 컴포넌트의 속성 타입 정의
interface KeywordButtonsProps {
  onKeywordClick: (keyword: string) => void;
}
const keywordBtnStyle =
  "group bg-white border dark:border-gray-500 border-gray-300 p-2.5 rounded-full shadow-sm hover:border-primary gap-x-1 flex items-center justify-center font-semibold dark:bg-[#6B6B6B] dark:text-[#E5E7EB] sm:text-sm text-xs focus:bg-primary focus:border-none focus:text-zinc-900";

const KeywordButton = ({ name, icon, onClick }: KeywordButtonProps) => (
  <button className={keywordBtnStyle} onClick={() => onClick(name)}>
    <p className="text-primary sm:text-lg text-base group-focus:text-zinc-900">
      {icon}
    </p>
    {name}
  </button>
);

const KeywordButtons = ({ onKeywordClick }: KeywordButtonsProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {keywordBtn.map((word) => (
        <KeywordButton
          key={word.name}
          name={word.name}
          icon={word.icon}
          onClick={onKeywordClick}
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
