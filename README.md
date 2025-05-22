# 페이지 담당 페이지

1. 유경환

   - idfind
   - pwfind
   - signin
   - signup
   - upplace

     - component/auth
     - Loading

   - contextApi

2. 강산

   - map
   - app/page.tsx
     - components/
       - map
       - features/navber

3. 강찬희

   - profile
     - 프로필, 이름, 소개글, 개시물 수, 구독자 수를 표시합니다..
     - 다양한 화면 크기에 대응하는 반응형 디자인을 제공해야 한다.
   - components/post
     - 하나의 게시물에는 1장 이상의 이미지가 포함될 수 있으며, 사용자는 좌우로 슬라이드하여 여러 이미지를 탐색할 수 있습니다.
     - 무한스크롤 구현

4. 허승이
   - customer
   - notification
   - uploadpostpage
   - followButton (컴포넌트)

# 오늘 할일

1. 맡은 페이지 중 작업할 페이지 하나 선택해서 README.md 만들고 작업
2. 작업 끝나면 PR 날리고 팀장한테 리뷰 신청하기
3. 리뷰 다같이 진행할 수 있도록 7교시에 진행
4. 리뷰 후 문제 없으면 MERGE

## github branch 전략

1. 본인의 branch에만 push 하기! **팀장포함!예외없음**
2. merge 된 후 본인 브랜치에서 add&commit 후 gitpull origin main

### 팀장 전용

1. 예외상황을 고려해서 상항 tag 만들기
2. git tag -a 태그이름 -m '태그내용'
3. push할때 -- tages 붙이기

```bash
 git push origin <branch-name> --tags
```

//
