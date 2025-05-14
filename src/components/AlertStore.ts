import { create } from "zustand";
import type { RefObject } from "react";

// ✅ 알림창 버튼 인터페이스 정의
export interface AlertButton {
  text?: string; // 버튼에 표시할 텍스트
  onClick?: () => void; // 버튼 클릭 시 실행될 함수
  isGreen?: boolean; // true면 초록색 버튼, 아니면 회색
  autoFocus?: boolean; // true면 Enter 키 누를 시 자동 실행될 버튼
  target?: number; // 버튼 클릭 시 focus할 ref의 인덱스
}

// ✅ 상태 객체 전체 인터페이스
interface AlertState {
  isOpen: boolean; // 알림창이 열려 있는지 여부
  title?: string; // 알림창 제목 (옵션)
  message: string | null; // 본문 메시지
  buttons?: AlertButton[]; // 버튼 배열
  targetRefs?: Array<RefObject<HTMLInputElement | HTMLTextAreaElement | null>>; // 포커스할 ref들 모음 (예: [emailRef, pwRef])

  // ✅ 알림창 열기 함수
  openAlert: (
    message: string, // 본문 메시지
    buttons?: AlertButton[], // 버튼들
    title?: string, // 제목
    targetRefs?: Array<RefObject<HTMLInputElement | HTMLTextAreaElement | null>> // 포커스할 ref들
  ) => void;

  // ✅ 알림창 닫기 함수
  closeAlert: () => void;
}

// ✅ zustand 스토어 생성
export const useAlertModal = create<AlertState>((set) => ({
  isOpen: false, // 초기 상태: 알림창 닫힘
  title: undefined,
  message: null,
  buttons: [],
  targetRefs: [],

  // ✅ 알림창 열기 함수 구현
  openAlert: (message, buttons = [], title, targetRefs = []) =>
    set({
      isOpen: true, // 알림창 열기
      message,
      buttons,
      title,
      targetRefs,
    }),

  // ✅ 알림창 닫기 함수 구현
  closeAlert: () =>
    set({
      isOpen: false, // 알림창 닫기
      message: null,
      buttons: [],
      title: undefined,
      targetRefs: [],
    }),
}));
