import { Post } from "@/types/post";
import { doc, deleteDoc } from "firebase/firestore";
import { dbService } from "@/lib/firebase";
import { useState } from "react";
import { HiOutlinePencilSquare } from "react-icons/hi2";

const ProfileFeedComponent = ({
  posts,
  isMyPage,
}: {
  posts: Post[];
  isMyPage: boolean;
}) => {
  const [postList, setPostList] = useState(posts);

  const handleDelete = async (postId: string) => {
    const ok = window.confirm("정말 이 게시물을 삭제하시겠습니까?");
    if (!ok) return;

    try {
      await deleteDoc(doc(dbService, "posts", postId));
      setPostList((prev) => prev.filter((p) => p.id !== postId));
    } catch (error) {
      console.error("삭제 실패:", error);
      alert("삭제에 실패했습니다.");
    }
  };

  return (
    <div className="flex border-t pt-10 border-blue-200 lg:w-[1024px] mx-auto">
      <ul className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
        {postList.map((post) => (
          <li key={post.id} className="p-1">
            <div className="flex flex-col gap-2 relative">
              {post.imageUrl ? (
                <img
                  src={post.imageUrl}
                  alt="post"
                  className="w-full h-64 transition-all duration-500 ease-in-out transform hover:scale-[1.02] object-cover rounded"
                />
              ) : (
                <div className="w-full h-64 transition-all duration-500 ease-in-out transform hover:scale-[1.02] bg-gray-100 flex items-center justify-center text-gray-400">
                  이미지 없음
                </div>
              )}
              {isMyPage && (
                <button
                  onClick={() => handleDelete(post.id!)}
                  className="absolute bottom-10 right-1 text-s text-pink-700 hover:animate-pulse hover:scale-[1.02] cursor-pointer p-2 hover:text-pink-600 active:text-pink-700  dark:active:text-pink-100"
                >
                  <HiOutlinePencilSquare />
                </button>
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
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProfileFeedComponent;
