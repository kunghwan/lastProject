export interface AuthCodeInput {
  code: string; // 인증번호 입력값
  masked?: boolean; // 마스킹 여부 (type="password"일 때 true)
}

// 1. 로그인 페이지
export interface LoginForm {
  email: string; // 사용자 이메일
  password: string; // 사용자 비밀번호
}

export interface LoginValidation {
  email: ValidationResult; // 이메일 유효성 검사 결과
  password: ValidationResult; // 비밀번호 유효성 검사 결과
}

// 2. 회원가입 페이지
type SignupForm = User;

export interface SignupValidation {
  name?: ValidationResult; // 이름 유효성 검사 결과
  email?: ValidationResult; // 이메일 유효성 검사 결과
  password?: ValidationResult; // 비밀번호 유효성 검사 결과
  tel?: ValidationResult; // 전화번호 유효성 검사 결과
  birth?: ValidationResult; // 생년월일 유효성 검사 결과
}
// 3. 아이디 찾기 페이지
export interface FindIdForm {
  name: string; // 사용자 이름
  tel: string; // 사용자 전화번호
  authCode?: string; // 인증번호 (optional, 입력 후 확인 단계)
}

// 아이디 찾기에서 각 항목의 유효성 검사 결과를 저장하는 타입
export interface FindIdValidation {
  name?: ValidationResult; // 이름 유효성 검사 결과
  tel?: ValidationResult; // 전화번호 유효성 검사 결과
  authCode?: ValidationResult; // 인증번호 유효성 검사 결과
}

// 인증 완료 후 마스킹된 이메일 정보를 보여주는 용도
export interface MaskedEmailResult {
  original: string; // 원래 이메일 (예: ysw03031@gmail.com)
  masked: string; // 마스킹 처리된 이메일 (예: ysw*****@gmail.com)
}

// 4. 비밀번호 찾기 페이지

// 비밀번호 재설정 시 입력받는 폼 구조
export interface FindPasswordForm {
  newPassword: string; // 새 비밀번호
  confirmPassword: string; // 새 비밀번호 확인
}

// 비밀번호 재설정 폼의 유효성 검사 결과
export interface FindPasswordValidation {
  newPassword?: ValidationResult; // 새 비밀번호 유효성 검사 결과
  confirmPassword?: ValidationResult; // 새 비밀번호 확인 유효성 검사 결과
}
