import { Post } from "@/types/post";

const ProfileFeedComponent = ({
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
          <li key={post.id} className="border p-2">
            <div className="flex flex-col gap-2">
              {post.imageUrl ? (
                <img
                  src={post.imageUrl}
                  alt="post"
                  className="w-full h-64 object-cover rounded"
                />
              ) : (
                <div className="w-full h-64 bg-gray-100 flex items-center justify-center text-gray-400">
                  이미지 없음
                </div>
              )}

              <div className="text-sm">
                <p className="font-semibold truncate">
                  {post.title || "제목 없음"}
                </p>
                <p className="text-gray-600">
                  {post.content?.slice(0, 60) || "내용 없음"}
                </p>
              </div>

              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>♥ {post.likes?.length || 0}</span>
                <span>🔄 {post.shares?.length || 0}</span>
              </div>

              {isMyPage && (
                <button className="mt-1 text-xs text-blue-500 hover:underline">
                  수정하기
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProfileFeedComponent;
