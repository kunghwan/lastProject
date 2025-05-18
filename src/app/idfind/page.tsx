"use client";

import { useRouter } from "next/navigation";
import React, {
  useCallback,
  useState,
  useEffect,
  useRef,
  FormEvent,
  useMemo,
} from "react";
import { useTransition } from "react";
import Loading from "@/components/Loading"; // ✅ 로딩 컴포넌트 불러오기

import { FaIdCard } from "react-icons/fa";
import { TbPassword } from "react-icons/tb";
import { validateName, validatePhone } from "@/lib/validations";
import { dbService, FBCollection } from "@/lib/firebase";
import AlertModal from "@/components/AlertModal";
import Link from "next/link";
import { useAlertModal } from "@/components/AlertStore";

// 세션 저장 키 정의
const STORAGE_KEY = "idFindForm";

const IdFind = () => {
  const router = useRouter();
  // const pathname = usePathname();
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

  const nameInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const checkInputRef = useRef<HTMLInputElement>(null);

  const [isPending, startTransition] = useTransition();
  const { openAlert } = useAlertModal();

  // 이메일 마스킹 처리 (앞 3글자만 보이고 나머지는 * 처리)
  const maskEmail = useCallback((email: string) => {
    const [id, domain] = email.split("@");
    //! 구조 분해 할당 방식
    if (!id || !domain) return email;

    const maskedId =
      id.length <= 3 ? id : id.slice(0, 3) + "*".repeat(id.length - 3);
    return `${maskedId}@${domain}`;
  }, []);

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
  useEffect(() => {
    validateField("name", name);
    validateField("phone", phone);
  }, [name, phone, validateField]);

  // Enter 키로 다음 입력창으로 이동
  // Enter 키로 다음 입력창으로 이동 또는 동작 실행
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();

      // 이름 입력 후 Enter → 전화번호 input으로 포커스
      if (index === 0) {
        inputRefs.current[1]?.focus();
      }

      // 전화번호 입력 후 Enter → 인증번호 발송 + 인증번호 input 포커스
      else if (index === 1) {
        handleCodeSend(); // 인증번호 발송
        setTimeout(() => {
          inputRefs.current[2]?.focus(); // 인증번호 input으로 포커스
        }, 100); // 인증번호 세팅 후 포커싱 약간 딜레이 줌
      }

      // 인증번호 입력 후 Enter → 인증번호 확인 실행
      else if (index === 2) {
        if (!code) return;
        handleVerifyCode();
      }
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
      openAlert("이름, 전화번호, 인증번호를 모두 정확히 입력해주세요.", [
        { text: "확인", isGreen: true },
      ]);
      return;
    }

    try {
      const snap = await dbService
        .collection(FBCollection.USERS)
        .where("name", "==", name)
        .where("tel", "==", phone)
        .get();

      if (snap.empty) {
        openAlert("일치하는 계정이 없습니다.", [
          { text: "확인", isGreen: true },
        ]);
        return;
      }

      const emails = snap.docs.map((doc) => doc.data().email);
      sessionStorage.setItem("realEmail", emails.join(","));
      const maskedEmails = emails.map(maskEmail).join(", ");
      setFoundEmail(maskedEmails);
      setIsVerified(true);
    } catch (error) {
      console.error("이메일 조회 실패", error);
      openAlert("이메일 조회 중 오류가 발생했습니다.", [
        { text: "확인", isGreen: true },
      ]);
    }
  }, [name, phone, code, generatedCode]);

  const maskedEmailList = useMemo(() => {
    return foundEmail.split(", ");
  }, [foundEmail]);

  // 확인 버튼 클릭 → 선택한 이메일 매핑 후 다음 페이지 이동
  const handleSubmit = useCallback(() => {
    const targetRefs = [nameInputRef, phoneInputRef, checkInputRef];
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const codeValid = code.length === 6 && code === generatedCode;

    // 모두 미입력
    if (!trimmedName && !trimmedPhone && !code) {
      return openAlert(
        "이름, 전화번호, 인증번호를 입력해주세요.",
        [{ text: "확인", isGreen: true, autoFocus: true, target: 0 }],
        undefined,
        targetRefs
      );
    }

    // 이름만 입력
    if (trimmedName && !trimmedPhone && !code) {
      return openAlert(
        "전화번호와 인증번호를 입력해주세요.",
        [{ text: "확인", isGreen: true, autoFocus: true, target: 1 }],
        undefined,
        targetRefs
      );
    }

    // 전화번호만 입력
    if (!trimmedName && trimmedPhone && !code) {
      return openAlert(
        "이름과 인증번호를 입력해주세요.",
        [{ text: "확인", isGreen: true, autoFocus: true, target: 0 }],
        undefined,
        targetRefs
      );
    }

    // 인증번호만 입력
    if (!trimmedName && !trimmedPhone && code) {
      return openAlert(
        "이름과 전화번호를 입력해주세요.",
        [{ text: "확인", isGreen: true, autoFocus: true, target: 0 }],
        undefined,
        targetRefs
      );
    }

    // 이름, 전화번호만 입력
    if (trimmedName && trimmedPhone && !code) {
      return openAlert(
        "인증번호를 입력해주세요.",
        [{ text: "확인", isGreen: true, autoFocus: true, target: 2 }],
        undefined,
        targetRefs
      );
    }

    // 이름, 인증번호만 입력
    if (trimmedName && !trimmedPhone && code) {
      return openAlert(
        "전화번호를 입력해주세요.",
        [{ text: "확인", isGreen: true, autoFocus: true, target: 1 }],
        undefined,
        targetRefs
      );
    }

    // 전화번호, 인증번호만 입력
    if (!trimmedName && trimmedPhone && code) {
      return openAlert(
        "이름을 입력해주세요.",
        [{ text: "확인", isGreen: true, autoFocus: true, target: 0 }],
        undefined,
        targetRefs
      );
    }

    // 인증번호 형식 확인
    if (!codeValid) {
      return openAlert(
        "인증번호가 올바르지 않습니다.",
        [{ text: "확인", isGreen: true, autoFocus: true, target: 2 }],
        undefined,
        targetRefs
      );
    }

    // 인증 확인 여부
    if (!foundEmail || !isVerified) {
      return openAlert("먼저 인증확인을 완료해주세요.", [
        { text: "확인", isGreen: true },
      ]);
    }

    // 이메일 선택 여부
    if (!selectedEmail) {
      return openAlert("아이디를 선택해주세요.", [
        { text: "확인", isGreen: true },
      ]);
    }

    // 모든 조건 통과 시 → 실제 이메일 매핑 및 이동
    const realEmails = sessionStorage.getItem("realEmail")?.split(",") || [];
    const selectedIndex = maskedEmailList.findIndex(
      (email) => email === selectedEmail
    );

    if (selectedIndex !== -1) {
      const realSelectedEmail = realEmails[selectedIndex];

      //! 로딩 상태로 전환 후 페이지 이동
      startTransition(() => {
        sessionStorage.setItem("selectedRealEmail", realSelectedEmail);
        sessionStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem("realEmail");
        setFoundEmail("");
        setSelectedEmail("");
        setIsVerified(false);
        router.push("/idfind/resultid");
      });
    } else {
      openAlert("선택한 이메일을 찾을 수 없습니다.", [
        { text: "확인", isGreen: true },
      ]);
    }
  }, [
    name,
    phone,
    code,
    generatedCode,
    foundEmail,
    isVerified,
    selectedEmail,
    router,
    maskedEmailList,
  ]);

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
    openAlert("인증번호가 전송되었습니다: " + newCode, [
      { text: "확인", isGreen: true },
    ]);
  }, [name, phone]);

  // 인증번호 재발송
  const handleResend = useCallback(() => {
    if (!codeSentOnce) {
      openAlert("먼저 인증번호찾기를 눌러주세요.", [
        { text: "확인", isGreen: true },
      ]);
      return;
    }
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(newCode);
    setShowCode(true);
    openAlert("인증번호가 재전송되었습니다: " + newCode, [
      { text: "확인", isGreen: true },
    ]);
  }, [codeSentOnce]);

  // 페이지 로드 후 첫 번째 입력창 포커싱
  useEffect(() => {
    if (isLoaded) inputRefs.current[0]?.focus();
  }, [isLoaded]);

  // 입력 폼 구성 (이름, 전화번호, 인증번호)
  const IdFinds = useMemo(
    () => [
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
    ],
    [
      name,
      phone,
      code,
      errors.name,
      errors.phone,
      handleNameChange,
      handlePhoneChange,
      handleCodeChange,
      handleCodeSend,
      handleResend,
    ]
  );

  return (
    <form onSubmit={(e: FormEvent) => e.preventDefault()}>
      {/* 알림창 */}
      {alertMessage && <AlertModal />}

      {/* 상단 아이디/비밀번호 찾기 헤더 */}
      <div className="w-full bg-primary p-4 whitespace-nowrap dark:bg-[rgba(116,212,186,0.5)]  ">
        <div className="flex md:flex-row items-center gap-4 md:gap-20 p-4 lg:justify-between">
          <div className="flex items-center w-full md:w-80 gap-2 p-2 rounded">
            <FaIdCard className="text-amber-500 text-4xl dark:text-amber-700" />
            <p className="font-bold text-amber-500 dark:text-amber-700">
              아이디 찾기
            </p>
          </div>
          <div className="flex items-center w-full md:w-80 gap-2 p-2 rounded">
            <TbPassword className="text-blue-500 text-4xl dark:text-blue-700" />
            <Link
              href="/pwfind"
              className="font-bold text-black-500  whitespace-nowrap dark:text-white"
            >
              비밀번호 찾기
            </Link>
          </div>
        </div>
      </div>

      {/* 입력폼 렌더링 */}
      {IdFinds.map((idf, index) => (
        <div key={index}>
          <div className="flex gap-x-2  whitespace-nowrap  mt-5">
            <input
              ref={(el) => {
                if (el) inputRefs.current[index] = el;
                if (index === 0) nameInputRef.current = el;
                if (index === 1) phoneInputRef.current = el;
                if (index === 2) checkInputRef.current = el;
              }}
              type={idf.type || "text"}
              placeholder={idf.label}
              className="   focus:border-primary bg-white  md:placeholder:text-sm  outline-none lg:w-100 w-70    border-gray-400 
              placeholder:text-gray-500 border dark:border-gray-500  rounded-lg dark:placeholder:text-white  dark:text-white dark:bg-zinc-700 CommonInput"
              value={idf.value}
              onChange={idf.onChange}
              onKeyDown={(e) => handleKeyDown(e, index)}
            />
            {/* 버튼 렌더링 조건 분기 */}
            {index === 2 ? (
              <>
                <button
                  type="button"
                  className="bg-emerald-300 p-5 font-bold w-19 text-sm  whitespace-nowrap lg:w-19 flex justify-center rounded dark:bg-[rgba(116,212,186,0.5)] "
                  onClick={idf.btAction}
                >
                  {idf.bt}
                </button>
                <button
                  type="button"
                  className="bg-emerald-300 p-5 font-bold w-19  whitespace-nowrap text-sm flex justify-center lg:w-19 rounded dark:bg-[rgba(116,212,186,0.5)]"
                  onClick={handleVerifyCode}
                >
                  {idf.bt1}
                </button>
              </>
            ) : idf.bt ? (
              <button
                type="button"
                className="bg-emerald-300 p-5 font-bold w-40 rounded dark:bg-[rgba(116,212,186,0.5)]"
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
            <p className="text-red-500 text-sm mt-5  w-150 ">{idf.error}</p>
          )}
          {/* 인증번호 표시  */}
          {index === 2 && showCode && (
            <p className="text-center text-sm text-green-600 lg:text-start lg:ml-2 md:text-start md:ml-3   ">
              인증번호: {generatedCode}
            </p>
          )}
        </div>
      ))}

      {/* 확인 버튼 */}
      <div className="  flex ">
        <div className="flex flex-col lg:flex-row lg:justify-center ">
          <div className="flex justify-center w-full mt-5">
            <button
              type="button"
              className="w-[150px] h-[60px] bg-emerald-300 rounded font-bold text-base lg:text-lg hover:bg-emerald-400 lg:w-[200px] dark:bg-[rgba(116,212,186,0.5)] "
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
          <p className="text-center text-primary font-bold mt-1 text-sm lg:justify-start lg:flex lg:p-2 dark:text-primary ">
            내 아이디는 <span className="underline">{foundEmail}</span> 입니다.
          </p>
          <div className="grid grid-cols-2 gap-x-8">
            {maskedEmailList.map((email, idx) => (
              <div key={idx} className="flex items-center gap-x-2.5">
                <input
                  type="radio"
                  id={`email-${idx}`}
                  name="selected-email"
                  value={email}
                  checked={selectedEmail === email}
                  onChange={() => setSelectedEmail(email)}
                />
                <label htmlFor={`email-${idx}`} className="whitespace-nowrap ">
                  {email}
                </label>
              </div>
            ))}
          </div>
        </>
      )}
      {isPending && (
        <div className="mt-10 flex justify-center">
          <Loading message="아이디를 불러오는 중입니다..." />
        </div>
      )}
    </form>
  );
};

export default IdFind;
//!dsfsdfsdf
