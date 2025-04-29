import { GoShareAndroid } from "react-icons/go";

const ShareButton = () => {
  return (
    <button
      type="button"
      className="hover:scale-105 cursor-pointer p-0.5 active:text-gray-800 hover:text-blue-400  dark:active:text-blue-500"
    >
      <GoShareAndroid />
    </button>
  );
};

export default ShareButton;
