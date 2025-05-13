"use client";

import ReactDOM from "react-dom";
import { useAlertModal } from "./AlertStore"; // 경로는 상황 맞게 수정

const AlertModal = () => {
  const {
    isOpen,
    message,
    title,
    buttons,
    closeAlert,
    targetRefs = [],
  } = useAlertModal();

  if (!isOpen || !message) return null;

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center dark:bg-black/50"
      onClick={closeAlert}
    >
      <div
        className="bg-white p-6 rounded-lg shadow-lg w-80 "
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <h2 className="text-lg font-bold text-center mb-3 ">{title}</h2>
        )}
        <p className="text-gray-800 text-center whitespace-pre-line mb-4 dark:text-gray-400">
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
                ref?.current?.focus();
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
