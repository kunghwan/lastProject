import ProfileLayout from "@/components/ProfileLayout";
import { Post } from "@/types/post";

const MePage = ({ posts }: { posts: Post[] }) => {
  return <ProfileLayout posts={posts} isMyPage={true} />;
};

export default MePage;
