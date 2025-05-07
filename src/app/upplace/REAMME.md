# 📍 추천장소 페이지 명세서

사용자에게 대전 지역의 추천 관광지를 보여주는 페이지입니다.  
관광지 리스트와 상세 페이지는 분리되어 있으며, 무한 스크롤 및 이미지 유효성 필터링 기능을 포함합니다.

---

## ✅ 페이지 구성

### 1. `/upplace` - 추천장소 리스트 페이지

#### 🔹 주요 기능

| 항목         | 설명                                                        |
| ------------ | ----------------------------------------------------------- |
| 데이터 호출  | `/api/recommendmerged` API를 통해 추천 장소 리스트 호출     |
| 이미지 검증  | `checkImageExists()`로 이미지 로딩 가능 여부 확인 후 필터링 |
| 정렬 기준    | `likeCount` 기준 내림차순 정렬                              |
| 무한 스크롤  | 스크롤이 하단에 도달하면 자동으로 10개씩 추가 로딩          |
| 출력 방식    | `PlaceCard` 컴포넌트를 활용한 카드형 UI 출력                |
| 기타 UI 요소 | 상단 이동 버튼 (`TopButton`) 포함                           |

#### 📦 데이터 구조 (Place)

```ts
interface Place {
  contentid: string;
  title: string;
  addr1: string;
  firstimage: string;
  likeCount: number;
}
```
