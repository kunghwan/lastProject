//게시글
export interface Post {
  tags: string[];
  juso: string;
  imgs: string[];
  id: string;
  content: string;
  uid?: string;
  createdAt: Date; // 게시 시간
}
//알림
export interface FollowNotice {
  uid?: string; //팔로우 당한 사람의 ID (나의 아이디)
  id: string; // Firebase 문서 ID
  senderId: string; // 팔로우한 사람의 ID
  createdAt: Date; // 알림 생성 시각
  isRead: boolean; // 읽음 여부
}
export interface FollowNoticeState {
  notice: FollowNotice[]; //알림목록
  hasMore: boolean; // 더 불러올 것 인가의 여부
}
