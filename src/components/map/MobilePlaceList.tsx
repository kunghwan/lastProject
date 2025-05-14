"use client";

import { IoMenu } from "react-icons/io5";
import { twMerge } from "tailwind-merge";

type Props = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  places: PlaceProps[];
  handlePlaceClick: (place: PlaceProps) => void;
};

const MobilePlaceList = ({
  isOpen,
  setIsOpen,
  places,
  handlePlaceClick,
}: Props) => {
  return (
    <>
      {/* 수동으로 열기 버튼 */}
      {!isOpen && places.length > 0 && (
        <button
          className="md:hidden fixed bottom-[11vh] my-2 left-[50%] translate-x-[-50%] z-10 bg-white text-gray-500 py-2 rounded-full shadow px-7 hover:bg-gray-50 dark:hover:bg-gray-600 dark:bg-[#6B6B6B] dark:text-gray-50"
          onClick={() => setIsOpen(true)}
        >
          <div className="flex items-center gap-x-2">
            <IoMenu className="text-green-500" />
            목록보기
          </div>
        </button>
      )}

      {/* 슬라이드 패널 */}
      <div
        className={twMerge(
          "fixed inset-x-0 bottom-0 bg-white max-h-[80vh] rounded-t-2xl z-[21] transform transition-transform duration-300 ease-in-out md:hidden dark:bg-[#4B4B4B]",
          isOpen ? "translate-y-0" : "translate-y-full"
        )}
      >
        {/* 위쪽 바 (닫기용) */}
        <div className="mt-5" onClick={() => setIsOpen(false)}>
          <button className="flex items-center justify-center p-3 rounded-2xl mx-auto w-[40vw] bg-gray-200 hover:bg-gray-300 dark:bg-zinc-400 dark:hover:opacity-80" />
        </div>

        {/* 장소 목록 */}
        <div className="p-4 overflow-y-auto h-full">
          <ul className="space-y-4 max-h-[60vh] overflow-y-auto mt-4 px-2 green-scrollbar">
            {places.map((place) => (
              <li
                key={place.id}
                className="bg-white rounded-lg border border-gray-300 cursor-pointer opacity-80 hover:border hover:border-green-500 dark:bg-[#6B6B6B] dark:text-white"
              >
                <button
                  className="flex flex-col items-start w-full p-3 gap-y-1"
                  onClick={() => {
                    handlePlaceClick(place);
                    setIsOpen(false); // 클릭 시 자동 닫힘
                  }}
                >
                  <p className="font-bold">{place.place_name}</p>
                  <p className="text-md">
                    {place.road_address_name || place.address_name}
                  </p>
                  <p className="text-xs">{place.phone || "전화번호 없음"}</p>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default MobilePlaceList;
