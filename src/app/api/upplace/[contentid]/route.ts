import { NextRequest } from "next/server";
import axios from "axios";

interface Params {
  params: {
    contentid: string;
  };
}

export async function GET(
  req: NextRequest,
  { params }: Params
): Promise<Response> {
  const contentid = params.contentid;

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

    const item = Array.isArray(response.data.response.body.items.item)
      ? response.data.response.body.items.item[0]
      : response.data.response.body.items.item;

    return new Response(JSON.stringify(item), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: "상세 조회 실패" }), {
      status: 500,
    });
  }
}
