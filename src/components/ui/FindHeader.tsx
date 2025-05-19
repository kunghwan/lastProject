import Link from "next/link";
import { FaIdCard } from "react-icons/fa6";
import { TbPassword } from "react-icons/tb";

const FindHeader = () => {
  return (
    <div className="w-full bg-primary p-4 whitespace-nowrap dark:bg-[rgba(116,212,186,0.5)]">
      <div className="flex md:flex-row items-center gap-4 md:gap-20 p-4 lg:justify-between">
        <div className="flex items-center w-full md:w-80 gap-2 p-2 rounded">
          <FaIdCard className="text-amber-500 text-4xl dark:text-amber-700" />
          <p className="font-bold text-amber-500 dark:text-amber-700">
            아이디 찾기
          </p>
        </div>
        <div className="flex items-center w-full md:w-80 gap-2 p-2 rounded whitespace-nowrap">
          <TbPassword className="text-blue-500 text-4xl dark:text-blue-700" />
          <Link
            href="/pwfind"
            className="font-bold text-black  dark:text-white"
          >
            비밀번호 찾기
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FindHeader;
