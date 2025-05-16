"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import SearchForm from "@/components/map/SearchForm";
import MobilePlaceList from "@/components/map/MobilePlaceList";
import PlaceDetail from "@/components/map/PlaceDetail";
import PlaceList from "@/components/map/PlaceList";
import KeywordButtons from "@/components/map/KeywordButtons";
import { useAlertModal } from "@/components/AlertStore";

const MapPage = () => {
  const [map, setMap] = useState<any>(null); // 카카오 지도 객체 상태
  const [places, setPlaces] = useState<PlaceProps[]>([]); // 검색된 장소 목록 상태
  const [selectedPlace, setSelectedPlace] = useState<PlaceProps | null>(null); // 선택된 장소 상태
  const [keyword, setKeyword] = useState(""); // 검색 키워드 상태
  const [inputValue, setInputValue] = useState(""); // 입력창의 현재 값 상태
  const [isPlaceListOpen, setIsPlaceListOpen] = useState(true); // 검색 리스트 열고 닫기 상태
  const [isMobileListOpen, setIsMobileListOpen] = useState(false); // 모바일 리스트 열림 상태

  const mapRef = useRef<HTMLDivElement>(null); // 지도 렌더링 DOM 참조
  const detailRef = useRef<HTMLDivElement>(null); // 상세 정보창 DOM 참조
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map()); // 키워드 버튼 참조 (Map)

  //! TypeScript가 kakao 마커 객체가 어떤 구조인지 몰라서, 원래는 정확한 타입을 지정하는게 좋으나 복잡하기 때문에 임시로 any타입을 씀
  const markersRef = useRef<any[]>([]); // 현재 지도에 그려진 마커 및 오버레이 배열
  const markerObjectsRef = useRef<Map<string, any>>(new Map()); // 마커 객체 관리용 Map (place.id를 key로 하는 마커만 저장)
  const selectedMarkerRef = useRef<any>(null); // 현재 선택된 마커 (크기 커진 마커)

  const { openAlert } = useAlertModal(); // 알림 모달 훅

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
        window.kakao.maps.load(initMap); // 스크립트 로드 완료 시 지도 초기화
      };
      document.body.appendChild(script);
    };

    if (typeof window !== "undefined") {
      if (window.kakao?.maps) {
        window.kakao.maps.load(initMap);
      } else {
        loadKakaoMapScript();
      }
    }
  }, []);

  //! 마커 클릭 시 상세보기 열기 및 지도 이동
  const handlePlaceClick = useCallback(
    (place: PlaceProps, showDetail = true) => {
      if (!map) return;
      const maps = window.kakao.maps;

      // 기본 및 선택된 마커 이미지
      const defaultMarkerImage = new maps.MarkerImage(
        "https://t1.daumcdn.net/localimg/localimages/07/2018/pc/img/marker_spot.png", //이미지는 바꿀수 있음
        new maps.Size(25, 35),
        { offset: new maps.Point(12, 35) }
      );

      const largeMarkerImage = new maps.MarkerImage(
        "/image/pointMarker.png", // 강조용 이미지(커스텀 가능)
        new maps.Size(45, 60),
        { offset: new maps.Point(20, 55) }
      );

      // 이전 선택된 마커 이미지 복원
      if (selectedMarkerRef.current) {
        selectedMarkerRef.current.setImage(defaultMarkerImage);
      }

      // 클릭한 마커 찾기
      const clickedMarker = markerObjectsRef.current.get(place.id);
      if (clickedMarker) {
        clickedMarker.setImage(largeMarkerImage);
        selectedMarkerRef.current = clickedMarker;
      }

      // 지도 부드럽게 이동
      map.panTo(new maps.LatLng(Number(place.y), Number(place.x)));

      // 상세보기 열기
      if (showDetail) setSelectedPlace(place);
    },
    [map]
  );

  //! 키워드 검색 실행
  const searchPlaces = useCallback(
    (keyword: string) => {
      if (!map || !window.kakao) return;
      const maps = window.kakao.maps;
      const ps = new maps.services.Places();

      // 기본 마커 이미지
      const defaultMarkerImage = new maps.MarkerImage(
        "https://t1.daumcdn.net/localimg/localimages/07/2018/pc/img/marker_spot.png",
        new maps.Size(24, 35),
        { offset: new maps.Point(12, 35) }
      );

      // 대전 지역 근처 검색 범위
      const bounds = new maps.LatLngBounds(
        new maps.LatLng(36.175, 127.29),
        new maps.LatLng(36.48, 127.58)
      );

      ps.keywordSearch(
        keyword,
        (data: PlaceProps[], status: string) => {
          if (status === maps.services.Status.OK) {
            // 대전 지역 필터링
            const filteredData = data.filter((place) =>
              place.address_name?.includes("대전")
            );

            // "백화점" 키워드일 때 결과 5개 제한
            const limitedData =
              keyword === "백화점" ? filteredData.slice(0, 5) : filteredData;

            setSelectedPlace(null);
            setPlaces(limitedData);
            setIsPlaceListOpen(true);

            // 기존 마커 및 오버레이 제거
            markersRef.current.forEach((m) => m.setMap(null));
            markersRef.current = [];
            markerObjectsRef.current.clear();
            selectedMarkerRef.current = null;

            // 마커 및 오버레이 새로 생성
            limitedData.forEach((place) => {
              const position = new maps.LatLng(
                Number(place.y),
                Number(place.x)
              );
              const marker = new maps.Marker({
                position,
                map,
                image: defaultMarkerImage,
              });

              // place.id 저장 (추후 찾기 용이)
              marker.placeId = place.id;

              // 마커 클릭 이벤트 등록
              maps.event.addListener(marker, "click", () => {
                handlePlaceClick(place, true);
              });

              // 라벨 오버레이 생성
              const label = document.createElement("div");
              label.className =
                "bg-white border border-gray-300 px-2 p-0.5 text-sm rounded shadow font-normal text-gray-800 truncate w-22 text-center cursor-pointer dark:bg-[#555555] dark:text-white";
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

              markersRef.current.push(marker, overlay);
              markerObjectsRef.current.set(place.id, marker);
            });
          } else if (status === maps.services.Status.ZERO_RESULT) {
            // 검색 결과 없을 때 처리
            setSelectedPlace(null);
            setPlaces([]);
            markersRef.current.forEach((m) => m.setMap(null));
            markersRef.current = [];
            markerObjectsRef.current.clear();
            selectedMarkerRef.current = null;

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

  //! 키워드 버튼 클릭 시 검색 실행
  const handleKeywordClick = useCallback((keyword: string) => {
    setInputValue(keyword);
    setKeyword(keyword);
    setIsPlaceListOpen(true);
    setIsMobileListOpen(true);
  }, []);

  //! 키워드 변경 시 자동 검색 실행
  useEffect(() => {
    if (keyword && map) {
      searchPlaces(keyword);
    }
  }, [map, keyword, searchPlaces]);

  //! 검색 버튼 클릭 처리
  const handleSearch = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      setSelectedPlace(null);
      setInputValue("");
      openAlert("검색어를 입력해주세요.", [{ text: "확인", isGreen: true }]);
      return;
    }

    setKeyword(trimmed);
    setIsPlaceListOpen(true);
    setIsMobileListOpen(true);
  }, [inputValue, openAlert]);

  //! 상세 정보 닫기
  const handleCloseDetail = useCallback(() => {
    if (!map) {
      setSelectedPlace(null);
      return;
    }

    const maps = (window as any).kakao.maps;

    // 기본 마커 이미지
    const defaultMarkerImage = new maps.MarkerImage(
      "https://t1.daumcdn.net/localimg/localimages/07/2018/pc/img/marker_spot.png",
      new maps.Size(24, 35),
      { offset: new maps.Point(12, 35) }
    );

    // 선택된 마커가 있으면 크기 원래대로 복원
    if (selectedMarkerRef.current) {
      selectedMarkerRef.current.setImage(defaultMarkerImage);
      selectedMarkerRef.current = null; // 선택된 마커 초기화
    }

    setSelectedPlace(null);
  }, [map]);

  return (
    <div className="relative flex h-[75vh] px-4 mt-[2vh]">
      {/* 지도 렌더링 영역 */}
      <div
        className="flex-1 bg-gray-200 relative rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-[#444444] overflow-hidden min-h-100"
        ref={mapRef}
      />

      {/* 검색창 + 키워드 버튼 */}
      <div className="absolute w-full z-10 flex flex-col items-center gap-4 top-5 left-[50%] translate-x-[-50%] md:translate-x-[-45%] md:top-10 md:items-start">
        <SearchForm
          inputValue={inputValue}
          setInputValue={setInputValue}
          handleSearch={handleSearch}
        />
        <div className="flex flex-wrap justify-center md:justify-start">
          <KeywordButtons onKeywordClick={handleKeywordClick} />
        </div>
      </div>

      {/* 검색 장소 리스트 (PC) */}
      {isPlaceListOpen && keyword.length > 0 && places.length > 0 && (
        <PlaceList
          places={places}
          handlePlaceClick={handlePlaceClick}
          buttonRefs={buttonRefs}
          onClose={() => setIsPlaceListOpen(false)}
        />
      )}

      {/* 리스트 닫혔을 때 다시 열기 버튼 */}
      {!isPlaceListOpen && places.length > 0 && (
        <button
          onClick={() => setIsPlaceListOpen(true)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 py-1 rounded z-10 transition md:block hidden"
          aria-label="검색 결과 리스트 열기"
        >
          <div className="w-3 h-[40vh] rounded-bl-xl rounded-tl-xl dark:bg-zinc-500 bg-gray-300 hover:animate-pulse">
            <div className="w-1 h-[10vh] bg-gray-700 absolute right-1 top-1/2 -translate-y-1/2 dark:bg-white" />
          </div>
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
