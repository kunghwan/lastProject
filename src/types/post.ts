import { FieldValue, Timestamp } from "firebase/firestore";

// SNS페이지 요구사항명세서
// 1. 피드페이지 메인
//  - 홈페이지 네브바에서 sns 버튼을 누르면 홈페이지의 지도가 반으로 줄어들고 그 빈자리에 sns 페이지가 보여집니다.
//  - sns페이지와 지도화면은 사용자가 오른쪽왼쪽 커스텀할 수 있습니다. (어려워보임)
// 2. 상단에 검색바가 있고 나머지 부분은 피드로 채워집니다.
//  - 포스트는 560x600의 사이즈(예상)로 양옆 마진을 약간주어 답답한 느낌이 들지않게 보여집니다.
//  - 해당 포스트 아래쪽에 좋아요버튼과 좋아요카운트, 공유버튼과 공유카운트(어떻게집계할지는 상의), 그리고 위치버튼이 있고 해당 장소의 주소가 있습니다. 위치버튼, 또는 주소를 클릭하면 옆에 지도에서 해당 장소에 포커스됩니다.
// 3. 피드의 포스트는 n개까지 올릴수 있고 옆으로 밀어볼 수 있습니다.
// 4. 모든 피드는 무한스크롤로 내려서 다음 포스트를 확인할 수 있습니다.

// SNS페이지 export interface;

// 전체 피드 페이지 타입
export interface FeedPageProps {
  posts: Post[]; // 전체 포스트 리스트
  onPostFocus: (location: Location) => void; // 지도에서 해당 위치로 포커스하는 함수
}
// 포스트 하나에 대한 타입
export interface Post {
  id?: string; // 게시물 고유 ID
  imageUrl?: string | string[] | null; // 게시물 대표 이미지 URL
  uid: string; // 작성자 ID
  content: string; // 게시물 내용 또는 설명
  likes: Array<string>;
  shares: Array<{ uid: string; count: number }>; // 공유 수
  lo: Location; // 장소 정보 (위치, 주소 등)
  // likes: number; // 좋아요 수를 카운트하기위해 uid 좋아요를 클릭한 사람의 uid를 담음 취소하면 uid를 뺌
  title: string; // 게시물 제목
  createdAt: string | FieldValue | Timestamp; // 작성일시 (ISO 8601)
  userNickname: string; // 작성자 닉네임
  userProfileImage: string; // 작성자 프로필 이미지 URL
  bookmarked: Array<string>;
  isLiked: boolean; // 현재 유저가 좋아요 눌렀는지 여부
  imgs: string[]; // 게시물에 포함된 이미지 URL 배열
  tags: Tag[];
}

// const post1: Post = {
//   likes: ["1", "2", "3"],
// };

// setPost((prev) => ({ ...prev, likes: [...prev.likes, newId] }));

// 지도위치 정보
export interface Location {
  latitude: number; // 위도
  longitude: number; // 경도
  address: string; // 해당 위치의 주소
}
// 피드 컴포넌트 기능
export interface FeedCardProps {
  post: Post; // 피드에 보여질 게시물 하나
  onLike: (postId: string) => void; // 좋아요 버튼 클릭 핸들러
  onShare: (postId: string) => void; // 공유 버튼 클릭 핸들러
  onLocationClick: (location: Location) => void; // 위치 클릭 시 지도 포커스 이동 함수
}
// 무한스크롤 처리
export interface InfiniteScrollProps {
  isLoading: boolean; // 데이터 로딩 중 여부
  hasMore: boolean; // 더 불러올 게시물이 있는지
  onLoadMore: () => void; // 다음 게시물 요청 함수
}

export interface Bookmark {
  id: string; //북마크아이디
  postId: string;
  uid: string; // bookmark 한 사람의 아이디
  createdAt: Date;
}

export interface Tag {
  id: string; // 태그 아이디
  name: string;
  onTag?: () => void; // 태그 클릭 시 핸들러
}
// 3131016571
