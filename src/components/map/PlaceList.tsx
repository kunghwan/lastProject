import { RefObject, useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { twMerge } from "tailwind-merge";

interface PlaceListProps {
  places: PlaceProps[];
  handlePlaceClick: (place: PlaceProps) => void;
  buttonRefs: RefObject<Map<string, HTMLButtonElement>>;
  onClose: () => void;
}

const listBtn =
  "flex flex-col items-center w-full p-3 gap-y-1 outline-none border rounded-lg border-gray-200 dark:border dark:border-gray-400 focus:border focus:rounded-lg hover:border hover:rounded-lg hover:border-green-400 focus:border-green-400";

const PlaceList = ({
  places,
  handlePlaceClick,
  buttonRefs,
  onClose,
}: PlaceListProps) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(true);
    return () => setIsOpen(false);
  }, []);

  return (
    <div
      className={twMerge(
        "hidden md:flex absolute top-0 right-4 w-80 max-h-[76vh] h-full p-4 bg-gray-100 border border-gray-200 flex-col rounded-3xl z-10 dark:bg-[#4B4B4B] dark:text-[#E5E7EB] transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      <button
        onClick={() => {
          setIsOpen(false);
          setTimeout(onClose, 300);
        }}
        className="text-gray-500 hover:text-gray-300 text-2xl absolute top-3 right-5 dark:text-white"
      >
        <IoClose />
      </button>

      <ul className="space-y-4 overflow-y-auto max-h-full mt-6 px-3 green-scrollbar">
        {places.map((place) => (
          <li
            key={place.id}
            className="bg-white dark:bg-[#6B6B6B] dark:text-[#E5E7EB] rounded-lg hover:opacity-80"
          >
            <button
              ref={(clickFocus) => {
                if (clickFocus) {
                  buttonRefs.current?.set(place.id, clickFocus);
                }
              }}
              className={listBtn}
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
