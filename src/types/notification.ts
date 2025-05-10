import { Timestamp } from "firebase/firestore";

export interface Notifications {
  id?: string; //firebase에서 자동으로 생성되는 ID
  follwingId: string; // 팔로우된 사람의 ID
  follwingNickname?: string; // 팔로우된 사람의 닉네임
  followerNickname?: string; // 팔로우한 사람의 닉네임
  follwerId: string; // 팔로우한 사람의 ID
  createdAt: Timestamp;
  isRead: boolean; // 읽음 여부
  type: "like" | "follow";
  likerName?: string;
  postId: string;
  profileImageUrl?: string;
}
