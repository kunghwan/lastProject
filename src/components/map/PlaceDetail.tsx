"use client";

import { useCallback } from "react";
import { IoCloseSharp, IoPhonePortraitSharp } from "react-icons/io5";
import { TbMapPinDown } from "react-icons/tb";

interface Props {
  place: PlaceProps;
  onClose: () => void;
  detailRef: React.RefObject<HTMLDivElement | null>;
}

const PlaceDetail: React.FC<Props> = ({ place, onClose, detailRef }) => {
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

  return (
    <div
      ref={detailRef}
      className="absolute z-10 shadow-md sm:top-23 sm:right-75 left-[20%] sm:left-[30%] sm:block top-[30%] -translate-y-1/2 sm:translate-x-0 sm:translate-y-0 w-60 max-w-xs bg-white border border-gray-300 rounded-xl sm:rounded-2xl p-4 h-fit"
    >
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-lg sm:text-xl font-bold"
      >
        <IoCloseSharp />
      </button>

      <h2 className="text-sm sm:text-md mb-2 font-semibold">상세 정보</h2>
      <p className="font-bold sm:font-extrabold text-base sm:text-lg text-green-600 truncate">
        {place.place_name}
      </p>
      <p className="text-sm truncate">
        {place.road_address_name || place.address_name}
      </p>
      <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">
        {place.phone || "전화번호 없음"}
      </p>

      <ul className="mt-2 flex gap-x-2 text-lg sm:text-xl">
        {jusoClip(place).map(({ icon, text, msg }, i) => (
          <button
            key={i}
            onClick={() => {
              if (text === "전화번호 없음") {
                alert("해당 장소의 전화번호가 등록되지 않았습니다.");
              } else {
                navigator.clipboard.writeText(text);
                alert(msg);
              }
            }}
          >
            {icon}
          </button>
        ))}
      </ul>
    </div>
  );
};

export default PlaceDetail;
