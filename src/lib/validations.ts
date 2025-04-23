//! 회원가입 유효성검사

//  이름 유효성
export function validateName(name: string): string | null {
  if (!name) return "이름을 입력해주세요";
  if (name.length === 1) return "이름을 2~4글자로 입력해주세요";
  if (name.length > 4) return "이름이 너무 깁니다";
  return null;
}

//  이메일 유효성 + 중복 검사
export async function validateEmail(
  email: string,
  checkDuplicate?: (email: string) => Promise<boolean>
): Promise<string | null> {
  if (!email.includes("@")) return "email@email.com 형식으로 입력해주세요";

  const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  if (!regex.test(email)) return "잘못된 이메일 형식입니다";

  if (checkDuplicate) {
    const isDuplicate = await checkDuplicate(email);
    if (isDuplicate) return "중복되었습니다.";
  }

  return null;
}

// 생년월일 유효성
export function validateBirth(birth: string): string | null {
  const onlyNumber = /^\d+$/;
  if (!onlyNumber.test(birth)) return "숫자만 입력해주세요";
  if (birth.length < 8) return "생년월일을 8자리 입력하세요";
  return null;
}

//  전화번호 유효성
export function validatePhone(phone: string): string | null {
  const onlyNumber = /^\d+$/;
  if (!phone) return "- 없이 숫자만 입력해주세요";
  if (!onlyNumber.test(phone)) return "숫자만 입력해주세요";
  if (phone.length > 11) return "전화번호는 11자리로 입력해주세요";
  return null;
}

//  비밀번호 유효성
export function validatePassword(password: string): string | null {
  if (!password) return "비밀번호를 입력해주세요";
  if (password.length < 8 || password.length >= 12) {
    return "비밀번호를 8자리 이상 12자리 미만으로 설정해주세요";
  }
  return null;
}

//  위치정보 동의 유효성
export function validateLocation(agree: boolean): string | null {
  if (!agree) return "위치정보 제공에 동의해주세요";
  return null;
}
