// "use client";

// import SearchForm from "@/components/map/SearchForm";
// import MobilePlaceList from "@/components/map/MobilePlaceList";
// import { useCallback, useEffect, useRef, useState } from "react";
// import PlaceDetail from "@/components/map/PlaceDetail";
// import { IoRestaurantOutline, IoSubway } from "react-icons/io5";
// import { PiBuildingBold, PiParkLight } from "react-icons/pi";

// const MapPage = () => {
//   // 상태 선언
//   const [map, setMap] = useState<any>(null); // 카카오 지도 객체
//   const [places, setPlaces] = useState<PlaceProps[]>([]); // 검색된 장소 목록
//   const [selectedPlace, setSelectedPlace] = useState<PlaceProps | null>(null); // 선택된 장소 상세 정보
//   const [keyword, setKeyword] = useState(""); // 검색 키워드
//   const [inputValue, setInputValue] = useState(""); // 입력창의 값
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false); // 사이드바 열림 상태

//   const markers = useRef<any[]>([]); // 현재 지도에 표시된 마커와 오버레이를 저장
//   const mapRef = useRef<HTMLDivElement>(null); // 지도를 렌더링할 div 참조
//   const detailRef = useRef<HTMLDivElement>(null); // 장소 상세 정보창 참조

//   // 지도 초기화 (처음 마운트될 때 실행)
//   useEffect(() => {
//     const initMap = () => {
//       if (!mapRef.current) return;

//       const center = new window.kakao.maps.LatLng(36.3286, 127.4229); // 초기 지도 중심 좌표
//       const mapInstance = new window.kakao.maps.Map(mapRef.current, {
//         center,
//         level: 5, // 확대 수준 (낮을수록 확대)
//       });

//       setMap(mapInstance); // 지도 객체 저장
//     };

//     // Kakao 지도 API 스크립트 로딩 함수
//     const loadKakaoMapScript = () => {
//       const script = document.createElement("script");
//       script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_API_KEY}&autoload=false&libraries=services`;
//       script.async = true;
//       script.onload = () => {
//         window.kakao.maps.load(() => {
//           initMap();
//         });
//       };
//       document.body.appendChild(script);
//     };

//     // 클라이언트 사이드에서만 실행
//     if (typeof window !== "undefined") {
//       if (window.kakao && window.kakao.maps) {
//         window.kakao.maps.load(() => {
//           initMap(); // 이미 kakao 객체가 로드된 경우
//         });
//       } else {
//         loadKakaoMapScript(); // 아직 로드되지 않은 경우 스크립트 삽입
//       }
//     }
//   }, []);

//   // 마커 클릭 시 지도 이동 및 상세 정보 표시
//   const handlePlaceClick = useCallback(
//     (place: PlaceProps, showDetail: boolean = true) => {
//       if (!map) return;

//       const latlng = new window.kakao.maps.LatLng(
//         Number(place.y),
//         Number(place.x)
//       );

//       map.panTo(latlng); // 클릭한 장소로 지도 이동(부드럽게)

//       if (showDetail) setSelectedPlace(place); // 상세 정보 표시
//     },
//     [map]
//   );

//   // 키워드 기반 장소 검색
//   const searchPlaces = useCallback(
//     (keyword: string) => {
//       if (!map) return;

//       const { maps } = window.kakao;
//       const ps = new maps.services.Places(); // 장소 검색 서비스 생성
//       const bounds = new maps.LatLngBounds(
//         new maps.LatLng(36.175, 127.29),
//         new maps.LatLng(36.48, 127.58)
//       ); // 검색 범위 지정 (대전 근처)

//       ps.keywordSearch(
//         keyword,
//         (data: PlaceProps[], status: string) => {
//           if (status !== maps.services.Status.OK) return;

//           setPlaces(data); // 검색 결과 저장

//           // 기존 마커 제거
//           markers.current.forEach((m) => m.setMap(null));
//           markers.current = [];

//           // 새로운 마커 및 오버레이 추가
//           data.forEach((place) => {
//             const position = new maps.LatLng(Number(place.y), Number(place.x));
//             const marker = new maps.Marker({ position, map });

//             // 마커 클릭 시 상세 보기
//             maps.event.addListener(marker, "click", () => {
//               handlePlaceClick(place, true);
//             });

//             // 사용자 정의 오버레이 생성
//             const label = document.createElement("div");
//             label.className =
//               "bg-white border border-gray-300 px-2 p-0.5 text-sm rounded shadow font-normal text-gray-800 truncate w-20 ";
//             label.innerText = place.place_name;

//             const overlay = new maps.CustomOverlay({
//               content: label,
//               position,
//               yAnchor: 0.1,
//             });

//             overlay.setMap(map);

//             markers.current.push(marker);
//             markers.current.push(overlay);
//           });
//         },
//         { bounds } // 검색 범위 옵션 전달
//       );
//     },
//     [map, handlePlaceClick]
//   );

//   // 키워드가 변경되면 장소 검색 수행
//   useEffect(() => {
//     if (keyword) {
//       searchPlaces(keyword);
//     }
//   }, [map, keyword]);

//   // 검색 버튼 클릭 시 실행
//   const handleSearch = () => {
//     setKeyword(inputValue.trim()); // 입력값을 키워드로 설정
//   };

//   // 상세 정보창 외부 클릭 시 닫기
//   const handleOutsideClick = useCallback(
//     (event: MouseEvent) => {
//       if (
//         selectedPlace &&
//         detailRef.current &&
//         !detailRef.current.contains(event.target as Node)
//       ) {
//         setSelectedPlace(null); // 외부 클릭 시 상세 정보 닫기
//       }
//     },
//     [selectedPlace]
//   );

//   // 마운트 시 외부 클릭 감지 리스너 등록
//   useEffect(() => {
//     document.addEventListener("mousedown", handleOutsideClick);
//     return () => {
//       document.removeEventListener("mousedown", handleOutsideClick);
//     };
//   }, [handleOutsideClick]);

//   // 상세 정보 닫기 버튼 핸들러
//   const handleCloseDetail = useCallback(() => {
//     setSelectedPlace(null);
//   }, []);

//   return (
//     <div className="relative flex h-[76vh] dark:text-gray-600">
//       {/* 지도 */}
//       <div ref={mapRef} className="flex-1 bg-gray-200 relative" />

//       {/* 검색창 */}
//       <SearchForm
//         inputValue={inputValue}
//         setInputValue={setInputValue}
//         handleSearch={handleSearch}
//         className="absolute z-10 top-5 left-[50%] translate-x-[-50%] md:left-50 md:my-2.5 md:transform-none"
//         inputClassName="mx-2 w-48"
//       />

//       {/* 빠른 검색 키워드 버튼 */}
//       {!selectedPlace && (
//         <div className="absolute z-10 top-20 sm:top-25 left-[50%] translate-x-[-50%] flex gap-2 md:left-50 md:transform-none">
//           {keywordBtn.map((word) => (
//             <button
//               key={word.name}
//               className="bg-white border border-gray-300 px-0 py-2 rounded-full shadow-sm hover:bg-gray-100 text-sm w-20 gap-x-1 flex items-center justify-center font-semibold"
//               onClick={() => {
//                 setInputValue(word.name);
//                 setKeyword(word.name);
//               }}
//             >
//               <p className="text-green-500">{word.icon}</p>
//               {word.name}
//             </button>
//           ))}
//         </div>
//       )}

//       {/* 상세정보창 */}
//       {selectedPlace && !isSidebarOpen && (
//         <PlaceDetail
//           place={selectedPlace}
//           onClose={handleCloseDetail}
//           detailRef={detailRef}
//         />
//       )}

//       {/* 검색 결과 리스트 */}
//       {keyword.length !== 0 && (
//         <div className="hidden md:flex md:w-72 p-4 bg-gray-100 border-l border-gray-300 flex-col">
//           <ul className="space-y-4 overflow-y-auto h-[90%)] pr-2 ">
//             {places.map((place) => (
//               <li
//                 key={place.id}
//                 className="bg-white rounded-lg border border-gray-300 cursor-pointer hover:bg-gray-50"
//               >
//                 <button
//                   className="flex flex-col items-center w-full p-3 gap-y-1"
//                   onClick={() => handlePlaceClick(place)}
//                 >
//                   <p className="font-bold">{place.place_name}</p>
//                   <p className="text-sm">
//                     {place.road_address_name || place.address_name}
//                   </p>
//                   <p className="text-xs text-gray-500">
//                     {place.phone || "전화번호 없음"}
//                   </p>
//                 </button>
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}

//       {/* 모바일용 슬라이딩 패널 */}
//       {keyword.length !== 0 && (
//         <MobilePlaceList
//           isOpen={isSidebarOpen}
//           setIsOpen={setIsSidebarOpen}
//           places={places}
//           handlePlaceClick={handlePlaceClick}
//         />
//       )}
//     </div>
//   );
// };

// export default MapPage;

// const keywordBtn = [
//   { name: "맛집", icon: <IoRestaurantOutline /> },
//   { name: "지하철", icon: <IoSubway /> },
//   { name: "공원", icon: <PiParkLight /> },
//   { name: "백화점", icon: <PiBuildingBold /> },
// ];
