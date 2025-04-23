"use client";

import { useRouter } from "next/navigation";
import React, { useCallback, useState, useEffect } from "react";
import { FaIdCard } from "react-icons/fa";
import { TbPassword } from "react-icons/tb";
import { validateName, validatePhone } from "@/lib/validations";

const IdFind = () => {
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [errors, setErrors] = useState<Record<"name" | "phone", string>>({
    name: "",
    phone: "",
  });
  const [showCode, setShowCode] = useState(false);

  // ✅ 유효성 검사 함수
  const validateField = useCallback(
    (field: "name" | "phone", value: string) => {
      let message = "";
      if (field === "name") message = validateName(value) || "";
      if (field === "phone") message = validatePhone(value) || "";

      setErrors((prev) => ({ ...prev, [field]: message }));
    },
    []
  );

  // ✅ 최초 1회 실행
  useEffect(() => {
    validateField("name", name);
    validateField("phone", phone);
  }, []);

  // ✅ 실시간 입력 검사
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    validateField("name", value);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhone(value);
    validateField("phone", value);
  };

  const handleConfirm = useCallback(() => {
    const nameErr = validateName(name);
    const phoneErr = validatePhone(phone);

    setErrors({ name: nameErr || "", phone: phoneErr || "" });

    if (nameErr || phoneErr || code !== generatedCode) {
      alert("입력값을 다시 확인해주세요.");
      return;
    }

    router.push("/idfind/resultid");
  }, [name, phone, code, generatedCode, router]);

  const handleCodeSend = () => {
    const phoneErr = validatePhone(phone);
    setErrors((prev) => ({ ...prev, phone: phoneErr || "" }));
    if (phoneErr) return;

    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(newCode);
    setShowCode(true);
    alert("인증번호가 전송되었습니다: " + newCode);
  };

  const handleResend = () => {
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(newCode);
    setShowCode(true);
    alert("인증번호가 재전송되었습니다: " + newCode);
  };

  const IdFinds = [
    {
      label: "이름",
      value: name,
      onChange: handleNameChange,
      error: errors.name,
    },
    {
      label: "전화번호",
      value: phone,
      onChange: handlePhoneChange,
      bt: "인증번호찾기",
      btAction: handleCodeSend,
      error: errors.phone,
    },
    {
      label: "인증번호 6자리 숫자 입력",
      value: code,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setCode(e.target.value),
      bt: "재전송",
      btAction: handleResend,
      type: "password",
    },
  ];

  return (
    <>
      <div className="w-full bg-emerald-100 p-4">
        <div className=" h-full flex md:flex-row items-center gap-4 md:gap-20 p-4 lg:justify-between">
          <div className="flex items-center  w-full md:w-80 gap-2 p-2 rounded">
            <FaIdCard className="text-amber-500 text-4xl" />
            <p className="font-bold text-amber-500">아이디 찾기</p>
          </div>
          <div className="flex items-center w-full md:w-80 gap-2 p-2  rounded">
            <TbPassword className="text-blue-500 text-4xl" />
            <p className="font-bold text-black-500">비밀번호 찾기</p>
          </div>
        </div>
      </div>

      {IdFinds.map((idf, index) => (
        <div key={index}>
          <div className=" flex gap-2 p-5 lg:flex lg:items-center lg:justify-center">
            <input
              type={idf.type || "text"}
              placeholder={idf.label}
              className="bg-lime-300 p-5 placeholder:text-black outline-none lg:w-100 w-70"
              value={idf.value}
              onChange={idf.onChange}
            />
            {idf.bt ? (
              <button
                className="bg-emerald-300 p-5 font-bold w-40"
                onClick={idf.btAction}
              >
                {idf.bt}
              </button>
            ) : (
              <div className=" lg:block w-40" />
            )}
          </div>

          {idf.error && (
            <p className="text-red-500 text-sm mt-0.5 ml-5">{idf.error}</p>
          )}

          {index === 2 && showCode && (
            <p className="text-center text-sm text-green-600 mt-1">
              인증번호: {generatedCode}
            </p>
          )}
        </div>
      ))}

      <div className="w-full px-5">
        <div className="flex flex-col lg:flex-row lg:justify-center">
          <div className="w-[240px] md:w-[400px]">
            <button
              className="w-full h-[80px] bg-emerald-300 rounded font-bold  lg:text-lg hover:bg-emerald-400"
              onClick={handleConfirm}
            >
              확인
            </button>
          </div>
          <div className="hidden lg:block w-40" />
        </div>
      </div>
    </>
  );
};

export default IdFind;
