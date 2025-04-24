// pages/api/recommend.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const response = await axios.get('https://apis.data.go.kr/B551011/KorService1/areaBasedList1', {
      params: {
        serviceKey: process.env.NEXT_PUBLIC_TOUR_API_KEY, // .env.local에 저장된 API 키
        MobileOS: 'ETC',
        MobileApp: 'AppTest',
        numOfRows: 10,
        pageNo: 1,
        arrange: 'P', // 인기순 정렬
        contentTypeId: 12, // 관광지
        _type: 'json',
      },
    });

    const items = response.data.response.body.items.item;

    res.status(200).json(items);
  } catch (error) {
    console.error('API 호출 에러:', error);
    res.status(500).json({ message: '서버 에러' });
  }
}
