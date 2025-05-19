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
  "flex flex-col items-center w-full p-3 gap-y-1 outline-none border rounded-lg border-gray-200 dark:border dark:border-gray-400 focus:border focus:rounded-lg hover:border hover:rounded-lg hover:border-primary focus:border-primary";

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
        "hidden md:flex absolute top-0 right-4 w-80 p-4 h-full bg-gray-50 border border-gray-200 flex-col rounded-3xl z-10 dark:bg-[#444444] dark:border-[#444444] dark:text-[#E5E7EB] transform transition-transform duration-300 ease-linear", // 애니메이션 부드럽게
        isOpen ? "translate-x-0" : "translate-x-20" //
      )}
    >
      <button
        onClick={() => {
          setIsOpen(false);
          onClose();
        }}
        className="text-gray-500 hover:text-gray-300 text-2xl absolute top-3 right-5 dark:text-white"
      >
        <IoClose />
      </button>

      <ul className="space-y-4 overflow-y-auto max-h-full mt-6 px-3 ">
        {places.map((place) => (
          <li
            key={place.id}
            className="bg-gray-100 dark:bg-[#555555] dark:text-[#E5E7EB] rounded-lg hover:opacity-80"
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
