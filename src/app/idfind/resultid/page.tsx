"use client";

import { useCallback, useEffect, useState } from "react";
import { FaIdCard } from "react-icons/fa6";
import { TbPassword } from "react-icons/tb";
import { useAlertModal } from "@/components/AlertStore";

const IdFindResult = () => {
  // 상태 정의
  const [email, setEmail] = useState(""); // 선택된 이메일 저장
  const [isChecked, setIsChecked] = useState(false); // 체크박스 상태
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태

  const { openAlert } = useAlertModal();

  // ✅ 이메일/체크 상태가 바뀔 때마다 세션에 저장
  useEffect(() => {
    if (email) {
      sessionStorage.setItem("selectedRealEmail", email); // 이메일 저장
      sessionStorage.setItem("isChecked", JSON.stringify(isChecked)); // 체크 상태 저장
    }
  }, [email, isChecked]);

  // ✅ 컴포넌트 마운트 시 세션에서 값 복원
  useEffect(() => {
    const storedEmail = sessionStorage.getItem("selectedRealEmail");
    const storedCheck = sessionStorage.getItem("isChecked");

    if (storedEmail) setEmail(storedEmail); // 이메일 복원
    if (storedCheck) setIsChecked(JSON.parse(storedCheck)); // 체크 여부 복원
    setIsLoading(false); // 로딩 종료
  }, []);

  // ✅ 버튼 클릭 시 체크 확인 → 이동
  const handleClick = useCallback(
    (url: string) => {
      if (!isChecked) {
        openAlert("체크박스를 체크해주세요.", [
          { text: "확인", isGreen: true, autoFocus: true },
        ]);
        return;
      }
      window.location.href = url;
    },
    [isChecked]
  );

  return (
    <>
      {/* 상단 헤더 - 아이디/비밀번호 찾기 */}
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
            <p className="font-bold text-black  dark:text-white">
              비밀번호 찾기
            </p>
          </div>
        </div>
      </div>

      {/* 본문: 이메일 결과 표시 영역 */}
      <div className="w-full flex justify-center flex-col ml-5">
        <div className="h-50 items-center justify-center flex border border-emerald-300 rounded mt-5 w-80 gap-3 p-4 lg:h-100 lg:w-280 md:w-200">
          {/* ✅ 체크박스 */}
          <input
            type="checkbox"
            checked={isChecked}
            className="w-5 h-5 appearance-none border border-cyan-300 rounded-sm checked:bg-cyan-200 checked:border-cyan-400"
            onChange={(e) => setIsChecked(e.target.checked)}
          />
          {/* ✅ 로딩 중일 때 */}
          {isLoading ? (
            <p className="text-lg text-gray-500 dark:text-emerald-300">
              이메일 불러오는 중...
            </p>
          ) : email ? (
            // ✅ 이메일이 있을 때
            <p className="text-xl text-black">
              <span className="font-bold dark:text-emerald-300">{email}</span>
            </p>
          ) : (
            // ✅ 이메일이 없을 때
            <p className="text-lg text-gray-500">이메일 정보가 없습니다.</p>
          )}
        </div>

        {/* 버튼 영역: 로그인 / 비밀번호 찾기 */}
        <div className="flex mt-4 gap-x-2.5 justify-start  lg:ml-100 md:ml-60">
          <button
            onClick={() => handleClick("/signin")}
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

const pwButton =
  "bg-gray-300 text-black font-bold px-6 py-3 rounded-2xl hover:bg-blue-600 w-40 lg:h-20 lg:flex lg:items-center lg:justify-center dark:bg-gray-500 dark:text-white";

const loginButton =
  "bg-emerald-300 px-6 py-3 rounded-2xl hover:bg-emerald-600 w-40 text-black font-bold flex justify-center lg:h-20 lg:flex lg:items-center lg:justify-center dark:bg-emerald-800 dark:text-white";
