// 유효성 검사 결과 공통 타입
interface ValidationResult {
  isValid: boolean; // 유효한지 여부
  message?: string; // 오류메세지
}

interface User {
  uid: string; // 유저 ID (Firebase UID 등)
  email: string; // 이메일
  password: string; // 비밀번호
  name: string; // 이름
  tel?: string; // 전화번호
  birth?: string; // 생년월일
  agreeLocation?: boolean; // 위치정보 제공 동의 여부

  // 👇 SNS 관련 추가 필드
  nickname?: string; // 닉네임
  profileImageUrl?: string; // 프로필 이미지 (파일 업로드 시 URL로 저장)
  bio?: string; // 자기소개
}

interface PromiseResult {
  message?: string;
  success?: boolean;
  code?: string;
  reason?: "user-not-found" | "wrong-password" | "unknown-error"; // 아이디 비번 틀린거
}
//  로딩 상태
interface LoadingState {
  isLoading: boolean;
  message?: string;
}

//  인증 코드 입력용 타입 (아이디/비밀번호 찾기에서 재사용)
interface AuthCodeInput {
  code: string; // 인증번호 입력값
  masked?: boolean; // 마스킹 여부 (type="password"일 때 true)
}

// 1. 로그인 페이지
interface LoginForm {
  email: string; // 사용자 이메일
  password: string; // 사용자 비밀번호
}

interface LoginValidation {
  email: ValidationResult; // 이메일 유효성 검사 결과
  password: ValidationResult; // 비밀번호 유효성 검사 결과
}

// 2. 회원가입 페이지
type SignupForm = User;

interface SignupValidation {
  name?: ValidationResult; // 이름 유효성 검사 결과
  email?: ValidationResult; // 이메일 유효성 검사 결과
  password?: ValidationResult; // 비밀번호 유효성 검사 결과
  tel?: ValidationResult; // 전화번호 유효성 검사 결과
  birth?: ValidationResult; // 생년월일 유효성 검사 결과
}
// 3. 아이디 찾기 페이지
interface FindIdForm {
  name: string; // 사용자 이름
  tel: string; // 사용자 전화번호
  authCode?: string; // 인증번호 (optional, 입력 후 확인 단계)
}

// 아이디 찾기에서 각 항목의 유효성 검사 결과를 저장하는 타입
interface FindIdValidation {
  name?: ValidationResult; // 이름 유효성 검사 결과
  tel?: ValidationResult; // 전화번호 유효성 검사 결과
  authCode?: ValidationResult; // 인증번호 유효성 검사 결과
}

// 인증 완료 후 마스킹된 이메일 정보를 보여주는 용도
interface MaskedEmailResult {
  original: string; // 원래 이메일 (예: ysw03031@gmail.com)
  masked: string; // 마스킹 처리된 이메일 (예: ysw*****@gmail.com)
}

// 4. 비밀번호 찾기 페이지

// 유효성 검사 결과 타입 정의
interface ValidationResult {
  isValid: boolean;
  message?: string;
}

// 새 비밀번호 입력폼 타입
interface FindPasswordForm {
  newPassword: string;
  confirmPassword: string;
}

// 유효성 검사 메시지 상태 타입
interface FindPasswordValidation {
  newPassword?: ValidationResult;
  confirmPassword?: ValidationResult;
}
// 5. 추천장소
// 장소 데이터 타입 정의
interface Place {
  contentid: string; // 콘텐츠 ID
  title: string; // 장소 제목
  addr1: string; // 주소
  firstimage: string; // 이미지 URL
  likeCount: number; // 좋아요 수
}
//! context
// 장소 상세 정보를 나타내는 타입
interface PlaceDetail {
  title: string; // 장소 이름
  addr1: string; // 주소
  overview: string; // 설명
  firstimage: string; // 대표 이미지
  tel: string; // 전화번호
  zipcode: string; // 우편번호
}
//! PlaceCard
// ✅ 장소 타입 정의
interface UpPlace {
  contentid: string; // 장소 ID
  title: string; // 장소명
  addr1: string; // 주소
  firstimage: string; // 대표 이미지
  likeCount: number; // 좋아요 수
}

// ✅ props 타입 정의
interface PlaceCardProps {
  place?: UpPlace; // 렌더링할 장소 객체
  likedOverride?: boolean; // 외부에서 좋아요 상태 강제 지정
  countOverride?: number; // 외부에서 좋아요 수 강제 지정
}

//! UpPlaceLikeButton.tsx
// ✅ props 정의
interface UpPlaceLikeButtonProps {
  contentId: string; // 장소 ID
  onLiked?: (newCount: number) => void; // 좋아요 수 변경 시 콜백
  placeInfo?: {
    title: string;
    addr1: string;
    imageUrl: string;
  };
  likedOverride?: boolean; // 외부에서 좋아요 상태 강제 지정
  countOverride?: number; // 외부에서 좋아요 수 강제 지정
}

//-----------------------------------------------

interface HomeMenu {
  name: string;
  href: string; // 경로
  Icon: IconType;
}

type PlaceProps = {
  id: string; // 장소 id
  place_name: string; // 장소 이름
  address_name: string; // 주소
  road_address_name: string; // 도로명 주소
  phone: string; // 전화번호
  x: string; //x좌표
  y: string; //y좌표
};

// 전역적으로 상태관리
interface Window {
  kakao: any; // 카카오 불러오기
  checkUnreadNotifications?: () => void; //알림 읽음 여부
}

///실험
