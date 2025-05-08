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
import Link from "next/link";

// 세션 저장 키 정의
const STORAGE_KEY = "idFindForm";

const IdFind = () => {
  const router = useRouter();
  const pathname = usePathname();
  const inputRefs = useRef<HTMLInputElement[]>([]); // 입력창 ref 배열

  // 사용자 입력값과 인증 상태 관리
  const [name, setName] = useState(""); // 이름 입력값
  const [phone, setPhone] = useState(""); // 전화번호 입력값
  const [code, setCode] = useState(""); // 사용자가 입력한 인증번호
  const [generatedCode, setGeneratedCode] = useState(""); // 시스템이 생성한 인증번호
  const [errors, setErrors] = useState<Record<"name" | "phone", string>>({
    name: "",
    phone: "",
  });
  const [showCode, setShowCode] = useState(false); // 인증번호 입력창 표시 여부
  const [foundEmail, setFoundEmail] = useState(""); // 찾은 이메일 (마스킹된 형태)
  const [codeRequested, setCodeRequested] = useState(false); // 인증요청 여부
  const [codeSentOnce, setCodeSentOnce] = useState(false); // 최초 전송 여부
  const [selectedEmail, setSelectedEmail] = useState(""); // 사용자가 선택한 이메일
  const [isLoaded, setIsLoaded] = useState(false); // 세션 불러오기 완료 여부
  const [isVerified, setIsVerified] = useState(false); // 인증 성공 여부
  const [alertMessage, setAlertMessage] = useState<string | null>(null); // 경고 메시지

  const showAlert = (message: string) => setAlertMessage(message); // 알림창 표시 함수

  // 이메일 마스킹 처리 (앞 3글자만 보이고 나머지는 * 처리)
  const maskEmail = (email: string) => {
    const [id, domain] = email.split("@");
    //! 구조 분해 할당 방식
    const maskedId =
      id.length <= 3 ? id : id.slice(0, 3) + "*".repeat(id.length - 3);
    return `${maskedId}@${domain}`;
  };

  // 이름/전화번호 유효성 검사 후 오류 메시지 저장
  const validateField = useCallback(
    (field: "name" | "phone", value: string) => {
      let message = "";
      if (field === "name") message = validateName(value) || "";
      if (field === "phone") message = validatePhone(value) || "";
      setErrors((prev) => ({ ...prev, [field]: message }));
    },
    []
  );

  // 세션에서 입력값 불러오기 (초기 진입 시)
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

  // 입력값 변경될 때마다 세션에 저장
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

  // 이름/전화번호가 바뀌면 자동 유효성 검사
  useEffect(() => validateField("name", name), [name, validateField]);
  useEffect(() => validateField("phone", phone), [phone, validateField]);

  // Enter 키로 다음 입력창으로 이동
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  // 입력 핸들러들 (useCallback으로 최적화)
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

  // 인증 확인 (입력값 유효성 + 인증번호 확인 + Firestore에서 이메일 조회)
  const handleVerifyCode = useCallback(async () => {
    const nameErr = validateName(name);
    const phoneErr = validatePhone(phone);
    const codeValid = code.length === 6 && code === generatedCode;

    setErrors({ name: nameErr || "", phone: phoneErr || "" });

    if (nameErr || phoneErr || !codeValid) {
      showAlert("이름, 전화번호, 인증번호를 모두 정확히 입력해주세요.");
      return;
    }

    try {
      const snap = await dbService
        .collection(FBCollection.USERS)
        .where("name", "==", name)
        .where("tel", "==", phone)
        .get();

      if (snap.empty) {
        showAlert("일치하는 계정이 없습니다.");
        return;
      }

      const emails = snap.docs.map((doc) => doc.data().email);
      sessionStorage.setItem("realEmail", emails.join(","));
      const maskedEmails = emails.map(maskEmail).join(", ");
      setFoundEmail(maskedEmails);
      setIsVerified(true);
    } catch (error) {
      console.error("이메일 조회 실패", error);
      showAlert("이메일 조회 중 오류가 발생했습니다.");
    }
  }, [name, phone, code, generatedCode]);

  // 확인 버튼 클릭 → 선택한 이메일 매핑 후 다음 페이지 이동
  const handleSubmit = useCallback(() => {
    if (!foundEmail || !isVerified)
      return showAlert("먼저 인증확인을 완료해주세요.");
    if (!selectedEmail) return showAlert("아이디를 선택해주세요.");

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
      setFoundEmail("");
      setSelectedEmail("");
      setIsVerified(false);
      router.push("/idfind/resultid");
    } else {
      showAlert("선택한 이메일을 찾을 수 없습니다.");
    }
  }, [foundEmail, selectedEmail, router, isVerified]);

  // 인증번호 처음 발송
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
    showAlert("인증번호가 전송되었습니다: " + newCode);
  }, [name, phone]);

  // 인증번호 재발송
  const handleResend = useCallback(() => {
    if (!codeSentOnce) return showAlert("먼저 인증번호찾기를 눌러주세요.");
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(newCode);
    setShowCode(true);
    showAlert("인증번호가 재전송되었습니다: " + newCode);
  }, [codeSentOnce]);

  // 페이지 로드 후 첫 번째 입력창 포커싱
  useEffect(() => {
    if (isLoaded) inputRefs.current[0]?.focus();
  }, [isLoaded]);

  // 입력 폼 구성 (이름, 전화번호, 인증번호)
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
      {/* 알림창 */}
      {alertMessage && (
        <AlertModal
          message={alertMessage}
          onClose={() => setAlertMessage(null)}
        />
      )}

      {/* 상단 아이디/비밀번호 찾기 헤더 */}
      <div className="w-full bg-emerald-100 p-4 whitespace-nowrap rounded">
        <div className="flex md:flex-row items-center gap-4 md:gap-20 p-4 lg:justify-between">
          <div className="flex items-center w-full md:w-80 gap-2 p-2 rounded">
            <FaIdCard className="text-amber-500 text-4xl" />
            <p className="font-bold text-amber-500">아이디 찾기</p>
          </div>
          <div className="flex items-center w-full md:w-80 gap-2 p-2 rounded">
            <TbPassword className="text-blue-500 text-4xl" />
            <Link
              href="/pwfind"
              className="font-bold text-black-500 dark:text-black whitespace-nowrap"
            >
              비밀번호 찾기
            </Link>
          </div>
        </div>
      </div>

      {/* 입력폼 렌더링 */}
      {IdFinds.map((idf, index) => (
        <div key={index}>
          <div className="flex gap-x-2 p-3 whitespace-nowrap ">
            <input
              ref={(el) => {
                if (el) inputRefs.current[index] = el;
              }}
              type={idf.type || "text"}
              placeholder={idf.label}
              className="bg-lime-200 p-5 placeholder:text-black outline-none lg:w-100 w-70 dark:caret-red-500 rounded dark:text-black"
              value={idf.value}
              onChange={idf.onChange}
              onKeyDown={(e) => handleKeyDown(e, index)}
            />
            {/* 버튼 렌더링 조건 분기 */}
            {index === 2 ? (
              <>
                <button
                  type="button"
                  className="bg-emerald-300 p-5 font-bold w-15 text-sm whitespace-nowrap lg:w-20 flex justify-center rounded "
                  onClick={idf.btAction}
                >
                  {idf.bt}
                </button>
                <button
                  type="button"
                  className="bg-emerald-300 p-5 font-bold w-15 whitespace-nowrap text-sm flex justify-center lg:w-20 rounded"
                  onClick={handleVerifyCode}
                >
                  {idf.bt1}
                </button>
              </>
            ) : idf.bt ? (
              <button
                type="button"
                className="bg-emerald-300 p-5 font-bold w-40 rounded"
                onClick={idf.btAction}
              >
                {idf.bt}
              </button>
            ) : (
              <div className="lg:block w-40" />
            )}
          </div>
          {/* 유효성 오류 메시지 출력 */}
          {idf.error && (
            <p className="text-red-500 text-sm mt-0.5  w-150 ml-5">
              {idf.error}
            </p>
          )}
          {/* 인증번호 표시  */}
          {index === 2 && showCode && (
            <p className="text-center text-sm text-green-600 lg:text-start lg:ml-2 md:text-start md:ml-3 ">
              인증번호: {generatedCode}
            </p>
          )}
        </div>
      ))}

      {/* 확인 버튼 */}
      <div className=" px-5 flex">
        <div className="flex flex-col lg:flex-row lg:justify-center ">
          <div className="flex justify-center w-full mt-5">
            <button
              type="button"
              className="w-[150px] h-[80px] bg-emerald-300 rounded font-bold text-base lg:text-lg hover:bg-emerald-400 lg:w-[200px] "
              onClick={handleSubmit}
            >
              확인
            </button>
          </div>
        </div>
      </div>

      {/* 마스킹된 이메일 결과 표시 및 선택 */}
      {foundEmail.trim() !== "" && (
        <>
          <p className="text-center text-amber-600 font-bold mt-1 text-sm lg:justify-start lg:flex lg:p-2">
            내 아이디는 <span className="underline">{foundEmail}</span> 입니다.
          </p>
          <div className="grid grid-cols-2 gap-x-8">
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
