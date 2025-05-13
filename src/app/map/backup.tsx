// "use client";

// import { useState, useRef, useCallback, useEffect } from "react";
// import SearchForm from "@/components/map/SearchForm";
// import MobilePlaceList from "@/components/map/MobilePlaceList";
// import PlaceDetail from "@/components/map/PlaceDetail";
// import PlaceList from "@/components/map/PlaceList";
// import KeywordButtons from "@/components/map/KeywordButtons";
// import AlertModal from "@/components/AlertModal";

// const MapPage = () => {
//   const [map, setMap] = useState<any>(null); // 카카오 지도 객체
//   const [places, setPlaces] = useState<PlaceProps[]>([]); // 검색된 장소 목록
//   const [selectedPlace, setSelectedPlace] = useState<PlaceProps | null>(null); // 선택된 장소
//   const [keyword, setKeyword] = useState(""); // 검색 키워드
//   const [inputValue, setInputValue] = useState(""); // 입력창의 현재 값
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false); // 모바일 사이드바 열림 상태
//   const [alertMessage, setAlertMessage] = useState(""); // 알림 메시지
//   const [isShhowingAlert, setIsShhowingAlert] = useState(false); // 알림 모달 상태

//   const markers = useRef<any[]>([]); // 현재 지도에 그려진 마커 및 오버레이 배열
//   const mapRef = useRef<HTMLDivElement>(null); // 지도 렌더링 DOM 참조
//   const detailRef = useRef<HTMLDivElement>(null); // 상세 정보창 DOM 참조
//   const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map()); //버튼 참조

//   //! 지도 초기화 및 kakao map API 로드
//   useEffect(() => {
//     const initMap = () => {
//       if (!mapRef.current) return;

//       //! 지도 초기 중심 좌표 설정 (대전)
//       const center = new window.kakao.maps.LatLng(36.3286, 127.4229);
//       const mapInstance = new window.kakao.maps.Map(mapRef.current, {
//         center,
//         level: 5, // 확대 레벨 설정
//       });

//       setMap(mapInstance); // 지도 객체 저장
//     };

//     //! 카카오 맵 스크립트 불러오기
//     const loadKakaoMapScript = () => {
//       const script = document.createElement("script");
//       script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_API_KEY}&autoload=false&libraries=services`;
//       script.async = true;
//       script.onload = () => {
//         window.kakao.maps.load(() => {
//           initMap(); // 스크립트 로드 완료 시 지도 초기화
//         });
//       };
//       document.body.appendChild(script);
//     };

//     //! 브라우저 환경에서만 실행
//     if (typeof window !== "undefined") {
//       if (window.kakao && window.kakao.maps) {
//         window.kakao.maps.load(() => {
//           initMap();
//         });
//       } else {
//         loadKakaoMapScript();
//       }
//     }
//   }, []);

//   //! 마커 클릭 시 상세보기 열기 및 지도 이동
//   const handlePlaceClick = useCallback(
//     (place: PlaceProps, showDetail: boolean = true) => {
//       if (!map) return;

//       const latlng = new window.kakao.maps.LatLng(
//         Number(place.y),
//         Number(place.x)
//       );
//       map.panTo(latlng); //! 해당 위치로 지도 이동 애니메이션(부드럽게)

//       if (showDetail) setSelectedPlace(place); //! 상세 정보창 열기
//     },
//     [map]
//   );

//   //! 키워드 검색 실행
//   const searchPlaces = useCallback(
//     (keyword: string) => {
//       if (!map || !window.kakao) return;

//       const { maps } = window.kakao;
//       const ps = new maps.services.Places();

//       // 검색 범위 설정 (대전 지역 근처)
//       const bounds = new maps.LatLngBounds(
//         new maps.LatLng(36.175, 127.29),
//         new maps.LatLng(36.48, 127.58)
//       );

//       ps.keywordSearch(
//         keyword,
//         (data: PlaceProps[], status: string) => {
//           if (status === maps.services.Status.OK) {
//             // 대전 지역 결과만 필터링
//             const DJData = data.filter((place) =>
//               place.address_name?.includes("대전")
//             );
//             // 백화점 검색 결과는 최대 5개로 제한(검색결과 상위 5개만 백화점이고 나머지는 이름에 백화점이 붙은 일반 가게들)
//             const limitedData =
//               keyword === "백화점" ? DJData.slice(0, 5) : DJData;

//             setPlaces(limitedData);

//             // 기존 마커 제거
//             markers.current.forEach((m) => m.setMap(null));
//             markers.current = [];

//             limitedData.forEach((place) => {
//               const position = new maps.LatLng(
//                 Number(place.y),
//                 Number(place.x)
//               );
//               const marker = new maps.Marker({ position, map });

//               // 마커 클릭 시 해당 장소 상세 정보 표시
//               maps.event.addListener(marker, "click", () => {
//                 handlePlaceClick(place, true);
//               });

//               // 사용자 정의 마커(label)
//               const label = document.createElement("div");
//               label.className =
//                 "bg-white border border-gray-300 px-2 p-0.5 text-sm rounded shadow font-normal text-gray-800 truncate w-22 text-center cursor-pointer";
//               label.innerText = place.place_name;

//               // 라벨 클릭 시 상세 보기
//               label.onclick = () => {
//                 handlePlaceClick(place, true);
//               };

//               const overlay = new maps.CustomOverlay({
//                 content: label,
//                 position,
//                 yAnchor: 0.1,
//               });

//               overlay.setMap(map);

//               markers.current.push(marker);
//               markers.current.push(overlay);
//             });
//             //! 검색 결과 없을 경우
//           } else if (status === maps.services.Status.ZERO_RESULT) {
//             setPlaces([]);
//             markers.current.forEach((m) => m.setMap(null));
//             markers.current = [];
//             setAlertMessage("검색 결과가 없습니다.");
//             setIsShhowingAlert(true); // 알림 모달 표시
//             setInputValue(""); // 검색 결과 없으면 검색창 비움
//           }
//         },
//         { bounds }
//       );
//     },
//     [map, handlePlaceClick]
//   );

//   //! 키워드 버튼 클릭 핸들러
//   const handleKeywordClick = useCallback((keyword: string) => {
//     setInputValue(keyword);
//     setKeyword(keyword);
//     setIsSidebarOpen(true);
//   }, []);

//   //! 키워드 변경 시 검색
//   useEffect(() => {
//     if (keyword && map) {
//       searchPlaces(keyword);
//     }
//   }, [map, keyword, searchPlaces]);

//   //! 검색 버튼 클릭 시 실행
//   const handleSearch = useCallback(() => {
//     setKeyword(inputValue.trim());
//   }, [inputValue]);

//   //! 상세 정보 외 클릭 시 닫기
//   const handleOutsideClick = useCallback(
//     (event: MouseEvent) => {
//       if (
//         selectedPlace &&
//         detailRef.current &&
//         !detailRef.current.contains(event.target as Node)
//       ) {
//         setSelectedPlace(null);
//       }
//     },
//     [selectedPlace]
//   );

//   useEffect(() => {
//     document.addEventListener("mousedown", handleOutsideClick);
//     return () => {
//       document.removeEventListener("mousedown", handleOutsideClick);
//     };
//   }, [handleOutsideClick]);

//   //! 상세 정보 수동 닫기
//   const handleCloseDetail = useCallback(() => {
//     setSelectedPlace(null);
//   }, []);

//   return (
//     <div className="relative flex h-[76vh] dark:text-gray-600">
//       <div
//         ref={mapRef}
//         className="flex-1 bg-gray-200 relative rounded-t-3xl sm:rounded-3xl  border border-gray-300 overflow-hidden min-h-100"
//       />

//       {/* 검색창 */}
//       <SearchForm
//         inputValue={inputValue}
//         setInputValue={setInputValue}
//         handleSearch={handleSearch}
//         className="absolute z-10 top-5 left-[50%] translate-x-[-50%] md:left-40 md:my-2.5 md:transform-none"
//         inputClassName="mx-2 w-48"
//       />

//       {/* 키워드 버튼 */}
//       {!selectedPlace && (
//         <div className="absolute z-10 top-20 sm:top-25 left-[50%] translate-x-[-50%] flex gap-2 md:left-50 md:transform-none">
//           <KeywordButtons onKeywordClick={handleKeywordClick} />
//         </div>
//       )}

//       {/* 검색 장소 리스트 */}
//       {keyword.length > 0 && places.length > 0 && (
//         <PlaceList
//           places={places}
//           handlePlaceClick={handlePlaceClick}
//           buttonRefs={buttonRefs}
//         />
//       )}

//       {/* 상세 정보창 */}
//       {selectedPlace && (
//         <PlaceDetail
//           place={selectedPlace}
//           onClose={handleCloseDetail}
//           detailRef={detailRef}
//         />
//       )}

//       {/* 모바일 장소 리스트 */}
//       {keyword.length > 0 && places.length > 0 && (
//         <MobilePlaceList
//           isOpen={isSidebarOpen}
//           setIsOpen={setIsSidebarOpen}
//           places={places}
//           handlePlaceClick={handlePlaceClick}
//         />
//       )}

//       {/* 알림 모달 */}
//       {isShhowingAlert && (
//         <AlertModal
//           message={alertMessage}
//           onClose={() => setIsShhowingAlert(false)}
//         />
//       )}
//     </div>
//   );
// };

// export default MapPage;
