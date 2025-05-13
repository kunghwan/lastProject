import { RefObject } from "react";

interface PlaceListProps {
  places: PlaceProps[];
  handlePlaceClick: (place: PlaceProps) => void;
  buttonRefs: RefObject<Map<string, HTMLButtonElement>>;
}

const PlaceList = ({
  places,
  handlePlaceClick,
  buttonRefs,
}: PlaceListProps) => {
  return (
    <div className="hidden md:flex absolute top-0 right-0 w-72 max-h-[76vh] h-full p-4 bg-gray-100 border-l border-gray-300 flex-col rounded-3xl z-10 overflow-y-auto">
      <ul className="space-y-4 pr-2 overflow-y-auto max-h-[76vh]">
        {places.map((place) => (
          <li
            key={place.id}
            className="bg-white rounded-lg border border-gray-300 cursor-pointer hover:bg-gray-50"
          >
            <button
              ref={(clickFocus) => {
                if (clickFocus) {
                  buttonRefs.current?.set(place.id, clickFocus);
                }
              }}
              className="flex flex-col items-center w-full p-3 gap-y-1 focus:border focus:border-green-500 focus:rounded-lg focus:bg-gray-50"
              onClick={() => handlePlaceClick(place)}
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
  );
};

export default PlaceList;
