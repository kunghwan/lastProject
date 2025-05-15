// app/profile/[username]/layout.tsx

import { getUserByUsername } from "@/lib/otherUser";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { username: string };
}): Promise<Metadata> {
  const user = await getUserByUsername(params.username);

  return {
    title: `방방콕콕 ${user?.nickname || "알 수 없음"}페이지`,
    description: `${user?.nickname || "유저"} 마이페이지`,
  };
}

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
