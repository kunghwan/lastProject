"use client";

import { useEffect, useState } from "react";
import { FaIdCard } from "react-icons/fa6";
import { TbPassword } from "react-icons/tb";

const IdFindResult = () => {
  const [email, setEmail] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // ✅ 로딩 상태 추가

  useEffect(() => {
    if (email) {
      sessionStorage.setItem("realEmail", email);
      sessionStorage.setItem("isChecked", JSON.stringify(isChecked)); // ✅ 체크상태도 저장
    }
  }, [email, isChecked]);

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("realEmail");
    const storedCheck = sessionStorage.getItem("isChecked");

    if (storedEmail) setEmail(storedEmail);
    if (storedCheck) setIsChecked(JSON.parse(storedCheck)); // ✅ 복원
    setIsLoading(false);
  }, []);

  const handleClick = (url: string) => {
    if (!isChecked) {
      alert("체크박스를 체크해주세요.");
      return;
    }
    window.location.href = url;
  };

  return (
    <>
      <div className="w-full bg-emerald-100 p-4">
        <div className="flex md:flex-row items-center gap-4 md:gap-20 p-4 lg:justify-between">
          <div className="flex items-center w-full md:w-80 gap-2 p-2 rounded">
            <FaIdCard className="text-amber-500 text-4xl" />
            <p className="font-bold text-amber-500">아이디 찾기</p>
          </div>
          <div className="flex items-center w-full md:w-80 gap-2 p-2 rounded">
            <TbPassword className="text-blue-500 text-4xl" />
            <p className="font-bold text-black dark:text-black">
              비밀번호 찾기
            </p>
          </div>
        </div>
      </div>

      <div className="w-full flex justify-center flex-col ml-5">
        <div className="h-50 items-center justify-center flex border border-emerald-300 rounded mt-5 w-100 gap-3 p-4 lg:h-100 lg:w-280 md:w-200">
          <input
            type="checkbox"
            checked={isChecked}
            className="w-5 h-5 appearance-none border border-cyan-300 rounded-sm checked:bg-cyan-200 checked:border-cyan-400"
            onChange={(e) => setIsChecked(e.target.checked)}
          />
          {isLoading ? (
            <p className="text-lg text-gray-500 dark:text-emerald-300">
              이메일 불러오는 중...
            </p>
          ) : email ? (
            <p className="text-xl text-black">
              <span className="font-bold dark:text-emerald-300">{email}</span>
            </p>
          ) : (
            <p className="text-lg text-gray-500">이메일 정보가 없습니다.</p>
          )}
        </div>

        <div className="flex mt-4 gap-x-2.5 justify-start ml-10 lg:ml-100 md:ml-60">
          <button
            onClick={() => handleClick("/signup")}
            className={loginButton}
          >
            로그인하기
          </button>
          <button onClick={() => handleClick("/pwfind")} className={pwButton}>
            비밀번호 찾기
          </button>
        </div>
      </div>
    </>
  );
};

export default IdFindResult;

// ✅ 버튼 스타일
const pwButton =
  "bg-gray-300 text-black font-bold px-6 py-3 rounded-2xl hover:bg-blue-600 w-40 lg:h-20 lg:flex lg:items-center lg:justify-center";
const loginButton =
  "bg-emerald-300 px-6 py-3 rounded-2xl hover:bg-emerald-600 w-40 text-black font-bold flex justify-center lg:h-20 lg:flex lg:items-center lg:justify-center";
