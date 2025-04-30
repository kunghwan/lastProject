# 알림 페이지

1. 누군가가 나를 팔로우하면 누구누구가 나늘 팔로우했다고 알림이 옴

2. 알림이 오면 알림버튼에 빨간 동그라미가 작게 표시됨

3. 알림페이지에 들어와서 알림을 클릭시 알림을 읽었다고 판단해서 알림이 연해짐

   - 팔로우를 하면 그사람의 팔로우 수가 증가하고 내팔로잉수도 증가함

4. 모두읽기 버튼이 있어서 한번에 많은 알림을 읽을 수 있음

5. 알림을 클릭하면 그 유저의 프로필로 이동

6. 알림이 하나도 없을 경우에는 알림이 없습니다.라는 문구와 뒤로 돌아가는 버튼이 나옴

## 무한스크롤

1. 지금 현재 페이지 주소=initialPageParams 1
2. 앞으로 내가 가져와야할 값의 한 페이지당 보여질 갯수 = limit
3. 앞으로 몇 개의 페이지가 있을지 => totalPages = totalCount / limit

   - ref -> db.collection(users).doc(user.id).collection(notifications)
   - const snap = await ref.get()
   - const notifications = snap.docs.map( doc => ({...doc.data(), id: doc.id }))
   - const snap2 = await ref.limit(limit).get()
   - const totalCount = notifications.length => set()
   - 10개를 불러오면 다음에는 11번째부터불러오는 것도 찾아보기

   - return notifications

4. 다음 페이지가 있는지를 검사해야함 => hasNextPage => () =>{}
   - 만약에 총 페이지 - 현재 페이지를 했을 때 1이상이면 현재 페이지 + 1
   - 아니면 undefined
5. fetchNextPage
