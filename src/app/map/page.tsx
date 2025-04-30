"use client";

import SearchForm from "@/components/map/SearchForm";
import MobilePlaceList from "@/components/map/MobilePlaceList";
import { useCallback, useEffect, useRef, useState } from "react";
import { IoCloseSharp, IoPhonePortraitSharp } from "react-icons/io5";
import { TbMapPinDown } from "react-icons/tb";
import { PlaceProps } from "@/types";

declare global {
  interface Window {
    kakao: any;
  }
}

const MapPage = () => {
  const [map, setMap] = useState<any>(null);
  const [places, setPlaces] = useState<PlaceProps[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlaceProps | null>(null);
  const [keyword, setKeyword] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const markers = useRef<any[]>([]);
  const mapRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null); // 상세 정보창 ref

  const detailInfoCss =
    "absolute z-10 shadow-md sm:top-20 sm:right-75 sm:block top-[27%] left-1/2 -translate-x-1/2 -translate-y-1/2 sm:translate-x-0 sm:translate-y-0 sm:w-60 w-[65vw] max-w-xs bg-white border border-gray-300 rounded-xl sm:rounded-2xl p-4";

  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current) return;

      const center = new window.kakao.maps.LatLng(36.3324, 127.4345);
      const mapInstance = new window.kakao.maps.Map(mapRef.current, {
        center,
        level: 6,
      });

      setMap(mapInstance);
    };

    const loadKakaoMapScript = () => {
      const script = document.createElement("script");
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_API_KEY}&autoload=false&libraries=services`;
      script.async = true;
      script.onload = () => {
        window.kakao.maps.load(() => {
          initMap();
        });
      };
      document.head.appendChild(script);
    };

    if (typeof window !== "undefined") {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          initMap();
        });
      } else {
        loadKakaoMapScript();
      }
    }
  }, []);

  const handlePlaceClick = useCallback(
    (place: PlaceProps, showDetail: boolean = true) => {
      if (!map) return;

      const latlng = new window.kakao.maps.LatLng(
        Number(place.y),
        Number(place.x)
      );

      // ✅ 클릭된 마커를 지도 중앙으로 부드럽게 이동
      map.panTo(latlng);

      if (showDetail) setSelectedPlace(place);
    },
    [map]
  );

  const searchPlaces = useCallback(
    (keyword: string) => {
      if (!map) return;

      const { maps } = window.kakao;
      const ps = new maps.services.Places();
      const bounds = new maps.LatLngBounds(
        new maps.LatLng(36.175, 127.29),
        new maps.LatLng(36.48, 127.58)
      );

      ps.keywordSearch(
        keyword,
        (data: PlaceProps[], status: string) => {
          if (status !== maps.services.Status.OK) return;

          setPlaces(data);

          // 기존 마커 및 오버레이 제거
          markers.current.forEach((m) => m.setMap(null));
          markers.current = [];

          data.forEach((place) => {
            const position = new maps.LatLng(Number(place.y), Number(place.x));
            const marker = new maps.Marker({ position, map });

            maps.event.addListener(marker, "click", () => {
              handlePlaceClick(place);
            });

            // ✅ Tailwind 적용된 오버레이
            const label = document.createElement("div");
            label.className =
              "bg-white border border-gray-300 px-2 p-0.5 text-sm rounded shadow font-normal text-gray-800 truncate w-20 ";
            label.innerText = place.place_name;

            const overlay = new maps.CustomOverlay({
              content: label,
              position,
              yAnchor: 0.1, //마커 위치 조정
            });

            overlay.setMap(map);

            markers.current.push(marker);
            markers.current.push(overlay);
          });
        },
        { bounds }
      );
    },
    [map, handlePlaceClick]
  );

  useEffect(() => {
    if (keyword) {
      searchPlaces(keyword);
    }
  }, [map, keyword]);

  const handleSearch = () => {
    setKeyword(inputValue.trim());
  };

  // ✅ 상세 정보창 외부 클릭 시 닫기
  const handleOutsideClick = useCallback(
    (event: MouseEvent) => {
      if (
        selectedPlace &&
        detailRef.current &&
        !detailRef.current.contains(event.target as Node)
      ) {
        setSelectedPlace(null);
      }
    },
    [selectedPlace]
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [handleOutsideClick]);

  return (
    <div className="relative flex h-[76vh] dark:text-gray-600">
      {/* 지도 */}
      <div ref={mapRef} className="flex-1 bg-gray-200 relative" />

      {/* 검색창 */}
      <SearchForm
        inputValue={inputValue}
        setInputValue={setInputValue}
        handleSearch={handleSearch}
        className="absolute z-10 top-5 left-[50%] translate-x-[-50%] md:left-50 md:my-2.5 md:transform-none"
        inputClassName="mx-2 w-48"
      />

      {/* 상세정보창 */}
      {selectedPlace && !isSidebarOpen && (
        <div ref={detailRef} className={detailInfoCss}>
          <button
            onClick={() => setSelectedPlace(null)}
            className="absolute top-2 right-2 text-lg sm:text-xl font-bold"
          >
            <IoCloseSharp />
          </button>
          <h2 className="text-sm sm:text-md mb-2 font-semibold">상세 정보</h2>
          <p className="font-bold sm:font-extrabold text-base sm:text-lg text-green-600 truncate">
            {selectedPlace.place_name}
          </p>
          <p className="text-sm truncate">
            {selectedPlace.road_address_name || selectedPlace.address_name}
          </p>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">
            {selectedPlace.phone || "전화번호 없음"}
          </p>
          <ul className="mt-2 flex gap-x-2 text-lg sm:text-xl">
            {jusoClip(selectedPlace).map(({ icon, text, msg }, i) => (
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
      )}

      {/* 검색 결과 리스트 */}
      {keyword.length !== 0 && (
        <div className="hidden md:flex md:w-72 p-4 bg-gray-100 border-l border-gray-300 flex-col">
          <ul className="space-y-4 overflow-y-auto h-[90%)] pr-2 ">
            {places.map((place) => (
              <li
                key={place.id}
                className="bg-white rounded-lg border border-gray-300 cursor-pointer hover:bg-gray-50"
              >
                <button
                  className="flex flex-col items-center w-full p-3 gap-y-1"
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
      )}

      {/* 모바일용 슬라이딩 패널 */}
      {places.length !== 0 && (
        <MobilePlaceList
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          places={places}
          handlePlaceClick={handlePlaceClick}
        />
      )}
    </div>
  );
};

export default MapPage;

const jusoClip = (selectedPlace: PlaceProps) => [
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
];
