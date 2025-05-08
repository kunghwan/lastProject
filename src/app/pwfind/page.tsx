"use client";

import { useEffect, useState, ChangeEvent, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { dbService, FBCollection } from "@/lib/firebase";
import {
  validateName,
  validatePhone,
  validateEmail,
  validatePassword,
} from "@/lib/validations";
import { AUTH } from "@/contextapi/context";
import AlertModal from "@/components/AlertModal";

// 세션 스토리지 키 상수
const STORAGE_KEYS = {
  NAME: "pwfind-name",
  PHONE: "pwfind-phone",
  EMAIL: "pwfind-email",
};

const PwFindResult = () => {
  const router = useRouter(); // 페이지 이동용
  const { user } = AUTH.use(); // 로그인된 유저 정보

  // 각 input DOM을 제어할 ref
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const findPasswordButtonRef = useRef<HTMLButtonElement>(null);
  const newPasswordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  // 사용자 인증 입력값 상태
  const [inputName, setInputName] = useState("");
  const [inputPhone, setInputPhone] = useState("");
  const [inputEmail, setInputEmail] = useState("");

  // 입력 유효성 오류 메시지 상태
  const [inputErrors, setInputErrors] = useState<{
    name?: string;
    phone?: string;
    email?: string;
  }>({});

  // 인증된 이메일
  const [email, setEmail] = useState("");

  // 새 비밀번호 폼 상태
  const [form, setForm] = useState<FindPasswordForm>({
    newPassword: "",
    confirmPassword: "",
  });

  // 비밀번호 유효성 검사 상태
  const [validation, setValidation] = useState<FindPasswordValidation>({});

  // 알림 모달 상태
  const [modal, setModal] = useState<{
    message: string;
    onConfirm?: () => void;
  } | null>(null);

  // 컴포넌트가 로드되었을 때 포커스 처리
  useEffect(() => {
    if (user || email) {
      newPasswordRef.current?.focus();
    } else {
      nameRef.current?.focus();
    }
  }, [user, email]);

  // Enter 키 입력 시 다음 필드로 이동
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (e.currentTarget.name === "name") {
        phoneRef.current?.focus();
      } else if (e.currentTarget.name === "phone") {
        emailRef.current?.focus();
      } else if (e.currentTarget.name === "email") {
        findPasswordButtonRef.current?.click();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (e.currentTarget.name === "newPassword") {
        confirmPasswordRef.current?.focus();
      } else if (e.currentTarget.name === "confirmPassword") {
        submitButtonRef.current?.click();
      }
    }
  };

  // 세션 스토리지에서 인증정보 불러오기
  useEffect(() => {
    const realEmail = sessionStorage.getItem("selectedRealEmail");
    if (realEmail) {
      setEmail(realEmail);
    } else {
      // 이전 입력값 복원
      const savedName = sessionStorage.getItem(STORAGE_KEYS.NAME) || "";
      const savedPhone = sessionStorage.getItem(STORAGE_KEYS.PHONE) || "";
      const savedEmail = sessionStorage.getItem(STORAGE_KEYS.EMAIL) || "";

      setInputName(savedName);
      setInputPhone(savedPhone);
      setInputEmail(savedEmail);

      // 기본 유효성 검사
      setInputErrors({
        name: validateName(savedName) || "",
        phone: validatePhone(savedPhone) || "",
        email: "",
      });

      // 이메일은 비동기 검사
      if (savedEmail) {
        validateEmail(savedEmail).then((error) => {
          if (error) {
            setInputErrors((prev) => ({ ...prev, email: error }));
          }
        });
      }
    }
  }, []);

  // 비밀번호 폼 유효성 검사
  const validateForm = useCallback((): boolean => {
    const errors: FindPasswordValidation = {};
    const { newPassword, confirmPassword } = form;

    const newPasswordMessage = validatePassword(newPassword);
    if (newPasswordMessage) {
      errors.newPassword = { isValid: false, message: newPasswordMessage };
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

  // 비밀번호 폼 상태 변경 시 자동 유효성 검사
  useEffect(() => {
    validateForm();
  }, [form, validateForm]);

  // 비밀번호 입력 변경 핸들러
  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  // 비밀번호 변경 확인 버튼 클릭 핸들러
  const handleSubmit = useCallback(() => {
    if (!validateForm()) return;

    setModal({
      message: "비밀번호가 성공적으로 변경되었습니다.",
      onConfirm: () => {
        sessionStorage.removeItem("selectedRealEmail");
        router.push("/signin"); // 로그인 페이지로 이동
      },
    });
  }, [router, validateForm]);

  // 이름/전화번호/이메일 입력값 변경 시
  const handleInputChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      if (name === "name") {
        const error = validateName(value);
        setInputErrors((prev) => ({ ...prev, name: error || "" }));
        setInputName(value);
        sessionStorage.setItem(STORAGE_KEYS.NAME, value);
      }
      if (name === "phone") {
        const error = validatePhone(value);
        setInputErrors((prev) => ({ ...prev, phone: error || "" }));
        setInputPhone(value);
        sessionStorage.setItem(STORAGE_KEYS.PHONE, value);
      }
      if (name === "email") {
        const error = await validateEmail(value);
        setInputErrors((prev) => ({ ...prev, email: error || "" }));
        setInputEmail(value);
        sessionStorage.setItem(STORAGE_KEYS.EMAIL, value);
      }
    },
    []
  );

  // 사용자 인증 확인 처리
  const handleFindPassword = async () => {
    if (inputErrors.name || inputErrors.phone || inputErrors.email) {
      setModal({ message: "입력한 정보를 다시 확인해주세요." });
      return;
    }
    if (!inputName || !inputPhone || !inputEmail) {
      setModal({ message: "모든 항목을 입력해주세요." });
      return;
    }

    try {
      // Firestore에서 사용자 찾기
      const snap = await dbService
        .collection(FBCollection.USERS)
        .where("name", "==", inputName)
        .where("tel", "==", inputPhone)
        .where("email", "==", inputEmail)
        .get();

      if (snap.empty) {
        setModal({
          message: "입력하신 정보와 일치하는 사용자를 찾을 수 없습니다.",
        });
        return;
      }

      // 인증 성공 처리
      sessionStorage.setItem("selectedRealEmail", inputEmail);
      setEmail(inputEmail);
      setModal({
        message: "본인 인증이 완료되었습니다. 비밀번호를 재설정해주세요.",
      });
    } catch (error) {
      console.error("비밀번호 찾기 오류", error);
      setModal({ message: "비밀번호 찾기 중 오류가 발생했습니다." });
    }
  };

  return (
    <div className="p-2">
      <h2 className="text-2xl font-bold mb-4">비밀번호 재설정</h2>

      {/* 인증 전 화면 */}
      {!user && !email && (
        <div className="flex flex-col gap-2 mb-4 ">
          {/* 이름 입력 */}
          <input
            type="text"
            name="name"
            ref={nameRef}
            value={inputName}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            placeholder="이름 입력"
            className="border p-2 border-emerald-300 placeholder:text-emerald-300 lg:w-150"
          />
          {inputErrors.name && (
            <p className="text-sm text-red-500 ml-1">{inputErrors.name}</p>
          )}

          {/* 전화번호 입력 */}
          <input
            type="text"
            name="phone"
            ref={phoneRef}
            value={inputPhone}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            placeholder="전화번호 입력"
            className="border p-2 border-emerald-300 placeholder:text-emerald-300 lg:w-150"
          />
          {inputErrors.phone && (
            <p className="text-sm text-red-500 ml-1">{inputErrors.phone}</p>
          )}

          {/* 이메일 입력 */}
          <input
            type="email"
            name="email"
            ref={emailRef}
            value={inputEmail}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            placeholder="이메일 입력"
            className="border p-2 border-emerald-300 placeholder:text-emerald-300 lg:w-150"
          />
          {inputErrors.email && (
            <p className="text-sm text-red-500 ml-1">{inputErrors.email}</p>
          )}

          {/* 인증 버튼 */}
          <button
            ref={findPasswordButtonRef}
            type="button"
            className="bg-gray-300 rounded-2xl p-3 mt-2 flex justify-center w-50 items-center lg:w-80"
            onClick={handleFindPassword}
          >
            비밀번호 찾기
          </button>
        </div>
      )}

      {/* 인증 후 비밀번호 재설정 화면 */}
      {(user || email) && (
        <>
          <div className="border h-80 justify-center flex items-center">
            <div>
              <p className="text-xl text-black dark:text-white">
                이메일:{" "}
                <span className="font-bold text-blue-600">
                  {user ? user.email : email}
                </span>
              </p>

              <div className="flex flex-col mt-5">
                {/* 새 비밀번호 입력 */}
                <input
                  type="password"
                  name="newPassword"
                  ref={newPasswordRef}
                  value={form.newPassword}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  placeholder="새비밀번호"
                  className="border p-2 border-emerald-300 placeholder:text-emerald-300"
                />
                {validation.newPassword?.message && (
                  <p className="text-sm text-red-500 ml-1">
                    {validation.newPassword.message}
                  </p>
                )}

                {/* 비밀번호 확인 입력 */}
                <input
                  type="password"
                  name="confirmPassword"
                  ref={confirmPasswordRef}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
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

          {/* 확인 버튼 */}
          <div className="flex justify-center">
            <button
              ref={submitButtonRef}
              className="bg-gray-300 rounded-2xl p-5 mt-3 flex justify-center w-50 items-center lg:w-80"
              onClick={handleSubmit}
            >
              확인
            </button>
          </div>
        </>
      )}

      {/* 알림 모달 */}
      {modal && (
        <AlertModal
          message={modal.message}
          onClose={() => setModal(null)}
          onConfirm={() => {
            modal.onConfirm?.();
            setModal(null);
          }}
        />
      )}
    </div>
  );
};

export default PwFindResult;
