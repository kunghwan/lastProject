export interface Notification {
  id?: string; //firebase에서 자동으로 생성되는 ID
  follwingId: string; // 팔로우된 사람의 ID
  follwingNickname?: string; // 팔로우된 사람의 닉네임
  followerNickname?: string; // 팔로우한 사람의 닉네임
  followerId: string; // 팔로우한 사람의 ID
  createdAt: Date;
  isRead: boolean; // 읽음 여부
}
