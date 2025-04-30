// components/AlertModal.tsx
import React from "react";

interface AlertModalProps {
  message: string;
  onClose: () => void;
}

const AlertModal = ({ message, onClose }: AlertModalProps) => {
  return (
    <div className="fixed inset-0  bg-opacity-40 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80">
        <p className="text-gray-800 text-center mb-4">{message}</p>
        <button
          className="w-full bg-emerald-500 text-white font-bold py-2 rounded hover:bg-emerald-600"
          onClick={onClose}
        >
          확인
        </button>
      </div>
    </div>
  );
};

export default AlertModal;
