"use client";

import SearchForm from "@/components/map/SearchForm";
import MobilePlaceList from "@/components/map/MobilePlaceList";
import PlaceDetail from "@/components/map/PlaceDetail";
import { useCallback, useEffect, useRef, useState } from "react";
import { IoRestaurantOutline, IoSubway } from "react-icons/io5";
import { FaLandmark, FaRegBuilding } from "react-icons/fa6";

const MapPage = () => {
  const [map, setMap] = useState<any>(null); // 카카오 지도 객체
  const [places, setPlaces] = useState<PlaceProps[]>([]); // 검색된 장소 목록
  const [selectedPlace, setSelectedPlace] = useState<PlaceProps | null>(null); // 선택된 장소
  const [keyword, setKeyword] = useState(""); // 검색 키워드
  const [inputValue, setInputValue] = useState(""); // 입력창의 현재 값
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // 모바일 사이드바 열림 상태

  const markers = useRef<any[]>([]); // 현재 지도에 그려진 마커 및 오버레이 배열
  const mapRef = useRef<HTMLDivElement>(null); // 지도 렌더링 DOM 참조
  const detailRef = useRef<HTMLDivElement>(null); // 상세 정보창 DOM 참조
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map()); //버튼 참조

  // 지도 초기화 및 kakao map API 로드
  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current) return;

      // 지도 초기 중심 좌표 설정
      const center = new window.kakao.maps.LatLng(36.3286, 127.4229);
      const mapInstance = new window.kakao.maps.Map(mapRef.current, {
        center,
        level: 5, // 확대 레벨 설정
      });

      setMap(mapInstance); // 지도 객체 저장
    };

    // Kakao Maps API 스크립트 동적 삽입
    const loadKakaoMapScript = () => {
      const script = document.createElement("script");
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_API_KEY}&autoload=false&libraries=services`;
      script.async = true;
      script.onload = () => {
        window.kakao.maps.load(() => {
          initMap(); // 스크립트 로드 완료 시 지도 초기화
        });
      };
      document.body.appendChild(script);
    };

    // 브라우저 환경에서만 실행
    if (typeof window !== "undefined") {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          initMap(); // 이미 로드된 경우 바로 초기화
        });
      } else {
        loadKakaoMapScript(); // 그렇지 않으면 스크립트 삽입
      }
    }
  }, []);

  //! 마커 클릭 시 상세보기 열기 및 지도 이동
  const handlePlaceClick = useCallback(
    (place: PlaceProps, showDetail: boolean = true) => {
      if (!map) return;

      const latlng = new window.kakao.maps.LatLng(
        Number(place.y),
        Number(place.x)
      );

      map.panTo(latlng); //! 해당 위치로 지도 이동 애니메이션(부드럽게)

      if (showDetail) setSelectedPlace(place); //! 상세 정보창 열기

      //해당 리스트 버튼에 focus
      const button = buttonRefs.current.get(place.id);
      button?.focus();
    },
    [map]
  );

  //! 장소 검색 함수
  const searchPlaces = useCallback(
    (keyword: string) => {
      if (!map || !window.kakao) return;

      const { maps } = window.kakao;
      const ps = new maps.services.Places();

      const bounds = new maps.LatLngBounds(
        new maps.LatLng(36.175, 127.29),
        new maps.LatLng(36.48, 127.58)
      );

      ps.keywordSearch(
        keyword,
        (data: PlaceProps[], status: string) => {
          if (status === maps.services.Status.OK) {
            const DJData = data.filter((place) =>
              place.address_name?.includes("대전")
            );

            const limitedData =
              keyword === "백화점" ? DJData.slice(0, 5) : DJData;
            setPlaces(limitedData);

            // 기존 마커 제거
            markers.current.forEach((m) => m.setMap(null));
            markers.current = [];

            // 새 마커 및 커스텀 오버레이 추가
            limitedData.forEach((place) => {
              const position = new maps.LatLng(
                Number(place.y),
                Number(place.x)
              );
              const marker = new maps.Marker({ position, map });

              maps.event.addListener(marker, "click", () => {
                handlePlaceClick(place, true);
              });

              // 마커 아래 라벨
              const label = document.createElement("div");
              label.className =
                "bg-white border border-gray-300 px-2 p-0.5 text-sm rounded shadow font-normal text-gray-800 truncate w-22 text-center cursor-pointer";
              label.innerText = place.place_name;

              label.onclick = () => {
                handlePlaceClick(place, true);
              };

              const overlay = new maps.CustomOverlay({
                content: label,
                position,
                yAnchor: 0.1,
              });
              overlay.setMap(map);

              markers.current.push(marker);
              markers.current.push(overlay);
            });
            // 검색 결과 없을 경우
          } else if (status === maps.services.Status.ZERO_RESULT) {
            alert("검색 결과가 없습니다.");
            setPlaces([]);
            markers.current.forEach((m) => m.setMap(null));
            markers.current = [];
          }
        },
        { bounds }
      );
    },
    [map, handlePlaceClick]
  );

  // 키워드 변경 시 장소 검색 실행
  useEffect(() => {
    if (keyword && map) {
      searchPlaces(keyword);
    }
  }, [map, keyword, searchPlaces]);

  // 검색 버튼 클릭 시 키워드 설정
  const handleSearch = useCallback(() => {
    setKeyword(inputValue.trim());
  }, [inputValue, setKeyword]);

  // 상세 정보창 외부 클릭 시 닫기 처리
  const handleOutsideClick = useCallback(
    (event: MouseEvent) => {
      if (
        selectedPlace &&
        detailRef.current &&
        !detailRef.current.contains(event.target as Node)
      ) {
        setSelectedPlace(null); // 외부 클릭 시 선택 해제
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

  // 상세 정보 수동 닫기
  const handleCloseDetail = useCallback(() => {
    setSelectedPlace(null);
  }, []);

  return (
    <div className="relative flex h-[76vh] dark:text-gray-600">
      <div ref={mapRef} className="flex-1 bg-gray-200 relative " />

      <SearchForm
        inputValue={inputValue}
        setInputValue={setInputValue}
        handleSearch={handleSearch}
        className="absolute z-10 top-5 left-[50%] translate-x-[-50%] md:left-50 md:my-2.5 md:transform-none"
        inputClassName="mx-2 w-48"
      />

      {!selectedPlace && (
        <div className="absolute z-10 top-20 sm:top-25 left-[50%] translate-x-[-50%] flex gap-2 md:left-50 md:transform-none ">
          {keywordBtn.map((word) => (
            <button
              key={word.name}
              className="bg-white border border-gray-300 px-0 py-2 rounded-full shadow-sm hover:bg-gray-100 text-sm w-20 gap-x-1 flex items-center justify-center font-semibold"
              onClick={() => {
                setInputValue(word.name);
                setKeyword(word.name);
              }}
            >
              <p className="text-green-500 text-lg">{word.icon}</p>
              {word.name}
            </button>
          ))}
        </div>
      )}

      {selectedPlace && !isSidebarOpen && (
        <PlaceDetail
          place={selectedPlace}
          onClose={handleCloseDetail}
          detailRef={detailRef}
        />
      )}

      {keyword.length > 0 && (
        <div className="hidden md:flex md:w-72 p-4 bg-gray-100 border-l border-gray-300 flex-col">
          <ul className="space-y-4 overflow-y-auto h-[90%)] pr-2 ">
            {places.map((place) => (
              <li
                key={place.id}
                className="bg-white rounded-lg border border-gray-300 cursor-pointer hover:bg-gray-50"
              >
                <button
                  ref={(clickFocus) => {
                    if (clickFocus)
                      buttonRefs.current.set(place.id, clickFocus);
                  }}
                  className="flex flex-col items-center w-full p-3 gap-y-1 focus:border focus:rounded-lg focus:bg-gray-50"
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

      {keyword.length > 0 && (
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

const keywordBtn = [
  { name: "맛집", icon: <IoRestaurantOutline /> },
  { name: "명소", icon: <FaLandmark /> },
  { name: "백화점", icon: <FaRegBuilding /> },
  { name: "지하철", icon: <IoSubway /> },
];
