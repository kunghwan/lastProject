import {
  fetchUserByUid,
  fetchUsersByNickname,
} from "@/lib/servies/userService";
import { useQuery, UseQueryResult } from "@tanstack/react-query";

export const useUserByUid = (
  uid: string
): UseQueryResult<User | null, Error> => {
  return useQuery<User | null, Error>({
    queryKey: ["user", uid],
    queryFn: () => fetchUserByUid(uid),
    enabled: !!uid,
    staleTime: 1000 * 60 * 5,
  });
};

export const useUsersByNickname = (
  nickname: string
): UseQueryResult<User[], Error> => {
  return useQuery<User[], Error>({
    queryKey: ["users", nickname],
    queryFn: () => fetchUsersByNickname(nickname),
    enabled: !!nickname,
    staleTime: 1000 * 60 * 5,
  });
};
