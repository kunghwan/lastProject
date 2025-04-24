import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { dbService } from "@/lib/firebase";

// ✅ delay 함수 정의 (300ms 간격 요청을 위한)
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const areaCode = 3; // 대전
    const sigunguCodes = [2, 3, 4, 5, 6]; // 동구 ~ 대덕구
    const contentTypes = [12, 14, 15, 28]; // 관광지, 문화시설, 행사, 공원
    const allItems: any[] = [];

    for (const sigunguCode of sigunguCodes) {
      for (const contentTypeId of contentTypes) {
        for (
          let page = 1;
          page <= 2;
          page++ // 페이지 수 조정
        ) {
          await delay(300); // ✅ 딜레이 적용 (Rate Limit 우회)

          try {
            const response = await axios.get(
              "https://apis.data.go.kr/B551011/KorService1/areaBasedList1",
              {
                params: {
                  serviceKey: process.env.NEXT_PUBLIC_TOUR_API_KEY!, // ✅ 수정 완료
                  MobileOS: "ETC",
                  MobileApp: "AppTest",
                  areaCode,
                  sigunguCode,
                  contentTypeId,
                  pageNo: page,
                  numOfRows: 100,
                  arrange: "P",
                  _type: "json",
                },
              }
            );

            console.log(
              "📦 응답 데이터:",
              JSON.stringify(response.data, null, 2)
            );

            const result = response.data?.response?.body?.items?.item;

            if (Array.isArray(result)) {
              allItems.push(...result);
            } else {
              console.warn(`⚠️ 데이터 없음: ...`);
            }
          } catch (err: any) {
            console.warn(
              `🚨 API 실패: sigunguCode=${sigunguCode}, contentTypeId=${contentTypeId}, page=${page}`
            );
            console.error("에러 상세 로그:", {
              status: err.response?.status,
              statusText: err.response?.statusText,
              message: err.message,
              url: err.config?.url,
              params: err.config?.params,
              data: err.response?.data,
            });
          }
        }
      }
    }

    // 🔁 중복 제거 (contentid 기준)
    const uniqueMap = new Map<string, any>();
    allItems.forEach((item) => {
      if (!uniqueMap.has(item.contentid)) {
        uniqueMap.set(item.contentid, item);
      }
    });
    const uniqueItems = Array.from(uniqueMap.values());

    // 🔥 기존 Firestore likeCount 병합
    const snapshot = await dbService.collection("places").get();
    const likeMap: Record<string, number> = {};
    snapshot.forEach((doc) => {
      const data = doc.data();
      likeMap[data.contentId] = data.likeCount ?? 0;
    });

    // ✅ Firestore 저장 및 병합
    const batch = dbService.batch();
    const placesRef = dbService.collection("places");

    uniqueItems.forEach((item) => {
      const docRef = placesRef.doc(item.contentid);
      const mergedData = {
        contentId: item.contentid,
        title: item.title,
        addr1: item.addr1,
        firstimage: item.firstimage || null,
        likeCount: likeMap[item.contentid] ?? 0,
        createdAt: new Date().toISOString(),
      };
      batch.set(docRef, mergedData, { merge: true }); // 병합 저장
    });

    await batch.commit();

    // 응답용 객체 반환
    const result = uniqueItems.map((item) => ({
      ...item,
      likeCount: likeMap[item.contentid] || 0,
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error("🔥 추천 병합 API 오류:", error);
    res.status(500).json({ message: "서버 에러" });
  }
}
