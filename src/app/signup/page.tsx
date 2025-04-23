"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AUTH } from "@/contextapi/context"; // ✅ 실제 경로에 맞게

// ✅ Context에서 signup 가져오기
import {
  validateName,
  validateEmail,
  validatePassword,
  validateBirth,
  validatePhone,
  validateLocation,
} from "@/lib/validations";
import { dbService, FBCollection } from "@/lib/firebase";

const InfoAccount = [
  { label: "이름", name: "name", type: "text" },
  { label: "이메일", name: "email", type: "email" },
  { label: "비밀번호", name: "password", type: "password" },
  { label: "생년월일", name: "birth", type: "text" },
  { label: "전화번호", name: "tel", type: "text" },
  { label: "위치정보 동의", name: "agreeLocation", type: "checkbox" },
];

const Signup = () => {
  const [user, setUser] = useState<User>({
    uid: "",
    name: "",
    email: "",
    password: "",
    birth: "",
    tel: "",
    agreeLocation: false,
  });

  const navi = useRouter();
  const { signup } = AUTH.use(); // ✅ signup 함수 사용

  const [errors, setErrors] = useState<Partial<Record<keyof User, string>>>({});

  const checkEmailDuplicate = useCallback(async (email: string) => {
    const snap = await dbService
      .collection(FBCollection.USERS)
      .where("email", "==", email)
      .get();
    return !snap.empty;
  }, []);

  const validateField = useCallback(
    async (name: keyof User, value: any) => {
      let message: string | null = null;

      switch (name) {
        case "name":
          message = validateName(value);
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
        case "email":
          message = await validateEmail(value, checkEmailDuplicate);
          break;
        case "agreeLocation":
          message = validateLocation(value);
          break;
      }

      setErrors((prev) => ({ ...prev, [name]: message ?? "" }));
    },
    [checkEmailDuplicate]
  );

  useEffect(() => {
    const validateAllFields = async () => {
      for (const info of InfoAccount) {
        const key = info.name as keyof User;
        const value = user[key];
        await validateField(key, value);
      }
    };

    validateAllFields();
  }, []);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, value, checked } = e.target;
    const fieldName = name as keyof User;
    const fieldValue = type === "checkbox" ? checked : value;

    setUser((prev) => ({
      ...prev,
      [fieldName]: fieldValue,
    }));

    await validateField(fieldName, fieldValue);
  };

  const handleSubmit = async () => {
    const hasError = Object.values(errors).some((msg) => msg);
    if (hasError) {
      alert("입력값을 다시 확인해주세요.");
      return;
    }

    try {
      const result = await signup(user, user.password); // ✅ AuthContext의 signup 함수 호출
      if (!result.success) {
        alert("회원가입 실패: " + result.message);
        return;
      }

      alert("회원가입 성공!");
      navi.push("/"); // 메인페이지 이동
    } catch (err: any) {
      alert("에러 발생: " + err.message);
    }
  };

  return (
    <div className="rounded-2xl h-screen flex flex-col justify-center items-center px-4 min-h-screen">
      <div className="border w-full border-teal-300 rounded-lg max-w-md bg-white divide-y">
        {InfoAccount.map((info, index) => (
          <div key={index} className="flex flex-col px-4 py-3 border-teal-300">
            <div className="flex items-center">
              <label
                htmlFor={info.name}
                className={`text-gray-700 ${
                  info.type === "checkbox" ? "mr-8" : "w-32"
                }`}
              >
                {info.label}
              </label>
              <input
                id={info.name}
                name={info.name}
                type={info.type}
                value={
                  info.type === "checkbox"
                    ? undefined
                    : (user[info.name as keyof User] as string)
                }
                checked={
                  info.type === "checkbox" ? user.agreeLocation : undefined
                }
                onChange={handleChange}
                className={`p-2 outline-none ${
                  info.type === "checkbox"
                    ? "w-4 h-4"
                    : "flex-1   bg-transparent"
                }`}
              />
            </div>

            {errors[info.name as keyof User] && (
              <p className="text-red-500 text-sm mt-1 ml-32">
                {errors[info.name as keyof User]}
              </p>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        className="mt-10 bg-green-500 w-110 p-5 text-white font-bold rounded"
      >
        가입
      </button>
    </div>
  );
};

export default Signup;
