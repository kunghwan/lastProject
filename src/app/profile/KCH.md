# 0508

북마크페이지 스타일 이쁘게하기 (격자스타일)

게시물 모듈창에서 이미지들을 빠르게 업로드할 방법 생각하기

팔로우수 업데이트하기

게시물끼리 구분짓는 ui 만들기. (북마크, 피드페이지 등)

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
