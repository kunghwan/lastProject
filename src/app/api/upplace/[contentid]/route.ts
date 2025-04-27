import { NextRequest } from "next/server";
import axios from "axios";

export async function GET(
  req: NextRequest,
  context: { params: { contentid: string } }
) {
  const { params } = context;
  const contentid = params?.contentid;

  if (!contentid) {
    return new Response(JSON.stringify({ message: "contentid가 없습니다" }), {
      status: 400,
    });
  }

  try {
    const response = await axios.get(
      "https://apis.data.go.kr/B551011/KorService1/detailCommon1",
      {
        params: {
          serviceKey: decodeURIComponent(process.env.NEXT_PUBLIC_TOUR_API_KEY!),
          MobileOS: "ETC",
          MobileApp: "AppTest",
          contentId: contentid,
          defaultYN: "Y",
          overviewYN: "Y",
          firstImageYN: "Y",
          _type: "json",
        },
      }
    );

    const item = response.data.response.body.items.item; // ✅ 이렇게 꺼내기

    return Response.json({
      title: item?.title ?? "제목 없음",
      addr1: item?.addr1 ?? "주소 없음",
      overview: item?.overview ?? "설명 없음",
      firstimage: item?.firstimage ?? "/image/logoc.PNG",
    });
  } catch (error) {
    console.error("상세 장소 정보 불러오기 실패", error);
    return new Response(JSON.stringify({ message: "상세 조회 실패" }), {
      status: 500,
    });
  }
}
