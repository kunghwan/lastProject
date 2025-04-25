"use client";
import { useState, useCallback, useEffect } from "react";
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
  const checkEmailDuplicate = async (email: string): Promise<boolean> => {
    const methods = await fetchSignInMethodsForEmail(authService, email);
    return methods.length > 0;
  };
  // :흰색_확인_표시: sessionStorage 복원
  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) setUser(JSON.parse(stored));
  }, []);
  // :흰색_확인_표시: sessionStorage 저장
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
  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, value, checked } = e.target;
    const fieldName = name as keyof typeof user;
    const fieldValue = type === "checkbox" ? checked : value;
    setUser((prev) => ({ ...prev, [fieldName]: fieldValue }));
    await validateField(fieldName, fieldValue);
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
    // sessionStorage.removeItem(STORAGE_KEY); // :x: 이 타이밍 X
    router.push("/signup/settingprofile");
  };
  return (
    <div className="rounded-2xl h-screen flex flex-col justify-center items-center px-4 min-h-screen">
      <div className="border w-full border-teal-300 rounded-lg max-w-md bg-white divide-y">
        {InfoAccount.map((info, index) => {
          const key = info.name as keyof typeof user;
          const inputId = `${info.name}-${index}`;
          const value = user[key];
          return (
            <div
              key={index}
              className="flex flex-col px-4 py-3 border-teal-300"
            >
              <div className="flex items-center">
                <label
                  htmlFor={inputId}
                  className={`text-gray-700 ${
                    info.type === "checkbox" ? "mr-8" : "w-32"
                  }`}
                >
                  {info.label}
                </label>
                <input
                  id={inputId}
                  name={info.name}
                  type={info.type}
                  value={
                    info.type === "checkbox" ? undefined : (value as string)
                  }
                  checked={
                    info.type === "checkbox" ? (value as boolean) : undefined
                  }
                  onChange={handleChange}
                  className={`p-2 outline-none ${
                    info.type === "checkbox"
                      ? "w-4 h-4"
                      : "flex-1 bg-transparent"
                  }`}
                />
              </div>
              {errors[key] && (
                <p className="text-red-500 text-sm mt-1 ml-32">{errors[key]}</p>
              )}
            </div>
          );
        })}
      </div>
      <button
        onClick={handleSubmit}
        className="mt-10 bg-green-500 w-110 p-5 text-white font-bold rounded"
      >
        다음
      </button>
    </div>
  );
};
export default SignupForm;
