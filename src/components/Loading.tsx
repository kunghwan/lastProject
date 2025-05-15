import { PiBagFill } from "react-icons/pi";

interface LoadingState {
  isLoading?: boolean;
  message?: string;
}

const Loaiding = ({ message, isLoading }: LoadingState) => {
  return (
    <div className="fixed inset-0 z-[9998] bg-white/80 flex items-center justify-center flex-col">
      {/* 회전 원형 안에 아이콘 */}
      <div className="relative w-20 h-20 mb-4">
        <div className="absolute inset-0 rounded-full border-4 border-t-teal-200 border-r-transparent border-b-red-100 border-l-transparent animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <PiBagFill className="text-4xl text-brown-600" />
        </div>
      </div>

      <p className="text-xl font-semibold dark:text-black">{message}</p>
    </div>
  );
};

export default Loaiding;
