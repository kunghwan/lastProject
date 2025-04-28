"use client";

import { useEffect, useState, ChangeEvent, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AUTH } from "@/contextapi/context";
import { validatePassword } from "@/lib/validations";

interface ValidationResult {
  isValid: boolean;
  message?: string;
}

interface FindPasswordForm {
  newPassword: string;
  confirmPassword: string;
}

interface FindPasswordValidation {
  newPassword?: ValidationResult;
  confirmPassword?: ValidationResult;
}

const IdFindResult = () => {
  const router = useRouter();
  const { signin } = AUTH.use();
  const [email, setEmail] = useState("");
  const [form, setForm] = useState<FindPasswordForm>({
    newPassword: "",
    confirmPassword: "",
  });
  const [validation, setValidation] = useState<FindPasswordValidation>({});

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("realEmail");
    if (storedEmail) setEmail(storedEmail);
  }, []);

  const validateForm = useCallback((): boolean => {
    const errors: FindPasswordValidation = {};
    const { newPassword, confirmPassword } = form;

    const newPasswordMessage = validatePassword(newPassword);
    if (newPasswordMessage) {
      errors.newPassword = {
        isValid: false,
        message: newPasswordMessage,
      };
    }

    if (!confirmPassword) {
      errors.confirmPassword = {
        isValid: false,
        message: "비밀번호 확인을 입력해주세요.",
      };
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = {
        isValid: false,
        message: "새 비밀번호와 확인이 일치하지 않습니다.",
      };
    }

    setValidation(errors);
    return Object.keys(errors).length === 0;
  }, [form]);

  useEffect(() => {
    validateForm();
  }, [form, validateForm]);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    alert("비밀번호가 성공적으로 변경되었습니다.");

    const result = await signin(email, form.newPassword);
    if (result.success) {
      router.push("/");
    } else {
      alert("자동 로그인 실패: " + result.message);
    }
  }, [email, form.newPassword, router, signin, validateForm]);

  return (
    <div className="p-2">
      <h2 className="text-2xl font-bold mb-4">비밀번호 재설정</h2>
      <div className="border h-80 justify-center flex items-center">
        <div>
          {email ? (
            <p className="text-xl text-black">
              이메일 : <span className="font-bold text-blue-600">{email}</span>
            </p>
          ) : (
            <p className="text-lg text-gray-500">이메일 정보가 없습니다.</p>
          )}

          <div className="flex flex-col mt-5">
            <input
              type="password"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              placeholder="새비밀번호"
              className="border p-2 border-emerald-300 placeholder:text-emerald-300"
            />
            {validation.newPassword?.message && (
              <p className="text-sm text-red-500 ml-1">
                {validation.newPassword.message}
              </p>
            )}

            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="새 비밀번호 확인"
              className="border p-2 border-emerald-300 mt-2 placeholder:text-emerald-300"
            />
            {validation.confirmPassword?.message && (
              <p className="text-sm text-red-500 ml-1">
                {validation.confirmPassword.message}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-center">
        <button
          className="bg-gray-300 rounded-2xl p-5 mt-3 flex justify-center w-50 items-center lg:w-80 lg:flex"
          onClick={handleSubmit}
        >
          확인
        </button>
      </div>
    </div>
  );
};

export default IdFindResult;
