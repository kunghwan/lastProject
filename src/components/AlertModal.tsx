// components/AlertModal.tsx
import React, { useEffect } from "react";

interface AlertModalProps {
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
  showCancel?: boolean;
}

const AlertModal = ({
  message,
  onClose,
  onConfirm,
  showCancel,
}: AlertModalProps) => {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (onConfirm) {
          // ✅ 이벤트 루프 끝나고 실행
          setTimeout(() => {
            onConfirm();
          }, 0);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, onConfirm]);

  return (
    <div className="fixed inset-0  bg-opacity-40 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80">
        <p className="text-gray-800 text-center mb-4">{message}</p>
        <div className="flex gap-4">
          {showCancel && (
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400"
            >
              취소
            </button>
          )}
          <button
            onClick={onConfirm || onClose}
            className="flex-1 bg-emerald-500 text-white py-2 rounded hover:bg-emerald-600"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
