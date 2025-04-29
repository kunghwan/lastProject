"use client";

import SearchForm from "@/components/map/SearchForm";
import { useCallback, useEffect, useRef, useState } from "react";
import { IoCloseSharp, IoPhonePortraitSharp } from "react-icons/io5";
import { TbMapPinDown } from "react-icons/tb";

declare global {
  interface Window {
    kakao: any;
  }
}

type PlaceProps = {
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
  const [places, setPlaces] = useState<PlaceProps[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlaceProps | null>(null);
  const [keyword, setKeyword] = useState("맛집");
  const [inputValue, setInputValue] = useState("맛집");

  const markers = useRef<any[]>([]);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current) return;

      const center = new window.kakao.maps.LatLng(36.3324, 127.4345); // 처음 지도에 나타날 좌표
      const mapInstance = new window.kakao.maps.Map(mapRef.current, {
        center,
        level: 6, // 확대 축소 범위 레벨
      });

      setMap(mapInstance);
    };

    // 카카오 맵 여는 스크립트
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
      const projection = map.getProjection();
      const point = projection.pointFromCoords(latlng);
      const adjustedPoint = new window.kakao.maps.Point(point.x + 150, point.y);
      const newCenter = projection.coordsFromPoint(adjustedPoint);

      map.panTo(newCenter);
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
              handlePlaceClick(place);
            });

            markers.current.push(marker);
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

  return (
    <div className="relative flex h-[78vh] dark:text-gray-600">
      {/* 지도 */}
      <div ref={mapRef} className="flex-1 bg-gray-200 relative" />

      {/* <div className="absolute top-20 left-4 z-50 flex gap-2 bg-white p-2 rounded-lg shadow-md border border-gray-300">
        {["카페", "지하철", "공원", "백화점", "맛집"].map((item) => (
          <button
            key={item}
            onClick={() => {
              setInputValue(item);
              setKeyword(item); // 바로 검색되게
            }}
            className="px-3 py-1 bg-green-500 text-white rounded-full text-sm hover:bg-green-600"
          >
            {item}
          </button>
        ))}
      </div> */}

      {/* 지도 위에 검색창  */}
      <SearchForm
        inputValue={inputValue}
        setInputValue={setInputValue}
        handleSearch={handleSearch}
        className="absolute top-5 left-4 z-50"
        inputClassName="mx-2 w-48"
      />

      {/* 상세정보 */}
      {selectedPlace && (
        <div className="absolute top-10 right-75 z-50 shadow-md ">
          <div className="w-60 p-4 bg-white border border-gray-300 relative h-50 rounded-2xl">
            <button
              onClick={() => setSelectedPlace(null)}
              className="absolute top-2 right-2 bg-transparent text-xl font-bold"
            >
              <IoCloseSharp />
            </button>
            <h2 className="text-md font-base mb-2">상세 정보</h2>
            <p className="font-extrabold text-lg text-green-600">
              {selectedPlace.place_name}
            </p>
            <p>
              {selectedPlace.road_address_name || selectedPlace.address_name}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {selectedPlace.phone || "전화번호 없음"}
            </p>
            <ul className="mt-2.5 flex gap-x-2.5 text-xl">
              <button
                onClick={() => {
                  const address =
                    selectedPlace.road_address_name ||
                    selectedPlace.address_name;
                  navigator.clipboard.writeText(address);
                  alert("주소가 복사되었습니다!");
                }}
              >
                <TbMapPinDown />
              </button>
              <button
                onClick={() => {
                  const phone = selectedPlace.phone || "전화번호 없음";
                  navigator.clipboard.writeText(phone);
                  alert("전화번호가 복사되었습니다!");
                }}
              >
                <IoPhonePortraitSharp />
              </button>
            </ul>
          </div>
        </div>
      )}

      {/* 검색 리스트 */}
      <div className="md:w-72 w-full h-[78vh] p-4 bg-gray-100 border-l border-gray-300 flex flex-col  ">
        <SearchForm
          inputValue={inputValue}
          setInputValue={setInputValue}
          handleSearch={handleSearch}
          className="w-full max-w-full my-2.5 overflow-hidden"
          inputClassName="flex-grow min-w-0"
          buttonClassName="flex-shrink-0"
        />

        <ul className="space-y-4 overflow-y-auto h-[calc(100%-2rem)] pr-2">
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
    </div>
  );
};

export default MapPage;
