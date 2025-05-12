import { NextRequest } from "next/server";
import axios from "axios";

export async function GET(
  req: NextRequest,
  context: { params: { contentid: string } }
): Promise<Response> {
  const contentid = context.params.contentid;

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
          serviceKey: process.env.NEXT_PUBLIC_TOUR_API_KEY!,
          MobileOS: "ETC",
          MobileApp: "AppTest",
          contentId: contentid,
          defaultYN: "Y",
          overviewYN: "Y",
          firstImageYN: "Y",
          addrinfoYN: "Y",
          _type: "json",
        },
      }
    );

    const items = response.data.response.body.items.item;
    const item = Array.isArray(items) ? items[0] : items;

    return new Response(JSON.stringify(item), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("상세 조회 실패", error);
    return new Response(JSON.stringify({ message: "상세 조회 실패" }), {
      status: 500,
    });
  }
}
