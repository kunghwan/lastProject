"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import UpPlaceLikeButton from "@/components/upplace/UpPlaceLikeButton";
import Link from "next/link";

interface PlaceDetail {
  title: string;
  addr1: string;
  overview: string;
  firstimage: string;
  tel: string;
  zipcode: string;
}

const PlaceDetailPage = () => {
  const params = useParams<{ contentid: string }>();
  const contentid = params?.contentid;

  if (!contentid) {
    return <div>잘못된 접근입니다.</div>;
  }

  const [place, setPlace] = useState<PlaceDetail | null>(null);

  useEffect(() => {
    const fetchPlaceDetail = async () => {
      try {
        const res = await axios.get(`/api/upplace/${contentid}`); //!  상세 데이터 호출
        setPlace(res.data);
      } catch (error) {
        console.error("장소 상세 정보 불러오기 실패", error);
      }
    };

    if (contentid) {
      fetchPlaceDetail();
    }
  }, [contentid]);

  if (!place) {
    return <div>로딩중...</div>;
  }

  const isLongText = place.overview.length > 500; // 설명 길이 기준

  return (
    <div className="mx-auto  px-4 pb-10  dark:text-white">
      <img
        src={place.firstimage || "/image/logoc.PNG"}
        alt={place.title}
        className="w-full h-64 object-cover rounded mb-4 md:object-cover lg:object-cover"
      />
      <h1 className="text-xl font-bold mb-2 mt-1 dark:text-white">
        {place.title}
      </h1>
      <p className="text-gray-600 mb-2 dark:text-white">{place.addr1}</p>

      <div className="flex gap-x-2.5 mb-2 flex-wrap dark:text-white">
        <p className="text-gray-600 dark:text-white">전화번호: {place.tel}</p>
        <p className="text-gray-600 dark:text-white">
          우편번호: {place.zipcode}
        </p>
      </div>

      {/* ✅ 설명이 길 경우에만 스크롤되도록 처리 */}
      <div
        className={`text-gray-800 text-sm leading-relaxed whitespace-pre-line dark:text-white ${
          isLongText ? "max-h-60 overflow-y-auto pr-2" : ""
        }`}
      >
        {place.overview}
      </div>

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
