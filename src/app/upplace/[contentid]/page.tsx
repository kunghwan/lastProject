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

  return (
    <div className="p-6">
      <img
        src={place.firstimage || "/image/logoc.PNG"}
        alt={place.title}
        className="w-full h-64 object-cover rounded mb-6"
      />
      <h1 className="text-2xl font-bold mb-4">{place.title}</h1>
      <Link href="/upplace">추천장소 홈으로 돌아가기</Link>

      <p className="text-gray-600 mb-2">{place.addr1}</p>

      <p className="text-gray-600 mb-2">전화번호: {place.tel}</p>
      <p className="text-gray-600 mb-2">우편번호: {place.zipcode}</p>

      <p className="text-gray-800 whitespace-pre-line">{place.overview}</p>
    </div>
  );
};

export default PlaceDetailPage;
