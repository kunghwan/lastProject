"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";

const fetchPlaceDetail = async (contentid: string) => {
  const res = await axios.get(`/api/upplace/${contentid}`);
  return res.data;
};

const PlaceDetailPage = () => {
  const params = useParams<{ contentid: string }>();
  const contentid = params?.contentid;

  const {
    data: place,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["placeDetail", contentid],
    queryFn: () => fetchPlaceDetail(contentid!), // ✅ 타입 단언 처리
    enabled: !!contentid,
    staleTime: 1000 * 60 * 5,
  });

  if (!contentid) return <div>잘못된 접근입니다.</div>;
  if (isLoading) return <div>로딩중...</div>;
  if (isError) return <div>❌ 상세 정보 로딩 실패</div>;

  const isLongText = place.overview.length > 500;

  return (
    <div className="mx-auto px-4 pb-10 dark:text-white">
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

      <div
        className={`text-gray-800 text-sm leading-relaxed whitespace-pre-line dark:text-white ${
          isLongText ? "max-h-60 overflow-y-auto pr-2" : ""
        }`}
      >
        {place.overview}
      </div>

      <Link
        href="/upplace"
        className="block mt-4 rounded bg-emerald-300 text-center py-2 font-bold lg:w-80 md:w-150 dark:bg-emerald-500"
      >
        추천장소 홈으로 돌아가기
      </Link>
    </div>
  );
};

export default PlaceDetailPage;
