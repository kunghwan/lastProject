"use client"; // 클라이언트 컴포넌트임을 명시 (Next.js에서 상호작용 가능하도록)

import { useEffect, useState } from "react";
import { useParams } from "next/navigation"; // URL 파라미터 추출
import axios from "axios"; // HTTP 요청 라이브러리

import Link from "next/link"; // 라우팅용 링크 컴포넌트

// 장소 상세 정보를 나타내는 타입
interface PlaceDetail {
  title: string; // 장소 이름
  addr1: string; // 주소
  overview: string; // 설명
  firstimage: string; // 대표 이미지
  tel: string; // 전화번호
  zipcode: string; // 우편번호
}

const PlaceDetailPage = () => {
  const params = useParams<{ contentid: string }>(); // URL에서 contentid 추출
  const contentid = params?.contentid; // 값 가져오기

  // contentid가 없으면 잘못된 접근 안내
  if (!contentid) {
    return <div>잘못된 접근입니다.</div>;
  }

  const [place, setPlace] = useState<PlaceDetail | null>(null); // 장소 상세 상태

  // ✅ 컴포넌트 마운트 또는 contentid 변경 시 장소 상세 데이터 가져오기
  useEffect(() => {
    const fetchPlaceDetail = async () => {
      try {
        // 서버 API를 통해 장소 상세 정보 가져오기
        const res = await axios.get(`/api/upplace/${contentid}`);
        setPlace(res.data); // 응답 데이터 저장
      } catch (error) {
        console.error("장소 상세 정보 불러오기 실패", error);
      }
    };

    if (contentid) {
      fetchPlaceDetail(); // contentid 있을 때만 요청
    }
  }, [contentid]);

  // place가 아직 로드되지 않았으면 로딩 표시
  if (!place) {
    return <div>로딩중...</div>;
  }

  const isLongText = place.overview.length > 500; // 설명이 길면 스크롤 처리

  return (
    <div className="mx-auto px-4 pb-10 dark:text-white">
      {/* 장소 이미지 표시 (없으면 기본 이미지) */}
      <img
        src={place.firstimage || "/image/logoc.PNG"}
        alt={place.title}
        className="w-full h-64 object-cover rounded mb-4 md:object-cover lg:object-cover"
      />

      <h1 className="text-xl font-bold mb-2 mt-1 dark:text-white">
        {place.title}
      </h1>

      {/* 주소 */}
      <p className="text-gray-600 mb-2 dark:text-white">{place.addr1}</p>

      {/* 전화번호 / 우편번호 */}
      <div className="flex gap-x-2.5 mb-2 flex-wrap dark:text-white">
        <p className="text-gray-600 dark:text-white">전화번호: {place.tel}</p>
        <p className="text-gray-600 dark:text-white">
          우편번호: {place.zipcode}
        </p>
      </div>

      {/* 장소 설명 (500자 이상이면 스크롤 가능) */}
      <div
        className={`text-gray-800 text-sm leading-relaxed whitespace-pre-line dark:text-white ${
          isLongText ? "max-h-60 overflow-y-auto pr-2" : ""
        }`}
      >
        {place.overview}
      </div>

      {/* 추천장소 목록으로 이동 버튼 */}
      <Link
        href="/upplace"
        className="block mt-4 rounded bg-emerald-300 text-center py-2 font-bold lg:w-80 md:w-150"
      >
        추천장소 홈으로 돌아가기
      </Link>
    </div>
  );
};

export default PlaceDetailPage;
