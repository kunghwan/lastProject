"use client";

import { useRouter, usePathname } from "next/navigation";
import React, {
  useCallback,
  useState,
  useEffect,
  useRef,
  FormEvent,
} from "react";
import { FaIdCard } from "react-icons/fa";
import { TbPassword } from "react-icons/tb";
import { validateName, validatePhone } from "@/lib/validations";
import { dbService, FBCollection } from "@/lib/firebase";
import AlertModal from "@/components/AlertModal";

const STORAGE_KEY = "idFindForm";

const IdFind = () => {
  const router = useRouter();
  const pathname = usePathname();
  const inputRefs = useRef<HTMLInputElement[]>([]);

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
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

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
      try {
        const parsed = JSON.parse(saved);
        setName(parsed.name || "");
        setPhone(parsed.phone || "");
        setCode(parsed.code || "");
        setGeneratedCode(parsed.generatedCode || "");
        setFoundEmail(parsed.foundEmail || "");
        setShowCode(parsed.showCode || false);
        setCodeRequested(parsed.codeRequested || false);
        setCodeSentOnce(parsed.codeSentOnce || false);
        setErrors(parsed.errors || { name: "", phone: "" });
      } catch (err) {
        console.error("세션 데이터 복원 실패", err);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (pathname !== "/idfind") {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, [pathname]);

  useEffect(() => {
    if (isLoaded) {
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
          codeSentOnce,
          errors,
        })
      );
    }
  }, [
    name,
    phone,
    code,
    generatedCode,
    foundEmail,
    showCode,
    codeRequested,
    codeSentOnce,
    errors,
    isLoaded,
  ]);

  useEffect(() => {
    validateField("name", name);
  }, [name, validateField]);

  useEffect(() => {
    validateField("phone", phone);
  }, [phone, validateField]);

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const nextInput = inputRefs.current[index + 1];
      nextInput?.focus();
    }
  };

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setName(value);
      validateField("name", value);
    },
    [validateField]
  );

  const handlePhoneChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setPhone(value);
      validateField("phone", value);
    },
    [validateField]
  );

  const handleCodeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCode(e.target.value);
    },
    []
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
      sessionStorage.setItem("realEmail", emails.join(","));
      const maskedEmails = emails.map((email) => maskEmail(email)).join(", ");
      setFoundEmail(maskedEmails);
      setIsVerified(true);
    } catch (error) {
      console.error("이메일 조회 실패", error);
      alert("이메일 조회 중 오류가 발생했습니다.");
    }
  }, [name, phone, code, generatedCode]);

  const handleSubmit = useCallback(() => {
    if (!foundEmail || !isVerified) {
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
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem("realEmail");

      // ✅ 메모리 상에서도 초기화
      setFoundEmail("");
      setSelectedEmail("");
      setIsVerified(false);
      router.push("/idfind/resultid");
    } else {
      alert("선택한 이메일을 찾을 수 없습니다.");
    }
  }, [foundEmail, selectedEmail, router, isVerified]);

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
  }, [name, phone]);

  const handleResend = useCallback(() => {
    if (!codeSentOnce) {
      alert("먼저 인증번호찾기를 눌러주세요.");
      return;
    }
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(newCode);
    setShowCode(true);
    alert("인증번호가 재전송되었습니다: " + newCode);
  }, [codeSentOnce]);

  useEffect(() => {
    if (isLoaded) {
      inputRefs.current[0]?.focus();
    }
  }, [isLoaded]);

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
      onChange: handleCodeChange,
      bt: "재전송",
      bt1: "인증확인",
      btAction: handleResend,
      type: "password",
    },
  ];

  return (
    <form onSubmit={(e: FormEvent) => e.preventDefault()}>
      {/* 헤더 */}
      {alertMessage && (
        <AlertModal
          message={alertMessage}
          onClose={() => setAlertMessage(null)}
        />
      )}

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

      {/* 입력폼 */}
      {IdFinds.map((idf, index) => (
        <div key={index}>
          <div className="flex gap-x-2 p-3 ">
            <input
              ref={(el) => {
                if (el) inputRefs.current[index] = el;
              }}
              type={idf.type || "text"}
              placeholder={idf.label}
              className="bg-lime-300 p-5 placeholder:text-black outline-none lg:w-100 w-70 dark:caret-red-500"
              value={idf.value}
              onChange={idf.onChange}
              onKeyDown={(e) => handleKeyDown(e, index)}
            />
            {index === 2 ? (
              <>
                <button
                  type="button"
                  className="bg-emerald-300 p-5 font-bold w-19 text-sm whitespace-nowrap lg:w-20 flex justify-center"
                  onClick={idf.btAction}
                >
                  {idf.bt}
                </button>
                <button
                  type="button"
                  className="bg-emerald-300 p-5 font-bold w-19 whitespace-nowrap text-sm flex justify-center lg:w-20"
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
            <p className="text-red-500 text-sm mt-0.5  w-150 ml-5  ">
              {idf.error}
            </p>
          )}
          {index === 2 && showCode && (
            <p className="text-center text-sm text-green-600 lg:text-start lg:ml-2 md:text-start md:ml-3 ">
              인증번호: {generatedCode}
            </p>
          )}
        </div>
      ))}

      {/* 확인 버튼 */}
      <div className=" px-5 flex">
        <div className="flex flex-col lg:flex-row lg:justify-center">
          <div className="flex justify-center w-full mt-5">
            <button
              type="button"
              className="w-full max-w-[300px] h-[80px] bg-emerald-300 rounded font-bold text-base lg:text-lg hover:bg-emerald-400 "
              onClick={handleSubmit}
            >
              확인
            </button>

            <div className="text-center mt-2 text-sm flex flex-col items-center justify-center w-100 rounded xl:w-143"></div>
          </div>
        </div>
      </div>

      {/* 이메일 결과 */}
      {foundEmail.trim() !== "" && (
        <>
          <p className="text-center text-amber-600 font-bold mt-1 text-sm">
            내 아이디는 <span className="underline">{foundEmail}</span> 입니다.
          </p>
          <div className="grid grid-cols-2 gap-x-8  ">
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
        </>
      )}
    </form>
  );
};

export default IdFind;
