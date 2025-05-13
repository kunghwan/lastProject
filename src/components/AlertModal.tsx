"use client";

import ReactDOM from "react-dom";
import { useAlertModal } from "./AlertStore"; // 경로는 상황 맞게 수정
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

const AlertModal = () => {
  const {
    isOpen,
    message,
    title,
    buttons,
    closeAlert,
    targetRefs = [],
  } = useAlertModal();

  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen && message) {
      setTimeout(() => setShow(true), 10); // mount 후 애니메이션 트리거
    } else {
      setShow(false);
    }
  }, [isOpen, message]);

  if (!isOpen || !message) return null;

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center dark:bg-black/50"
      onClick={closeAlert}
    >
      <div
        className={twMerge(
          "bg-white p-6 rounded-lg shadow-lg w-80 transform transition-all duration-800 ease-out",
          show ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <h2 className="text-lg font-bold text-center mb-3 ">{title}</h2>
        )}
        <p className="text-gray-800 text-center whitespace-pre-line mb-4 dark:text-gray-400 ">
          {message}
        </p>
        <div className="flex gap-2">
          {buttons?.map((btn, i) => (
            <button
              key={i}
              autoFocus={btn.autoFocus}
              onClick={() => {
                btn.onClick?.();
                // ✅ 포커스 타겟 처리 (null 방지)
                const ref =
                  btn.target !== undefined ? targetRefs[btn.target] : null;
                setTimeout(() => {
                  ref?.current?.focus();
                }, 100);
                closeAlert();
              }}
              className={`flex-1 py-2 rounded text-white transition outline-none  ${
                btn.isGreen
                  ? "bg-green-500 hover:bg-green-600 dark:bg-green-300 dark:hover:bg-green-200"
                  : "bg-gray-400 hover:bg-gray-500 dark:bg-gray-300 dark:hover:bg-gray-200"
              }`}
            >
              {btn.text || "확인"}
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AlertModal;
