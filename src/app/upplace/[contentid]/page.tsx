"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";

interface PlaceDetail {
  title: string;
  addr1: string;
  overview: string;
  firstimage: string;
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
        const res = await axios.get(`/api/upplace/${contentid}`); // ✅ 여기서 상세 데이터 호출
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
      <p className="text-gray-600 mb-2">{place.addr1}</p>
      <p className="text-gray-800 whitespace-pre-line">{place.overview}</p>
    </div>
  );
};

export default PlaceDetailPage;
