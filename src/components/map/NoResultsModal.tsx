import React, { useEffect } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const NoResultsModal = ({ isOpen, onClose }: Props) => {
  useEffect(() => {
    if (!isOpen) return;

    //! 엔터키 창끄기
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed top-0 bg-gray-400/50 left-0 w-full h-full flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg flex flex-col">
        <h2 className="text-lg font-semibold mb-2 flex justify-center items-center">
          검색 결과 없습니다.
        </h2>
        <p className="text-gray-700 mb-4 flex">다시 입력해주시길 바랍니다.</p>
        <button
          onClick={onClose}
          className="bg-green-500 hover:opacity-80 text-white font-bold py-2 px-4 rounded-lg"
        >
          확인
        </button>
      </div>
    </div>
  );
};

export default NoResultsModal;
