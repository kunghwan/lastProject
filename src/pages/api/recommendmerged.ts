import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { dbService } from "@/lib/firebase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const areaCode = 3; // 대전
    const sigunguCodes = [2, 3, 4, 5, 6]; // 동구, 중구, 서구, 유성구, 대덕구
    const contentTypes = [12, 14, 15, 28]; // 관광지, 문화시설, 행사, 레포츠(공원)
    const allItems: any[] = [];

    for (const sigunguCode of sigunguCodes) {
      for (const contentTypeId of contentTypes) {
        for (let page = 1; page <= 3; page++) {
          try {
            const response = await axios.get(
              "https://apis.data.go.kr/B551011/KorService1/areaBasedList1",
              {
                params: {
                  serviceKey: process.env.NEXT_PUBLIC_TOUR_API_KEY,
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

            const items = response.data.response.body.items?.item || [];
            allItems.push(...items);
          } catch (err) {
            console.warn(
              `🚨 API 실패: sigunguCode=${sigunguCode}, contentTypeId=${contentTypeId}, page=${page}`
            );
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

    // 🔥 Firestore에서 likeCount 가져오기
    const snapshot = await dbService.collection("places").get();
    const likeMap: Record<string, number> = {};

    snapshot.forEach((doc) => {
      const data = doc.data();
      likeMap[data.contentId] = data.likeCount ?? 0;
    });

    // ✅ 병합: TourAPI + Firestore
    const merged = uniqueItems.map((item) => ({
      ...item,
      likeCount: likeMap[item.contentid] || 0,
    }));

    res.status(200).json(merged);
  } catch (error) {
    console.error("추천 병합 API 오류:", error);
    res.status(500).json({ message: "서버 에러" });
  }
}
