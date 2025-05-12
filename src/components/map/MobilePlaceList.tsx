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
      {/* 목록 보기 버튼 */}
      <button
        className="md:hidden fixed bottom-[11vh] my-2 left-[50%] translate-x-[-50%] z-10 bg-white text-gray-500 py-2 rounded-full shadow px-7 hover:bg-gray-50"
        onClick={() => setIsOpen(true)}
      >
        <div className="flex items-center gap-x-2">
          <IoMenu className="text-green-500" />
          목록보기
        </div>
      </button>

      {/* 슬라이딩 패널 */}
      <div
        className={twMerge(
          " fixed inset-x-0 bottom-0  bg-white max-h-[80vh] rounded-t-2xl z-[21] transform transition-transform duration-300 ease-in-out md:hidden",
          isOpen ? "translate-y-0" : "translate-y-full "
        )}
      >
        <div className="mt-5" onClick={() => setIsOpen(false)}>
          <button className="flex items-center justify-center p-3 rounded-2xl mx-auto w-[40vw] bg-gray-200 hover:bg-gray-300 " />
        </div>

        <div className="p-4 overflow-y-auto h-full">
          <ul className="space-y-4 max-h-[60vh] overflow-y-auto mt-4">
            {places.map((place) => (
              <li
                key={place.id}
                className="bg-white rounded-lg border border-gray-300 cursor-pointer hover:bg-gray-100"
              >
                <button
                  className="flex flex-col items-start w-full p-3 gap-y-1"
                  onClick={() => {
                    handlePlaceClick(place);
                    setIsOpen(false);
                  }}
                >
                  <p className="font-bold">{place.place_name}</p>
                  <p className="text-sm">
                    {place.road_address_name || place.address_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {place.phone || "전화번호 없음"}
                  </p>
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
