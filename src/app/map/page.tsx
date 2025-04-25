"use client";
import { useEffect, useRef, useState } from "react";
import { IoCloseSharp, IoSearch } from "react-icons/io5";

declare global {
  interface Window {
    kakao: any;
  }
}

type Place = {
  id: string;
  place_name: string;
  address_name: string;
  road_address_name: string;
  phone: string;
  x: string;
  y: string;
};

const MapPage = () => {
  const [map, setMap] = useState<any>(null);

  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  const [keyword, setKeyword] = useState("");
  const [inputValue, setInputValue] = useState("");

  const markers = useRef<any[]>([]);

  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current) return;
      const center = new window.kakao.maps.LatLng(36.3324, 127.4345);
      const mapInstance = new window.kakao.maps.Map(mapRef.current, {
        center,
        level: 7,
      });
      setMap(mapInstance);
    };

    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(initMap);
    }
  }, []);

  const searchPlaces = (keyword: string) => {
    if (!map) return;
    const { maps } = window.kakao;
    const ps = new maps.services.Places();
    const bounds = new maps.LatLngBounds(
      new maps.LatLng(36.175, 127.29),
      new maps.LatLng(36.48, 127.58)
    );

    ps.keywordSearch(
      keyword,
      (data: Place[], status: string) => {
        if (status !== maps.services.Status.OK) return;

        setPlaces(data);
        markers.current.forEach((m) => m.setMap(null));
        markers.current = [];

        data.forEach((place) => {
          const position = new maps.LatLng(Number(place.y), Number(place.x));
          const marker = new maps.Marker({ position, map });

          maps.event.addListener(marker, "click", () => {
            handlePlaceClick(place);
          });

          markers.current.push(marker);
        });
      },
      { bounds }
    );
  };

  useEffect(() => {
    if (keyword) {
      searchPlaces(keyword);
    }
  }, [map, keyword]);

  const handlePlaceClick = (place: Place, showDetail: boolean = true) => {
    if (!map) return;

    const latlng = new window.kakao.maps.LatLng(
      Number(place.y),
      Number(place.x)
    );

    // 마커 위치 기준으로 픽셀 보정
    const projection = map.getProjection();
    const point = projection.pointFromCoords(latlng);

    // 좌측 패널 너비만큼 우측으로 이동 (예: 150px)
    const adjustedPoint = new window.kakao.maps.Point(point.x + 150, point.y);
    const newCenter = projection.coordsFromPoint(adjustedPoint);

    // 💡 panTo 사용 시 부드럽게 이동
    map.panTo(newCenter);

    if (showDetail) {
      setSelectedPlace(place);
    }
  };

  const handleSearch = () => {
    setKeyword(inputValue.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="flex flex-col relative dark:text-black h-screen overflow-hidden ">
      <div className="p-2.5 flex bg-white absolute z-50 left-10 top-10 rounded-full shadow-md">
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="원하는 장소를 입력하세요."
          className="p-1 text-base mx-2.5 w-60 focus:outline-none placeholder:text-gray-500 "
        />
        <button onClick={handleSearch} className="text-2xl px-1 cursor-pointer">
          <IoSearch />
        </button>
      </div>

      <div className="flex flex-1">
        {selectedPlace && (
          <div className="w-52 h-full overflow-y-auto border-r border-gray-300 p-4 bg-gray-100 relative">
            <button
              onClick={() => setSelectedPlace(null)}
              className="absolute top-2 right-2 bg-transparent border-none text-lg cursor-pointer"
            >
              <IoCloseSharp className="dark:text-black" />
            </button>

            <h2 className="text-lg font-semibold mb-2">📌 상세 정보</h2>
            <p className="font-bold">{selectedPlace.place_name}</p>
            <p>
              {selectedPlace.road_address_name || selectedPlace.address_name}
            </p>
            <p className="text-sm text-gray-600">
              ☎ {selectedPlace.phone || "전화번호 없음"}
            </p>
          </div>
        )}

        {/* 지도 */}
        <div ref={mapRef} className="flex-1 h-screen bg-gray-200" />

        {/* 검색 결과 리스트 */}
        {keyword.length !== 0 && (
          <div className="w-72 h-screen p-4 bg-gray-100 border-l border-gray-300 ">
            <h2 className="text-lg font-semibold mb-4">검색 결과</h2>
            <ul className="space-y-4 overflow-y-auto h-[calc(100%-2rem)] pr-2">
              {places.map((place) => (
                <li
                  key={place.id}
                  onClick={() => handlePlaceClick(place, false)}
                  className="p-3 bg-white rounded-lg border border-gray-300 cursor-pointer hover:bg-gray-50"
                >
                  <p className="font-bold">{place.place_name}</p>
                  <p className="text-sm">
                    {place.road_address_name || place.address_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {place.phone || "전화번호 없음"}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapPage;
