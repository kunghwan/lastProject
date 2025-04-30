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
    staleTime: 1000 * 60 * 5,
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
