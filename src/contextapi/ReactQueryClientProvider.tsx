"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

export default function ReactQueryProvider({
  children,
}: {
  children: ReactNode;
}) {
  //useState(() => new QueryClient()): QueryClient 인스턴스를 최초에만 만들기 위함 (lazy init).
  //만약 useState(new QueryClient())처럼 함수 없이 바로 값을 넣으면, 컴포넌트가 렌더링될 때마다 new QueryClient()가 실행될 수 있는 여지가 생김
  //하지만 useState(() => new QueryClient())처럼 하면 lazy initialization이 적용되어, 해당 함수는 최초 렌더링 시 한 번만 실행
  //const [queryClient, _] = useState(() => new QueryClient()); => 상태를 바꾸는 함수(setQueryClient)는 필요 없어서 그냥 첫 번째 값만 구조 분해 할당
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
