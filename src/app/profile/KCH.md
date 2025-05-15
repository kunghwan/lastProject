# 0515

1. 모듈창 버튼 css 업데이트하기 ( bg, rounded-full, z-99)

1-1 ProfileFeedLayout.tsx 모둘창의 text 스크롤 구현, 업로드일 구현

1-2 PostComponent.tsx 모둘창 이미지, 버튼 수정

2. 모든 페이지에 react query 적용하기 ( 특히 피드, 북마크 )

3. ppt 만들기, 프레임워크/데이터베이스/전역상태관리/스타일도구 등 소개와 선택 이유, 맡은 페이지 설명 (엄청엄청엄청엄청엄청엄청 변태같이 보여주기/자세하기 스트랩)

// -무한 스크롤
IntersectionObserver + getUserPostsPaginated 연동으로 성능 좋고 깔끔함.

-모달 이미지 뷰어
여러 이미지 지원 (+N 표시) + 좌우 넘기기 + ESC 키 닫기 등 UX가 좋음.

-삭제 기능
AlertModal로 삭제 확인 후 Firestore에서 제거 + UI 동기화 → 실용적이고 안정적.

-시간 포맷 및 날짜 변환 함수
getTimeAgo, getFormattedDate 깔끔하게 처리되어 유지보수 좋음.

-타입 안정성
Post, Timestamp, FieldValue 등의 TypeScript 타입 잘 활용됨.

-디자인
Tailwind 기반 스타일 적용도 훌륭하고, 다크모드 고려도 있음.

# 0514

1. feed 페이지 query 처리하기

2. 무한스크롤 query 처리하기 (feed, profilePage)

3. 데이터 케싱하기

# 0508

1. 팔로우수 업데이트하기

2. 북마크페이지 스타일 이쁘게하기 (hover), 게시물끼리 구분짓는 ui 만들기. (북마크, 피드페이지 등)

3. 유저페이지의 포스트에서도 클릭시 모듈창 구현

4. 렌더링이 너무 많이해서 함수들 usecallback 으로 감싸기

5. 다크모드 css 생각하기

게시물 모듈창에서 이미지들을 빠르게 업로드할 방법 생각하기

# 0506

added bookmark/page.tsx

updated PostComponent.tsx, ProfileLayout.tsx, ProfileFeedLayout.tsx

아이콘, 게시물 이미지 스타일변경

# 0430

연휴때 할것 list

1. feed/page.tsx에서 포스트의 좋아요버튼, 공유버튼 구현
   포스트작성자 클릭시 해당유저페이지로 이동 구현

2. profile/page.tsx, profile/username/page.tsx 에서 업로드한 포스트 보여지기

3. likes/page.tsx 새로운파일 만들고 유저가 likes 한 post 들 보여지기.
   업로드순, 좋아요순 필터버튼 구현

# 0428

const postsRef = dbService.collection(FBCollection.POSTS)

@custom-variant dark (&:where(.dark, .dark \*));

getusernickname 함수에서 authservice에서 현재 로그인한 유저 정보를 가져오고, 만약에 유저가 없다면 '사용자를 찾을 수 없음' 이라는 멘트가 나오는 코드. try로 firestore에서 유저문서를 참조하고 USERS컬렉션의 user의 uid 가 `
