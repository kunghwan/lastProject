"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import SearchForm from "@/components/map/SearchForm";
import MobilePlaceList from "@/components/map/MobilePlaceList";
import PlaceDetail from "@/components/map/PlaceDetail";
import PlaceList from "@/components/map/PlaceList";
import KeywordButtons from "@/components/map/KeywordButtons";
import { useAlertModal } from "@/components/AlertStore";

const MapPage = () => {
  const [map, setMap] = useState<any>(null); // 카카오 지도 객체
  const [places, setPlaces] = useState<PlaceProps[]>([]); // 검색된 장소 목록
  const [selectedPlace, setSelectedPlace] = useState<PlaceProps | null>(null); // 선택된 장소
  const [keyword, setKeyword] = useState(""); // 검색 키워드
  const [inputValue, setInputValue] = useState(""); // 입력창의 현재 값
  const [isPlaceListOpen, setIsPlaceListOpen] = useState(true); // 검색 리스트 열고닫기 상태
  const [isMobileListOpen, setIsMobileListOpen] = useState(false); // 모바일 리스트 열림 상태

  const markers = useRef<any[]>([]); // 현재 지도에 그려진 마커 및 오버레이 배열
  const mapRef = useRef<HTMLDivElement>(null); // 지도 렌더링 DOM 참조
  const detailRef = useRef<HTMLDivElement>(null); // 상세 정보창 DOM 참조
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map()); // 키워드 버튼 참조
  const { openAlert } = useAlertModal(); // useAlertModal 훅 사용

  //! 지도 초기화 및 kakao map API 로드
  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current) return;

      //! 지도 초기 중심 좌표 설정 (대전)
      const center = new window.kakao.maps.LatLng(36.3286, 127.4229);
      const mapInstance = new window.kakao.maps.Map(mapRef.current, {
        center,
        level: 7, // 확대 레벨 설정
      });

      setMap(mapInstance); // 지도 객체 저장
    };

    //! 카카오 맵 스크립트 불러오기
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

    //! 브라우저 환경에서만 실행
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
    },
    [map]
  );

  //! 키워드 검색 실행
  const searchPlaces = useCallback(
    (keyword: string) => {
      if (!map || !window.kakao) return;

      const { maps } = window.kakao;
      const ps = new maps.services.Places();

      // 검색 범위 설정 (대전 지역 근처)
      const bounds = new maps.LatLngBounds(
        new maps.LatLng(36.175, 127.29),
        new maps.LatLng(36.48, 127.58)
      );

      ps.keywordSearch(
        keyword,
        (data: PlaceProps[], status: string) => {
          if (status === maps.services.Status.OK) {
            // 대전 지역 결과만 필터링
            const DJData = data.filter((place) =>
              place.address_name?.includes("대전")
            );

            // 백화점 검색 결과는 최대 5개로 제한
            const limitedData =
              keyword === "백화점" ? DJData.slice(0, 5) : DJData;

            setSelectedPlace(null); // 새 검색 시 기존 상세 정보창 닫기
            setPlaces(limitedData);
            setIsPlaceListOpen(true); // 검색 결과 있을 때 리스트 열기

            // 기존 마커 제거
            markers.current.forEach((m) => m.setMap(null));
            markers.current = [];

            // 새 마커 및 커스텀 오버레이 생성
            limitedData.forEach((place) => {
              const position = new maps.LatLng(
                Number(place.y),
                Number(place.x)
              );
              const marker = new maps.Marker({ position, map });

              // 마커 클릭 시 상세 정보 표시
              maps.event.addListener(marker, "click", () => {
                handlePlaceClick(place, true);
              });

              // 사용자 정의 마커(label)
              const label = document.createElement("div");
              label.className =
                "bg-white border border-gray-300 px-2 p-0.5 text-sm rounded shadow font-normal text-gray-800 truncate w-22 text-center cursor-pointer dark:bg-[#6B6B6B] dark:text-white";
              label.innerText = place.place_name;

              // 라벨 클릭 시 상세 보기
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
          } else if (status === maps.services.Status.ZERO_RESULT) {
            // 검색 결과 없을 때도 상세 정보창 닫기
            setSelectedPlace(null);
            setPlaces([]);
            markers.current.forEach((m) => m.setMap(null));
            markers.current = [];

            // 알림 띄우기
            openAlert("검색 결과가 없습니다.", [
              { text: "확인", isGreen: true },
            ]);
          }
        },
        { bounds }
      );
    },
    [map, handlePlaceClick, openAlert]
  );

  //! 키워드 버튼 클릭 핸들러
  const handleKeywordClick = useCallback((keyword: string) => {
    setInputValue(keyword);
    setKeyword(keyword);
    setIsMobileListOpen(true);
    setIsPlaceListOpen(true);
  }, []);

  //! 키워드 변경 시 검색 실행
  useEffect(() => {
    if (keyword && map) {
      searchPlaces(keyword);
    }
  }, [map, keyword, searchPlaces]);

  //! 검색 버튼 클릭 시 실행
  const handleSearch = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      setSelectedPlace(null); // 입력값이 없을 때도 상세 정보창 닫기
      setInputValue(""); // 입력창 초기화
      openAlert("검색어를 입력해주세요.", [{ text: "확인", isGreen: true }]);

      return;
    }

    setKeyword(trimmed);
    setIsPlaceListOpen(true); // 검색 결과 리스트 열기
    setIsMobileListOpen(true); // 모바일 리스트 열기
  }, [inputValue, openAlert]);

  //! 상세 정보 닫기
  const handleCloseDetail = useCallback(() => {
    setSelectedPlace(null);
  }, []);

  return (
    <div className="relative flex h-[76vh] px-4 sm:p-0">
      <div
        ref={mapRef}
        className="flex-1 bg-gray-200 relative rounded-2xl sm:rounded-3xl  border border-gray-300 overflow-hidden min-h-100"
      />

      {/* 검색창 + 키워드 버튼 */}
      <div className="absolute w-full z-10 flex flex-col items-center gap-4 top-5 left-[50%] translate-x-[-50%] md:translate-x-[-45%] md:top-10 md:items-start ">
        <SearchForm
          inputValue={inputValue}
          setInputValue={setInputValue}
          handleSearch={handleSearch}
        />

        <div className="flex flex-wrap justify-center md:justify-start ">
          <KeywordButtons onKeywordClick={handleKeywordClick} />
        </div>
      </div>

      {/* 검색 장소 리스트 */}
      {isPlaceListOpen && keyword.length > 0 && places.length > 0 && (
        <PlaceList
          places={places}
          handlePlaceClick={handlePlaceClick}
          buttonRefs={buttonRefs}
          onClose={() => setIsPlaceListOpen(false)}
        />
      )}

      {/* 닫힌 상태에서 다시 열기 버튼 */}
      {!isPlaceListOpen && places.length > 0 && (
        <button
          onClick={() => setIsPlaceListOpen(true)}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 py-1 rounded z-10 transition md:block hidden"
        >
          <div className="w-3 h-[40ch] rounded-bl-xl rounded-tl-xl dark:bg-zinc-500 bg-gray-400 hover:animate-pulse" />
        </button>
      )}

      {/* 상세 정보창 */}
      {selectedPlace && (
        <PlaceDetail
          place={selectedPlace}
          onClose={handleCloseDetail}
          detailRef={detailRef}
        />
      )}

      {/* 모바일 장소 리스트 */}
      {keyword.length > 0 && places.length > 0 && (
        <MobilePlaceList
          isOpen={isMobileListOpen}
          setIsOpen={setIsMobileListOpen}
          places={places}
          handlePlaceClick={handlePlaceClick}
        />
      )}
    </div>
  );
};

export default MapPage;
