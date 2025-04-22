import { FaIdCard } from "react-icons/fa";
import { TbPassword } from "react-icons/tb";

const Pwfind = () => {
  return (
    <>
      <div className="w-full bg-emerald-100 p-4">
        {/* 반응형 탭 영역 */}
        <div className=" h-full flex md:flex-row items-center gap-4 md:gap-20 p-4 lg:justify-between">
          {/* 아이디 찾기 탭 */}
          <div className="flex items-center  w-full md:w-80 gap-2 p-2 rounded">
            <FaIdCard className="text-amber-500 text-4xl" />
            <p className="font-bold text-black">아이디 찾기</p>
          </div>

          {/* 비밀번호 찾기 탭 */}
          <div className="flex items-center w-full md:w-80 gap-2 p-2  rounded">
            <TbPassword className="text-blue-500 text-4xl" />
            <p className="font-bold text-amber-500">비밀번호 찾기</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-4">
        <p>비밀번호 재설정</p>
        <div className="border rounded flex flex-col p-5">
          <p>아이디 :</p>
          <input type="text" placeholder="새 비밀번호" className="border p-1" />
          <input type="text" placeholder="새 비밀번호 확인" />
        </div>
      </div>
    </>
  );
};

export default Pwfind;
