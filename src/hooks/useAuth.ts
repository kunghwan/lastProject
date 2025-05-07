import { useQuery, UseQueryResult } from "@tanstack/react-query";
import {
  fetchPostsByUid,
  fetchPostsByNickname,
} from "@/lib/servies/postService";
import { Post } from "@/types/post";

export const usePostsByUid = (uid: string): UseQueryResult<Post[], Error> => {
  return useQuery<Post[], Error>({
    queryKey: ["posts", uid],
    queryFn: () => fetchPostsByUid(uid),
    enabled: !!uid,
    refetchOnWindowFocus: true, //브라우저 탭으로 돌아왔을 때 (focus 됐을 때) refetch할 것인가?
    refetchOnMount: true, //이 컴포넌트가 마운트(화면에 다시 나올 때)될 때, refetch할 것인가?
    staleTime: 0, //이 데이터가 stale(오래됨) 상태가 되기까지 걸리는 시간
  });
};

export const usePostsByNickname = (
  nickname: string
): UseQueryResult<Post[], Error> => {
  return useQuery<Post[], Error>({
    queryKey: ["posts", nickname],
    queryFn: () => fetchPostsByNickname(nickname),
    enabled: !!nickname,
    staleTime: 1000 * 60 * 5,
  });
};
