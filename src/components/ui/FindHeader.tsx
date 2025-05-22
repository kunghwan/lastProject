import Link from "next/link";
import { FaIdCard } from "react-icons/fa6";
import { TbPassword } from "react-icons/tb";

const FindHeader = () => {
  return (
    <div className="w-full bg-primary p-4 whitespace-nowrap dark:bg-[rgba(116,212,186,0.5)]">
      <div className="flex md:flex-row items-center gap-4 md:gap-20 p-4 lg:justify-between">
        <div className="flex items-center w-full md:w-80 gap-2 p-2 rounded">
          <FaIdCard className="text-emerald-500 text-4xl dark:text-emerald-600" />
          <p className="font-bold text-emerald-700 dark:text-emerald-800">
            아이디 찾기
          </p>
        </div>
        <div className="flex items-center w-full md:w-80 gap-2 p-2 rounded whitespace-nowrap">
          <TbPassword className="text-emerald-500 text-4xl dark:text-emerald-600" />
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
