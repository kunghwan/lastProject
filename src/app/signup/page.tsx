"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Select, { SelectInstance } from "react-select"; // 생년월일 선택용
import { useRouter } from "next/navigation";
import {
  validateName,
  validateEmail,
  validatePassword,
  validatePhone,
  validateLocation,
} from "@/lib/validations";
import { AUTH } from "@/contextapi/context";
import { dbService, FBCollection, authService } from "@/lib/firebase"; // Firebase 연동
import AlertModal from "@/components/AlertModal";

const STORAGE_KEY = "signupUser"; // 세션 스토리지 키

// 입력 항목 정의
const InfoAccount = [
  { label: "이름", name: "name", type: "text" },
  { label: "이메일", name: "email", type: "email" },
  { label: "비밀번호", name: "password", type: "password" },
  { label: "생년월일", name: "birth", type: "custom" },
  { label: "전화번호", name: "tel", type: "text" },
  { label: "위치정보 동의", name: "agreeLocation", type: "checkbox" },
];

const SignupForm = () => {
  const [user, setUser] = useState<Omit<User, "uid">>({
    name: "",
    email: "",
    password: "",
    birth: "",
    tel: "",
    agreeLocation: false,
  });

  // 생년월일 각각 관리
  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");

  const [errors, setErrors] = useState<Partial<Record<keyof User, string>>>({});
  const [isLoaded, setIsLoaded] = useState(false); // 세션 복원 완료 여부
  const { signup } = AUTH.use(); // 회원가입 함수
  const router = useRouter();

  // 입력창 참조
  const inputRefs = useRef<(HTMLInputElement | HTMLSelectElement)[]>([]);
  const yearSelectRef = useRef<SelectInstance<any> | null>(null);
  const monthSelectRef = useRef<SelectInstance<any> | null>(null);
  const daySelectRef = useRef<SelectInstance<any> | null>(null);
  const locationAgreeRef = useRef<HTMLInputElement | null>(null);

  const [alertMsg, setAlertMsg] = useState(""); // 모달 메시지
  const closeAlert = () => setAlertMsg(""); // 모달 닫기

  // 입력창 ref 설정 함수
  const setInputRef = useCallback(
    (el: HTMLInputElement | HTMLSelectElement | null, index: number) => {
      if (el) inputRefs.current[index] = el;
    },
    []
  );

  // 이메일 중복 확인
  const checkEmailDuplicateByFirestore = useCallback(async (email: string) => {
    const snap = await dbService
      .collection(FBCollection.USERS)
      .where("email", "==", email)
      .get();
    return !snap.empty;
  }, []);

  // 세션 저장 정보 불러오기
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setUser({
            ...parsed,
            agreeLocation: Boolean(parsed.agreeLocation),
          });
          const [y, m, d] = (parsed.birth || "").split("-");
          setBirthYear(y ?? "");
          setBirthMonth(m ?? "");
          setBirthDay(d ?? "");
        } catch (e) {
          console.error("세션 복구 실패", e);
        }
      }
      setIsLoaded(true);
    }
  }, []);

  // user 상태 변경 시 세션 저장
  useEffect(() => {
    if (isLoaded) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    }
  }, [user, isLoaded]);

  // 생년월일 선택 시 birth 조합
  useEffect(() => {
    if (birthYear && birthMonth && birthDay) {
      setUser((prev) => ({
        ...prev,
        birth: `${birthYear}-${birthMonth}-${birthDay}`,
      }));
    }
  }, [birthYear, birthMonth, birthDay]);

  // 각 필드 유효성 검사
  const validateField = useCallback(
    async (name: keyof User, value: any) => {
      let message: string | null = null;
      switch (name) {
        case "name":
          message = validateName(value);
          break;
        case "email":
          if (!value) message = "이메일을 입력해주세요.";
          else {
            const isDuplicate = await checkEmailDuplicateByFirestore(value);
            message = isDuplicate ? "이미 사용 중인 이메일입니다." : "";
          }
          break;
        case "password":
          message = validatePassword(value);
          break;
        case "tel":
          message = validatePhone(value);
          break;
        case "agreeLocation":
          message = validateLocation(value);
          break;
      }
      setErrors((prev) => ({ ...prev, [name]: message ?? "" }));
      return message;
    },
    [checkEmailDuplicateByFirestore]
  );

  // 컴포넌트 마운트 시 모든 필드 유효성 검사 + 첫 번째 포커스
  useEffect(() => {
    if (!isLoaded) return;
    const validateAllFieldsOnMount = async () => {
      const initialErrors: typeof errors = {};
      for (const info of InfoAccount) {
        const key = info.name as keyof typeof user;
        const value = user[key];
        const message = await validateField(key, value);
        if (message) initialErrors[key] = message;
      }
      setErrors(initialErrors);
    };
    validateAllFieldsOnMount();
    inputRefs.current[0]?.focus();
  }, [isLoaded, validateField]);

  // 입력 변경 처리
  const handleChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, type, value, checked } = e.target;
      const fieldName = name as keyof typeof user;
      const fieldValue = type === "checkbox" ? checked : value;
      setUser((prev) => ({ ...prev, [fieldName]: fieldValue }));
      await validateField(fieldName, fieldValue);
    },
    [validateField]
  );

  // 엔터 시 다음 입력으로 이동
  const handleKeyDown = useCallback(
    (index: number) => (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const nextInput = inputRefs.current[index + 1];
        if (nextInput) nextInput.focus();
        if (index === 2) yearSelectRef.current?.onMenuOpen?.();
        if (InfoAccount[index]?.name === "tel")
          locationAgreeRef.current?.focus();
      }
    },
    []
  );

  // 제출 처리
  const handleSubmit = useCallback(async () => {
    const newErrors: typeof errors = {};
    for (const info of InfoAccount) {
      const key = info.name as keyof typeof user;
      const message = await validateField(key, user[key]);
      if (message) newErrors[key] = message;
    }
    setErrors(newErrors);
    if (Object.values(newErrors).some((msg) => msg)) {
      setAlertMsg("입력값을 다시 확인해주세요.");
      return;
    }

    // Firebase 인증 생성
    const result = await signup(user as User, user.password!);
    if (!result.success) {
      setAlertMsg("회원가입 실패: " + result.message);
      return;
    }

    // 현재 로그인된 Firebase 사용자 가져오기
    const fbUser = authService.currentUser;
    if (!fbUser) {
      setAlertMsg("회원 정보가 없습니다. 다시 시도해주세요.");
      return;
    }

    // uid 포함한 전체 유저 데이터 구성 → 세션 저장 → 다음 페이지 이동
    const fullUser = { ...user, uid: fbUser.uid };
    await authService.signOut();
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(fullUser));
    router.push("/signup/settingprofile");
  }, [signup, user, errors, validateField, router]);

  if (!isLoaded) return null; // 로딩 안 됐으면 렌더 안 함

  // react-select 스타일
  const selectStyle = {
    control: (base: any) => ({ ...base, minHeight: "42px", fontSize: "14px" }),
    menu: (base: any) => ({ ...base, fontSize: "14px" }),
  };

  return (
    <div className="flex flex-col justify-start items-center min-h-screen px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 border border-teal-300 rounded-lg p-6">
        <form className="space-y-8">
          {InfoAccount.map((info, index) => {
            const key = info.name as keyof typeof user;
            const inputId = `${info.name}-${index}`;
            const value = user[key];

            return (
              <div key={index} className="relative">
                {info.type === "custom" ? (
                  // 생년월일 3개 Select
                  <div className="flex space-x-2 items-center">
                    <div className="w-1/3">
                      <Select
                        ref={yearSelectRef}
                        options={Array.from({ length: 100 }, (_, i) => {
                          const y = `${new Date().getFullYear() - i}`;
                          return { value: y, label: y };
                        })}
                        value={
                          birthYear
                            ? { value: birthYear, label: birthYear }
                            : null
                        }
                        onChange={(opt) => setBirthYear(opt?.value ?? "")}
                        placeholder="년도"
                        styles={selectStyle}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            monthSelectRef.current?.focus();
                            monthSelectRef.current?.onMenuOpen?.();
                          }
                        }}
                      />
                    </div>
                    <div className="w-1/3">
                      <Select
                        ref={monthSelectRef}
                        options={Array.from({ length: 12 }, (_, i) => {
                          const m = `${i + 1}`.padStart(2, "0");
                          return { value: m, label: m };
                        })}
                        value={
                          birthMonth
                            ? { value: birthMonth, label: birthMonth }
                            : null
                        }
                        onChange={(opt) => setBirthMonth(opt?.value ?? "")}
                        placeholder="월"
                        styles={selectStyle}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            daySelectRef.current?.focus();
                            daySelectRef.current?.onMenuOpen?.();
                          }
                        }}
                      />
                    </div>
                    <div className="w-1/3">
                      <Select
                        ref={daySelectRef}
                        options={Array.from({ length: 31 }, (_, i) => {
                          const d = `${i + 1}`.padStart(2, "0");
                          return { value: d, label: d };
                        })}
                        value={
                          birthDay ? { value: birthDay, label: birthDay } : null
                        }
                        onChange={(opt) => setBirthDay(opt?.value ?? "")}
                        placeholder="일"
                        styles={selectStyle}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const telInput = inputRefs.current.find(
                              (el) => el?.getAttribute("name") === "tel"
                            );
                            telInput?.focus();
                          }
                        }}
                      />
                    </div>
                  </div>
                ) : info.type !== "checkbox" ? (
                  // 일반 input 렌더링
                  <>
                    <input
                      id={inputId}
                      ref={(el) => setInputRef(el, index)}
                      name={info.name}
                      type={info.type}
                      value={value as string}
                      onChange={handleChange}
                      onKeyDown={handleKeyDown(index)}
                      placeholder={info.label}
                      className={`w-full border rounded-md px-2 pt-5 pb-2 text-base outline-none placeholder-transparent ${
                        errors[key] ? "border-red-500" : "border-gray-300"
                      } focus:border-teal-400 transition-all h-16 dark:text-white dark:bg-gray-800`}
                    />
                    <label
                      htmlFor={inputId}
                      className={`absolute left-2 top-5 text-gray-400 text-base transition-all ${
                        value
                          ? "text-xs top-[3px] text-teal-600"
                          : "text-base top-2"
                      } pointer-events-none`}
                    >
                      {info.label}
                    </label>
                    {errors[key] && (
                      <p className="text-red-500 text-xs mt-1">{errors[key]}</p>
                    )}
                  </>
                ) : (
                  // 체크박스 렌더링
                  <div className="flex items-center mt-2">
                    <input
                      id={inputId}
                      ref={locationAgreeRef}
                      name={info.name}
                      type="checkbox"
                      checked={value as boolean}
                      onChange={handleChange}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const button =
                            document.getElementById("signup-next-button");
                          button?.click();
                        }
                      }}
                      className="w-4 h-4 mr-2"
                    />
                    <label
                      htmlFor={inputId}
                      className="text-sm text-gray-700 dark:text-gray-300"
                    >
                      {info.label}
                    </label>
                  </div>
                )}
              </div>
            );
          })}
        </form>

        {/* 다음 버튼 */}
        <button
          id="signup-next-button"
          type="button"
          onClick={handleSubmit}
          className="mt-8 w-full bg-green-500 text-white font-bold py-4 rounded-lg hover:bg-green-600 transition"
        >
          다음
        </button>
      </div>

      {/* 알림 모달 */}
      {alertMsg && <AlertModal message={alertMsg} onClose={closeAlert} />}
    </div>
  );
};

export default SignupForm;
