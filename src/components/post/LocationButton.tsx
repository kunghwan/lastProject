import { IoLocationOutline } from "react-icons/io5";

const LocationButton = () => {
  return (
    <button
      type="button"
      className="hover:scale-105 cursor-pointer p-0.5 active:text-gray-800 hover:text-green-400  dark:active:text-green-500"
    >
      <IoLocationOutline />
    </button>
  );
};

export default LocationButton;
