// 유효성 검사 결과 공통 타입
interface ValidationResult {
  isValid: boolean; // 유효한지 여부
  message?: string; // 오류메세지
}

interface HomeMenu {
  name: string;
  href: string; // 경로
  Icon: IconType;
}

interface User {
  uid: string; // 유저 아이디
  email: string; // 이메일
  password: string; // 비밀번호
  name: string; // 이름
  tel: string; // 전화번호
  birth: string; // 생년월일
  agreeLocation: boolean; // 위치정보 제공 동의 여부 (체크박스)
}
//  로딩 상태
interface LoadingState {
  isLoading: boolean;
  message?: string;
}

//  인증 코드 입력용 타입 (아이디/비밀번호 찾기에서 재사용)

interface Place {
  id: string; // 장소의 고유 ID (예: "place_001")
  name: string; // 장소 이름 (예: "한밭수목원")
  location: string; // 장소의 위치 또는 주소 (예: "대전 중구")
  imageUrl: string; // 장소 이미지를 나타내는 URL
  description?: string; // 장소 설명 (선택값. 없을 수도 있음)
  likes: number; // 좋아요 수 (예: 15)
}

interface PlaceFilterOption {
  minLikes?: number; // 최소 좋아요 수 필터
}

// +고객센터  interface
interface CustomerService {
  question: string;
  Answer: string;
}
