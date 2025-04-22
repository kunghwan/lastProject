// 유효성 검사 결과 공통 타입
interface ValidationResult {
  isValid: boolean; // 유효한지 여부
  message?: string; // 오류메세지
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

interface PromiseResult {
  message?: string;
  success?: boolean;
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

// 비밀번호 재설정 시 입력받는 폼 구조
interface FindPasswordForm {
  newPassword: string; // 새 비밀번호
  confirmPassword: string; // 새 비밀번호 확인
}

// 비밀번호 재설정 폼의 유효성 검사 결과
interface FindPasswordValidation {
  newPassword?: ValidationResult; // 새 비밀번호 유효성 검사 결과
  confirmPassword?: ValidationResult; // 새 비밀번호 확인 유효성 검사 결과
}

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

interface HomeMenu {
  name: string;
  href: string; // 경로
  Icon: IconType;
}
