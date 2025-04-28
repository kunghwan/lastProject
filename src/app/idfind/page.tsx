"use client";

import { useRouter } from "next/navigation";
import React, { useCallback, useState, useEffect, FormEvent } from "react";
import { FaIdCard } from "react-icons/fa";
import { TbPassword } from "react-icons/tb";
import { validateName, validatePhone } from "@/lib/validations";
import { dbService, FBCollection } from "@/lib/firebase";

const STORAGE_KEY = "idFindForm";

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
  const [foundEmail, setFoundEmail] = useState("");
  const [codeRequested, setCodeRequested] = useState(false);
  const [codeSentOnce, setCodeSentOnce] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState("");

  const maskEmail = (email: string) => {
    const [id, domain] = email.split("@");
    const maskedId =
      id.length <= 3 ? id : id.slice(0, 3) + "*".repeat(id.length - 3);
    return `${maskedId}@${domain}`;
  };

  const validateField = useCallback(
    (field: "name" | "phone", value: string) => {
      let message = "";
      if (field === "name") message = validateName(value) || "";
      if (field === "phone") message = validatePhone(value) || "";
      setErrors((prev) => ({ ...prev, [field]: message }));
    },
    []
  );

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setName(parsed.name || "");
      setPhone(parsed.phone || "");
      setCode(parsed.code || "");
      setGeneratedCode(parsed.generatedCode || "");
      setFoundEmail(parsed.foundEmail || "");
      setShowCode(parsed.showCode || false);
      setCodeRequested(parsed.codeRequested || false); // ✅
      setCodeSentOnce(parsed.codeSentOnce || false); // ✅

      validateField("name", parsed.name || "");
      validateField("phone", parsed.phone || "");
    } else {
      validateField("name", "");
      validateField("phone", "");
    }
  }, [validateField]);

  useEffect(() => {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        name,
        phone,
        code,
        generatedCode,
        foundEmail,
        showCode,
        codeRequested,
        codeSentOnce, // ✅ 추가해야 함!
      })
    );
  }, [
    name,
    phone,
    code,
    generatedCode,
    foundEmail,
    showCode,
    codeRequested,
    codeSentOnce,
  ]);

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setName(value);
      validateField("name", value);
    },
    [setName, validateField]
  );

  const handlePhoneChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setPhone(value);
      validateField("phone", value);
    },
    [setPhone, validateField]
  );

  const handleVerifyCode = useCallback(async () => {
    const nameErr = validateName(name);
    const phoneErr = validatePhone(phone);
    const codeValid = code.length === 6 && code === generatedCode;

    setErrors({ name: nameErr || "", phone: phoneErr || "" });

    if (nameErr || phoneErr || !codeValid) {
      alert("이름, 전화번호, 인증번호를 모두 정확히 입력해주세요.");
      return;
    }

    try {
      const snap = await dbService
        .collection(FBCollection.USERS)
        .where("name", "==", name)
        .where("tel", "==", phone)
        .get();

      if (snap.empty) {
        alert("일치하는 계정이 없습니다.");
        return;
      }

      const emails = snap.docs.map((doc) => doc.data().email);
      sessionStorage.setItem("realEmail", emails.join(",")); // 여러 개 저장 (쉼표로 구분)

      const maskedEmails = emails.map((email) => maskEmail(email)).join(", ");
      setFoundEmail(maskedEmails);
    } catch (error) {
      console.error("이메일 조회 실패", error);
      alert("이메일 조회 중 오류가 발생했습니다.");
    }
  }, [name, phone, code, generatedCode]);

  const handleSubmit = useCallback(() => {
    if (!foundEmail) {
      alert("먼저 인증확인을 완료해주세요.");
      return;
    }

    if (!selectedEmail) {
      alert("아이디를 선택해주세요.");
      return;
    }

    const maskedEmails = foundEmail.split(", ");
    const realEmails = sessionStorage.getItem("realEmail")?.split(",") || [];
    const selectedIndex = maskedEmails.findIndex(
      (email) => email === selectedEmail
    );

    if (selectedIndex !== -1) {
      const realSelectedEmail = realEmails[selectedIndex];
      sessionStorage.setItem("selectedRealEmail", realSelectedEmail);
      router.push("/idfind/resultid");
    } else {
      alert("선택한 이메일을 찾을 수 없습니다.");
    }
  }, [foundEmail, selectedEmail, router]);

  const handleCodeSend = useCallback(() => {
    const nameErr = validateName(name);
    const phoneErr = validatePhone(phone);
    setErrors({ name: nameErr || "", phone: phoneErr || "" });

    if (nameErr || phoneErr) return;

    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(newCode);
    setShowCode(true);
    setCodeRequested(true);
    setCodeSentOnce(true);
    alert("인증번호가 전송되었습니다: " + newCode);
  }, [
    name,
    phone,
    setErrors,
    setGeneratedCode,
    setShowCode,
    setCodeRequested,
    setCodeSentOnce,
  ]);

  const handleResend = useCallback(() => {
    if (!codeSentOnce) {
      alert("먼저 인증번호찾기를 눌러주세요.");
      return;
    }

    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(newCode);
    setShowCode(true);
    alert("인증번호가 재전송되었습니다: " + newCode);
  }, [codeSentOnce, setGeneratedCode, setShowCode]);

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
      bt1: "인증확인",
      btAction: handleResend,
      type: "password",
    },
  ];

  return (
    <form onSubmit={(e: FormEvent) => e.preventDefault()}>
      <div className="w-full bg-emerald-100 p-4">
        <div className="flex md:flex-row items-center gap-4 md:gap-20 p-4 lg:justify-between">
          <div className="flex items-center w-full md:w-80 gap-2 p-2 rounded">
            <FaIdCard className="text-amber-500 text-4xl" />
            <p className="font-bold text-amber-500">아이디 찾기</p>
          </div>
          <div className="flex items-center w-full md:w-80 gap-2 p-2 rounded">
            <TbPassword className="text-blue-500 text-4xl" />
            <p className="font-bold text-black-500 dark:text-black">
              비밀번호 찾기
            </p>
          </div>
        </div>
      </div>

      {IdFinds.map((idf, index) => (
        <div key={index}>
          <div className="flex gap-2 p-5 lg:flex lg:items-center lg:justify-center">
            <input
              type={idf.type || "text"}
              placeholder={idf.label}
              className="bg-lime-300 p-5 placeholder:text-black outline-none lg:w-100 w-70 dark:caret-red-500"
              value={idf.value}
              onChange={idf.onChange}
            />
            {index === 2 ? (
              <>
                <button
                  type="button"
                  className="bg-emerald-300 p-5 font-bold w-18 text-sm whitespace-nowrap lg:w-20 flex justify-center"
                  onClick={idf.btAction}
                >
                  {idf.bt}
                </button>
                <button
                  type="button"
                  className="bg-emerald-300 p-5 font-bold w-17 whitespace-nowrap text-sm flex justify-center lg:w-20"
                  onClick={handleVerifyCode}
                >
                  {idf.bt1}
                </button>
              </>
            ) : idf.bt ? (
              <button
                type="button"
                className="bg-emerald-300 p-5 font-bold w-40"
                onClick={idf.btAction}
              >
                {idf.bt}
              </button>
            ) : (
              <div className="lg:block w-40" />
            )}
          </div>

          {idf.error && (
            <p className="text-red-500 text-sm mt-0.5 ml-5 lg:ml-80">
              {idf.error}
            </p>
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
              type="button"
              className="w-full h-[80px] bg-emerald-300 rounded font-bold lg:text-lg hover:bg-emerald-400"
              onClick={handleSubmit}
            >
              확인
            </button>
          </div>
          <div className="hidden lg:block w-45" />
        </div>
      </div>

      {foundEmail && (
        <p className="text-center  text-amber-600 font-bold mt-4 text-sm">
          내 아이디는 <span className="underline">{foundEmail}</span> 입니다.
        </p>
      )}
      {foundEmail && (
        <div className="text-center mt-4 text-sm flex flex-col items-center justify-center">
          <p className="text-sm text-amber-600 font-bold whitespace-nowrap mb-2">
            id 선택
          </p>
          <div className="grid grid-cols-2 gap-4">
            {foundEmail.split(", ").map((email, idx) => (
              <div key={idx} className="flex items-center gap-x-2.5">
                <input
                  type="radio"
                  id={`email-${idx}`}
                  name="selected-email"
                  value={email}
                  checked={selectedEmail === email}
                  onChange={() => setSelectedEmail(email)}
                />
                <label
                  htmlFor={`email-${idx}`}
                  className="whitespace-nowrap z-50"
                >
                  {email}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
    </form>
  );
};

export default IdFind;
