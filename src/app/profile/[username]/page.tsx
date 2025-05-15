import ClientPage from "./ClientPage";

export default async function Page({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  return <ClientPage username={username} />;
}
