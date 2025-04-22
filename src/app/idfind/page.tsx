"use client";

import { useRouter } from "next/navigation";
import React, { useCallback } from "react";
import { FaIdCard } from "react-icons/fa";
import { TbPassword } from "react-icons/tb";

const IdFind = () => {
  const router = useRouter();

  const handleConfirm = useCallback(() => {
    router.push("/idfind/resultid");
  }, [router]);

  return (
    <>
      <div className="w-full bg-emerald-100 p-4">
        {/* 반응형 탭 영역 */}
        <div className=" h-full flex md:flex-row items-center gap-4 md:gap-20 p-4 lg:justify-between">
          {/* 아이디 찾기 탭 */}
          <div className="flex items-center  w-full md:w-80 gap-2 p-2 rounded">
            <FaIdCard className="text-amber-500 text-4xl" />
            <p className="font-bold text-amber-500">아이디 찾기</p>
          </div>

          {/* 비밀번호 찾기 탭 */}
          <div className="flex items-center w-full md:w-80 gap-2 p-2  rounded">
            <TbPassword className="text-blue-500 text-4xl" />
            <p className="font-bold text-black-500">비밀번호 찾기</p>
          </div>
        </div>
      </div>
      {IdFinds.map((idf, index) => (
        <React.Fragment key={index}>
          <div className=" flex gap-2 p-5">
            <input
              type="text"
              placeholder={idf.label}
              className="bg-lime-300 p-5 placeholder:text-black"
            />
            {idf.bt && (
              <button className="bg-emerald-300 p-5  font-bold w-40">
                {idf.bt}
              </button>
            )}
          </div>
        </React.Fragment>
      ))}
      <div className="px-5 mt-4">
        <button
          className="w-[240px] h-[80px] bg-emerald-300 rounded font-bold text-lg hover:bg-[#5cd89b]"
          onClick={handleConfirm}
        >
          확인
        </button>
      </div>
    </>
  );
};

export default IdFind;

const IdFinds = [
  {
    label: "이름",
  },
  {
    label: "전화번호",
    bt: "인증번호찾기",
  },
  {
    label: "인증번호 6자리 숫자 입력",
    bt: "재전송",
  },
];
