"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  validateName,
  validateEmail,
  validatePassword,
  validateBirth,
  validatePhone,
  validateLocation,
} from "@/lib/validations";
import { AUTH } from "@/contextapi/context";
import { fetchSignInMethodsForEmail } from "firebase/auth";
import { authService } from "@/lib/firebase";

const STORAGE_KEY = "signupUser";

const InfoAccount = [
  { label: "이름", name: "name", type: "text" },
  { label: "이메일", name: "email", type: "email" },
  { label: "비밀번호", name: "password", type: "password" },
  { label: "생년월일", name: "birth", type: "text" },
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

  const [errors, setErrors] = useState<Partial<Record<keyof User, string>>>({});
  const { signup } = AUTH.use();
  const router = useRouter();

  const inputRefs = useRef<HTMLInputElement[]>([]);

  const setInputRef = useCallback(
    (el: HTMLInputElement | null, index: number) => {
      if (el) inputRefs.current[index] = el;
    },
    []
  );

  const checkEmailDuplicate = async (email: string): Promise<boolean> => {
    const methods = await fetchSignInMethodsForEmail(authService, email);
    return methods.length > 0;
  };

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) setUser(JSON.parse(stored));
  }, []);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }, [user]);

  const validateField = useCallback(
    async (name: keyof User, value: any): Promise<string | null> => {
      let message: string | null = null;
      switch (name) {
        case "name":
          message = validateName(value);
          break;
        case "email":
          message = await validateEmail(value, checkEmailDuplicate);
          break;
        case "password":
          message = validatePassword(value);
          break;
        case "birth":
          message = validateBirth(value);
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
    [checkEmailDuplicate]
  );

  useEffect(() => {
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

    // 첫 번째 input 자동 포커스
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, value, checked } = e.target;
    const fieldName = name as keyof typeof user;
    const fieldValue = type === "checkbox" ? checked : value;

    setUser((prev) => ({ ...prev, [fieldName]: fieldValue }));
    await validateField(fieldName, fieldValue);
  };

  const handleKeyDown =
    (index: number) => (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const nextInput = inputRefs.current[index + 1];
        nextInput?.focus();
      }
    };

  const handleSubmit = async () => {
    const newErrors: typeof errors = {};
    for (const info of InfoAccount) {
      const key = info.name as keyof typeof user;
      const message = await validateField(key, user[key]);
      if (message) newErrors[key] = message;
    }
    setErrors(newErrors);

    if (Object.values(newErrors).some((msg) => msg)) {
      alert("입력값을 다시 확인해주세요.");
      return;
    }

    const result = await signup(user as User, user.password!);
    if (!result.success) {
      alert("회원가입 실패: " + result.message);
      return;
    }

    router.push("/signup/settingprofile");
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 border border-teal-300 rounded-lg p-6">
        <form className="space-y-8">
          {InfoAccount.map((info, index) => {
            const key = info.name as keyof typeof user;
            const inputId = `${info.name}-${index}`;
            const value = user[key];

            return (
              <div key={index} className="relative">
                {info.type !== "checkbox" ? (
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
                      className={`w-full border rounded-md px-2 pt-5 pb-2 text-base outline-none
                        placeholder-transparent
                        ${errors[key] ? "border-red-500" : "border-gray-300"}
                        focus:border-teal-400
                        transition-all
                        h-16
                        dark:text-white dark:bg-gray-800
                      `}
                    />
                    <label
                      htmlFor={inputId}
                      className={`absolute left-2 top-5 text-gray-400 text-base transition-all
                        ${value ? "text-xs top-[3px] text-teal-600" : "text-base top-2"}
                        pointer-events-none
                      `}
                    >
                      {info.label}
                    </label>

                    {errors[key] && (
                      <p className="text-red-500 text-xs mt-1">{errors[key]}</p>
                    )}
                  </>
                ) : (
                  <div className="flex items-center mt-2">
                    <input
                      id={inputId}
                      name={info.name}
                      type="checkbox"
                      checked={value as boolean}
                      onChange={handleChange}
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

        <button
          type="button"
          onClick={handleSubmit}
          className="mt-8 w-full bg-green-500 text-white font-bold py-4 rounded-lg hover:bg-green-600 transition"
        >
          다음
        </button>
      </div>
    </div>
  );
};

export default SignupForm;
