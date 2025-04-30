import { GoHeart } from "react-icons/go";

const ShareButton = () => {
  return (
    <button
      type="button"
      className="hover:scale-105 cursor-pointer p-0.5 active:text-gray-800 hover:text-red-400  dark:active:text-red-500"
    >
      <GoHeart />
    </button>
  );
};

export default ShareButton;
