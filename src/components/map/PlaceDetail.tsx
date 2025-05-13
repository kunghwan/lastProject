// "use client";

// import React, { useState, useCallback } from "react";
// import { IoCloseSharp, IoPhonePortraitSharp } from "react-icons/io5";
// import { TbMapPinDown } from "react-icons/tb";
// import { RefObject } from "react";
// import AlertModal from "@/components/AlertModal";

// interface Props {
//   place: PlaceProps;
//   onClose: () => void;
//   detailRef: RefObject<HTMLDivElement | null>;
// }

// const PlaceDetail = ({ detailRef, onClose, place }: Props) => {
//   const [isAlertVisible, setAlertVisible] = useState(false); // 알림 모달 보이기 상태
//   const [alertMessage, setAlertMessage] = useState(""); // 알림 메시지 상태

//   const jusoClip = useCallback(
//     (selectedPlace: PlaceProps) => [
//       {
//         icon: <TbMapPinDown />,
//         text: selectedPlace.road_address_name || selectedPlace.address_name,
//         msg: "주소가 복사되었습니다!",
//       },
//       {
//         icon: <IoPhonePortraitSharp />,
//         text: selectedPlace.phone || "전화번호 없음",
//         msg: "전화번호가 복사되었습니다!",
//       },
//     ],
//     []
//   );

//   //! 복사 시 모달 표시 함수
//   const handleCopy = (text: string, msg: string) => {
//     if (text === "전화번호 없음") {
//       alert("해당 장소의 전화번호가 등록되지 않았습니다.");
//     } else {
//       navigator.clipboard.writeText(text);
//       setAlertMessage(msg); // 알림 메시지 설정
//       setAlertVisible(true); // 알림 모달 표시
//     }
//   };

//   //! 알림 모달 닫기 함수
//   const handleCloseAlert = () => {
//     setAlertVisible(false);
//     setAlertMessage(""); // 메시지 초기화
//   };

//   return (
//     <div
//       ref={detailRef}
//       className="absolute z-10 shadow-md sm:block sm:top-[22%] sm:left-[31%] left-[20%] top-[30%] -translate-y-1/2 sm:translate-x-0 sm:translate-y-0 w-60 max-w-xs bg-white border border-gray-300 rounded-xl sm:rounded-2xl p-3 h-fit dark:bg-[#6B6B6B] dark:text-white"
//     >
//       <button
//         onClick={onClose}
//         className="absolute top-2 right-2 text-lg sm:text-xl font-bold"
//       >
//         <IoCloseSharp />
//       </button>

//       <h2 className="text-sm sm:text-md mb-2 font-semibold">상세 정보</h2>
//       <p className="font-bold sm:font-extrabold text-base sm:text-lg text-green-400  truncate">
//         {place.place_name}
//       </p>
//       <p className="text-sm truncate">
//         {place.road_address_name || place.address_name}
//       </p>
//       <p className="text-xs sm:text-sm  mt-1 truncate">
//         {place.phone || "전화번호 없음"}
//       </p>

//       <ul className="mt-2 flex gap-x-2 text-lg sm:text-xl">
//         {jusoClip(place).map(({ icon, text, msg }, i) => (
//           <button
//             key={i}
//             onClick={() => handleCopy(text, msg)} // 복사 시 모달 표시
//           >
//             {icon}
//           </button>
//         ))}
//       </ul>

//       {/* AlertModal이 표시될 때만 렌더링 */}
//       {isAlertVisible && (
//         <AlertModal message={alertMessage} onClose={handleCloseAlert} />
//       )}
//     </div>
//   );
// };

// export default PlaceDetail;

"use client";

import React, { useCallback } from "react";
import { IoCloseSharp, IoPhonePortraitSharp } from "react-icons/io5";
import { TbMapPinDown } from "react-icons/tb";
import { RefObject } from "react";
import { useAlertModal } from "../AlertStore";

interface Props {
  place: PlaceProps;
  onClose: () => void;
  detailRef: RefObject<HTMLDivElement | null>;
}

const PlaceDetail = ({ detailRef, onClose, place }: Props) => {
  const { openAlert } = useAlertModal(); // useAlertModal 훅 사용

  const jusoClip = useCallback(
    (selectedPlace: PlaceProps) => [
      {
        icon: <TbMapPinDown />,
        text: selectedPlace.road_address_name || selectedPlace.address_name,
        msg: "주소가 복사되었습니다!",
      },
      {
        icon: <IoPhonePortraitSharp />,
        text: selectedPlace.phone || "전화번호 없음",
        msg: "전화번호가 복사되었습니다!",
      },
    ],
    []
  );

  //! 복사 시 모달 표시 함수
  const handleCopy = (text: string, msg: string) => {
    if (text === "전화번호 없음") {
      alert("해당 장소의 전화번호가 등록되지 않았습니다.");
    } else {
      navigator.clipboard.writeText(text);
      openAlert({ message: msg }); // 알림 메시지 열기
    }
  };

  return (
    <div
      ref={detailRef}
      className="absolute z-10 shadow-md sm:block sm:top-[22%] sm:left-[31%] left-[20%] top-[30%] -translate-y-1/2 sm:translate-x-0 sm:translate-y-0 w-60 max-w-xs bg-white border border-gray-300 rounded-xl sm:rounded-2xl p-3 h-fit dark:bg-[#6B6B6B] dark:text-white"
    >
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-lg sm:text-xl font-bold"
      >
        <IoCloseSharp />
      </button>

      <h2 className="text-sm sm:text-md mb-2 font-semibold">상세 정보</h2>
      <p className="font-bold sm:font-extrabold text-base sm:text-lg text-green-400 truncate">
        {place.place_name}
      </p>
      <p className="text-sm truncate">
        {place.road_address_name || place.address_name}
      </p>
      <p className="text-xs sm:text-sm mt-1 truncate">
        {place.phone || "전화번호 없음"}
      </p>

      <ul className="mt-2 flex gap-x-2 text-lg sm:text-xl">
        {jusoClip(place).map(({ icon, text, msg }, i) => (
          <button key={i} onClick={() => handleCopy(text, msg)}>
            {icon}
          </button>
        ))}
      </ul>
    </div>
  );
};

export default PlaceDetail;
