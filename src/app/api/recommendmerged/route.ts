// src/app/api/recommendmerged/route.ts
import { NextRequest } from "next/server";
import axios from "axios";
import { dbService } from "@/lib/firebase";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function GET(req: NextRequest) {
  try {
    const areaCode = 3;
    const sigunguCodes = [2, 3, 4, 5, 6];
    const contentTypes = [12, 14, 15, 28];
    const allItems: any[] = [];

    for (const sigunguCode of sigunguCodes) {
      for (const contentTypeId of contentTypes) {
        for (let page = 1; page <= 2; page++) {
          await delay(300);

          try {
            const response = await axios.get(
              "https://apis.data.go.kr/B551011/KorService1/areaBasedList1",
              {
                params: {
                  serviceKey: decodeURIComponent(
                    process.env.NEXT_PUBLIC_TOUR_API_KEY!
                  ),
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

            const result = response.data?.response?.body?.items?.item;
            if (Array.isArray(result)) {
              allItems.push(...result);
            }
          } catch (err: any) {
            console.warn("API 실패", { sigunguCode, contentTypeId, page });
          }
        }
      }
    }

    const uniqueMap = new Map<string, any>();
    allItems.forEach((item) => {
      if (!uniqueMap.has(item.contentid)) {
        uniqueMap.set(item.contentid, item);
      }
    });
    const uniqueItems = Array.from(uniqueMap.values());

    const snapshot = await dbService.collection("places").get();
    const likeMap: Record<string, number> = {};
    snapshot.forEach((doc) => {
      const data = doc.data();
      likeMap[data.contentId] = data.likeCount ?? 0;
    });

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
      batch.set(docRef, mergedData, { merge: true });
    });

    await batch.commit();

    const result = uniqueItems.map((item) => ({
      ...item,
      likeCount: likeMap[item.contentid] || 0,
    }));

    return Response.json(result, { status: 200 });
  } catch (error) {
    console.error("🔥 추천 병합 API 오류:", error);
    return Response.json({ message: "서버 에러" }, { status: 500 });
  }
}
