import React from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const NoResultsModal = ({ isOpen, onClose }: Props) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed top-0 bg-gray-400/50 left-0 w-full h-full flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-md shadow-lg">
        <h2 className="text-lg font-semibold mb-2">검색 결과 없음</h2>
        <p className="text-gray-700 mb-4">
          검색하신 키워드에 대한 결과가 없습니다.
        </p>
        <button
          onClick={onClose}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          확인
        </button>
      </div>
    </div>
  );
};

export default NoResultsModal;
