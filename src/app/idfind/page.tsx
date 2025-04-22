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
        <div key={index} className="">
          <div className=" flex gap-2 p-5 lg:flex lg:items-center lg:justify-center">
            <input
              type="text"
              placeholder={idf.label}
              className="bg-lime-300 p-5 placeholder:text-black outline-none lg:w-100 w-70"
            />
            {idf.bt ? (
              <button className="bg-emerald-300 p-5 font-bold w-40">
                {idf.bt}
              </button>
            ) : (
              // 👉 버튼 없을 경우 데스크탑에서 자리 맞추기용 빈 div
              <div className=" lg:block w-40" />
            )}
          </div>
        </div>
      ))}
      {/* 확인 버튼 줄 */}

      <div className="w-full px-5">
        <div className="flex flex-col lg:flex-row lg:justify-center   ">
          <div className="w-[240px] md:w-[400px]">
            <button
              className="w-full h-[80px] bg-emerald-300 rounded font-bold  lg:text-lg hover:bg-emerald-400"
              onClick={handleConfirm}
            >
              확인
            </button>
          </div>
          {/* 버튼 없는 공간 만들기 (input 줄과 정렬 맞춤용) */}
          <div className="hidden lg:block w-40" />
        </div>
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
