import ClientPage from "./ClientPage";

const Page = ({ params }: { params: { username: string } }) => {
  return <ClientPage username={params.username} />;
};

export default Page;
