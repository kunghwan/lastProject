"use client";

import SearchForm from "@/components/map/SearchForm";
import MobilePlaceList from "@/components/map/MobilePlaceList";
import { useCallback, useEffect, useRef, useState } from "react";
import PlaceDetail from "@/components/map/PlaceDetail";

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

  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current) return;

      const center = new window.kakao.maps.LatLng(36.3286, 127.4229);
      const mapInstance = new window.kakao.maps.Map(mapRef.current, {
        center, // 처음 시작할때 지도 나오는 위치
        level: 5, // 지도 확대 범위 레벨
      });

      setMap(mapInstance);
    };

    // 카카오맵 api 불러오기
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

          markers.current.forEach((m) => m.setMap(null));
          markers.current = [];

          data.forEach((place) => {
            const position = new maps.LatLng(Number(place.y), Number(place.x));
            const marker = new maps.Marker({ position, map });

            maps.event.addListener(marker, "click", () => {
              handlePlaceClick(place, true);
            });

            const label = document.createElement("div");
            label.className =
              "bg-white border border-gray-300 px-2 p-0.5 text-sm rounded shadow font-normal text-gray-800 truncate w-20 ";
            label.innerText = place.place_name;

            const overlay = new maps.CustomOverlay({
              content: label,
              position,
              yAnchor: 0.1,
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

  const handleCloseDetail = useCallback(() => {
    setSelectedPlace(null);
  }, []);

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

      {/* {!selectedPlace && (
        <div className="absolute z-10 top-[14%] left-[50%] translate-x-[-50%] flex gap-2 md:left-50 md:transform-none">
          {["지하철", "공원", "맛집", "백화점"].map((word) => (
            <button
              key={word}
              className="bg-white border border-gray-300 px-0 py-2 rounded-full shadow-sm hover:bg-gray-100 text-sm w-17"
              onClick={() => {
                setInputValue(word);
                setKeyword(word);
              }}
            >
              {word}
            </button>
          ))}
        </div>
      )} */}

      {/* 상세정보창 */}
      {selectedPlace && !isSidebarOpen && (
        <PlaceDetail
          place={selectedPlace}
          onClose={handleCloseDetail}
          detailRef={detailRef}
        />
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
      {keyword.length !== 0 && (
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
