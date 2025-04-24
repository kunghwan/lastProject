import { Post } from "@/types/post";
import PostComponent from "../post/PostComponent";

const ProfileFeed = ({
  posts,
  isMyPage,
}: {
  posts: Post[];
  isMyPage: boolean;
}) => {
  return (
    <div className="flex border-t pt-10 border-blue-200 lg:w-[1024px] mx-auto">
      <ul className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
        {posts.map((post) => (
          <li key={post.id} className="border">
            <PostComponent post={post} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProfileFeed;
