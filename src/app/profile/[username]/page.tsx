// app/profile/[username]/page.tsx

import { Metadata } from "next";
import { getUserByUsername } from "@/lib/otherUser";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const user = await getUserByUsername(username);
  return {
    title: `방방콕콕 ${user?.nickname || "알 수 없음"}님 페이지`,
    description: `${user?.nickname || "유저"}님 마이페이지`,
  };
}

const page = () => {
  return (
    <div>
      <h1>page</h1>
    </div>
  );
};

export default page;
