"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
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
import { useTheme } from "next-themes";
import { useAlertModal } from "@/components/AlertStore";
import Loaiding from "@/components/Loading";

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
  const { openAlert } = useAlertModal();
  const { resolvedTheme } = useTheme();
  // react-select 스타일
  const themeMode = resolvedTheme ?? "light"; // fallback to 'light'

  const selectStyle = useMemo(
    () => ({
      control: (base: any) => ({
        ...base,
        minHeight: "42px",
        fontSize: "14px",
        backgroundColor: themeMode === "dark" ? "#1f2937" : "#fff",
        color: themeMode === "dark" ? "#fff" : "#000",
      }),
      menu: (base: any) => ({
        ...base,
        backgroundColor: themeMode === "dark" ? "#1f2937" : "#fff",
        color: themeMode === "dark" ? "#fff" : "#000",
      }),
      singleValue: (base: any) => ({
        ...base,
        color: themeMode === "dark" ? "#fff" : "#000",
      }),
      option: (base: any, state: any) => ({
        ...base,
        backgroundColor: state.isFocused
          ? themeMode === "dark"
            ? "#6ee7b7" // ✅ emerald-300
            : "#d1fae5" // ✅ emerald-100
          : "transparent",
        color: themeMode === "dark" ? "#fff" : "#000",
      }),
    }),
    [themeMode] // ✅ 여기서 undefined가 들어오면 hook 순서 깨짐 → 방지됨
  );
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

  const [isSubmitting, setIsSubmitting] = useState(false);

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
          if (!value) {
            message = "이메일을 입력해주세요.";
          } else {
            message = await validateEmail(
              value,
              checkEmailDuplicateByFirestore
            );
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
      if (name === "agreeLocation" && checked) {
        openAlert("위치정보 제공 약관에 동의하시겠습니까?", [
          {
            text: "동의함",
            isGreen: true,
            autoFocus: true,
          },
          {
            text: "동의하지않음",
            isGreen: false,
            onClick: () => {
              setUser((prev) => ({ ...prev, agreeLocation: false }));

              locationAgreeRef.current?.click();
            },
          },
        ]);
      }
    },
    [validateField, openAlert]
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
    setIsSubmitting(true); // ✅ 로딩 시작
    // 병렬 유효성 검사 수행
    const validationResults = await Promise.all(
      InfoAccount.map((info) => {
        const key = info.name as keyof typeof user;
        return validateField(key, user[key]);
      })
    );

    // 에러 메시지 객체 구성
    const newErrors: typeof errors = {};
    InfoAccount.forEach((info, index) => {
      const key = info.name as keyof typeof user;
      const message = validationResults[index];
      if (message) newErrors[key] = message;
    });

    setErrors(newErrors);

    // 유효성 오류가 있으면 중단
    const requiredFields: (keyof typeof user)[] = [
      "name",
      "email",
      "password",
      "tel",
    ];
    const missingFields = requiredFields.filter(
      (key) => !user[key]?.toString().trim()
    );

    if (missingFields.length > 0) {
      const fieldLabels: Record<string, string> = {
        name: "이름",
        email: "이메일",
        password: "비밀번호",
        tel: "전화번호",
      };

      const missingText = missingFields
        .map((key) => fieldLabels[key])
        .join(", ");
      const message =
        missingFields.length === requiredFields.length
          ? "아무것도 입력되지 않았습니다. 다시 입력해주세요."
          : `${missingText} 항목을 입력해주세요.`;

      openAlert(message, [
        {
          text: "확인",
          isGreen: true,
          autoFocus: true,
          onClick: () => {
            const firstMissing = missingFields[0];
            const target = inputRefs.current.find(
              (el) => el?.getAttribute("name") === firstMissing
            );
            target?.focus();
          },
        },
      ]);

      setIsSubmitting(false);
      return;
    }

    const result = await signup(user as User, user.password!);
    if (!result.success) {
      openAlert("회원가입 실패: " + result.message, [
        {
          text: "확인",
          isGreen: true,
          autoFocus: true,
        },
      ]);
      setIsSubmitting(false); // ✅ 로딩 종료
      return;
    }

    const fbUser = authService.currentUser;
    if (!fbUser) {
      openAlert("회원 정보가 없습니다. 다시 시도해주세요.", [
        {
          text: "확인",
          isGreen: true,
          autoFocus: true,
        },
      ]);
      setIsSubmitting(false); // ✅ 로딩 종료
      return;
    }

    const fullUser = { ...user, uid: fbUser.uid };
    await authService.signOut();
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(fullUser));
    router.push("/signup/settingprofile");
  }, [signup, user, validateField, router]);

  if (!isLoaded) return null; // 로딩 안 됐으면 렌더 안 함

  return (
    <div className="flex flex-col items-center justify-start mt-1  ">
      <div className="w-full max-w-md bg-white dark:bg-[#484848] border border-gray-400 rounded-lg p-6 dark:border-gray-500 ">
        {/* form 내용 */}
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
                        onChange={(opt) => {
                          setBirthYear(opt?.value ?? "");
                          // ✅ 년도 선택 후 자동으로 월 select 열기
                          setTimeout(() => {
                            monthSelectRef.current?.focus();
                            monthSelectRef.current?.onMenuOpen?.();
                          }, 0); // setState 후 DOM update 기다림
                        }}
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
                        onChange={(opt) => {
                          setBirthMonth(opt?.value ?? "");
                          // ✅ 월 선택 후 일로 넘어가기
                          setTimeout(() => {
                            daySelectRef.current?.focus();
                            daySelectRef.current?.onMenuOpen?.();
                          }, 0);
                        }}
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
                        onChange={(opt) => {
                          setBirthDay(opt?.value ?? "");
                          // ✅ 일 선택 후 전화번호 input으로 포커스 이동
                          setTimeout(() => {
                            const telInput = inputRefs.current.find(
                              (el) => el?.getAttribute("name") === "tel"
                            );
                            telInput?.focus();
                          }, 0);
                        }}
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
                      className={` peer w-full border rounded-md  dark:bg-[#666666]  h-12 px-2 pt-[10px] pb-[10px] text-base outline-none placeholder-transparent ${
                        errors[key] ? "border-gray-400 " : "border-emerald-500"
                      } focus:border-primary transition-all h-16 dark:text-white `}
                    />
                    <label
                      htmlFor={inputId}
                      className={`absolute left-2 top-5 text-gray-400 text-base transition-all ${
                        value
                          ? "text-xs top-[4px] text-teal-600"
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
                  <>
                    <div className="flex items-center ">
                      <label className="flex items-start cursor-pointer">
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
                          className="w-4 h-4 mt-1 mr-2"
                        />
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {info.label}
                          </span>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            위치정보는 주변 추천 장소 검색, 맞춤 콘텐츠 제공
                            등을 위해 사용됩니다.
                          </p>
                        </div>
                      </label>
                    </div>
                    {/* ✅ 위치정보 설명문구 조건부로 추가 (Fragment 내부에 있어야 함) */}
                  </>
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
          className="mt-2 w-full bg-primary text-black font-bold py-4 rounded-lg hover:bg-emerald-500 transition dark:text-white dark:bg-emerald-500"
        >
          다음
        </button>
      </div>

      {isSubmitting && (
        <Loaiding isLoading={true} message="가입 처리 중입니다..." />
      )}
    </div>
  );
};

export default SignupForm;
