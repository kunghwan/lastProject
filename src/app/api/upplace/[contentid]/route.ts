import { NextRequest } from "next/server";
import axios from "axios";

export async function GET(
  req: NextRequest,
  context: { params: { contentid: string } }
) {
  const { contentid } = context.params;

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
          addrinfoYN: "Y",
          _type: "json",
        },
      }
    );

    const items = response.data.response.body.items.item;
    const item = Array.isArray(items) ? items[0] : items;

    return Response.json({
      title: item?.title ?? "제목 없음",
      addr1: item?.addr1 ?? "주소 없음",
      addr2: item?.addr2 ?? "",
      overview: item?.overview ?? "설명 없음",
      firstimage: item?.firstimage ?? "/image/logoc.PNG",
      tel: item?.tel && item.tel.trim() !== "" ? item.tel : "전화번호 없음",
      zipcode:
        item?.zipcode && item.zipcode.trim() !== ""
          ? item.zipcode
          : "우편번호 없음",
      mapx: item?.mapx ?? null,
      mapy: item?.mapy ?? null,
      homepage: item?.homepage ?? "",
      cat1: item?.cat1 ?? "",
      cat2: item?.cat2 ?? "",
      cat3: item?.cat3 ?? "",
    });
  } catch (error) {
    console.error("상세 장소 정보 불러오기 실패", error);
    return new Response(JSON.stringify({ message: "상세 조회 실패" }), {
      status: 500,
    });
  }
}
