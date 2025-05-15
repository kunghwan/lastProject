import { Metadata } from "next";
import { getUserByUsername } from "@/lib/otherUser";

type Props = {
  params: { username: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const user = await getUserByUsername(params.username);

  return {
    title: `방방콕콕 ${user?.nickname || "알 수 없음"}님 페이지`,
    description: `${user?.nickname || "유저"}님 마이페이지`,
  };
}

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
