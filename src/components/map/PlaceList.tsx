import { RefObject } from "react";
import { IoClose } from "react-icons/io5";

interface PlaceListProps {
  places: PlaceProps[];
  handlePlaceClick: (place: PlaceProps) => void;
  buttonRefs: RefObject<Map<string, HTMLButtonElement>>;
  onClose: () => void;
}

const PlaceList = ({
  places,
  handlePlaceClick,
  buttonRefs,
  onClose,
}: PlaceListProps) => {
  return (
    <div className="hidden md:flex absolute top-0 right-0 w-72 max-h-[76vh] h-full p-4 bg-gray-100 border border-gray-200 flex-col rounded-3xl z-10 dark:bg-[#4B4B4B]  dark:text-[#E5E7EB] ">
      <button
        onClick={onClose}
        className="text-gray-500 hover:text-gray-700 text-2xl  absolute top-3 right-5 dark:text-white"
      >
        <IoClose />
      </button>

      <ul className="space-y-4 overflow-y-auto max-h-full mt-6">
        {places.map((place) => (
          <li
            key={place.id}
            className="bg-white dark:bg-[#6B6B6B] dark:text-[#E5E7EB] rounded-lg border border-gray-300 cursor-pointer hover:opacity-80 hover:outline-none hover:border-green-400  "
          >
            <button
              ref={(clickFocus) => {
                if (clickFocus) {
                  buttonRefs.current?.set(place.id, clickFocus);
                }
              }}
              className="flex flex-col items-center w-full p-3 gap-y-1 outline-none focus:border focus:rounded-lg focus:outline-none focus:border-green-400"
              onClick={() => handlePlaceClick(place)}
            >
              <p className="font-bold">{place.place_name}</p>
              <p className="text-md">
                {place.road_address_name || place.address_name}
              </p>
              <p className="text-sm">{place.phone || "전화번호 없음"}</p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlaceList;
