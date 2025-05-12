import { Post } from "@/types/post";

interface Props {
  post: Post;
  editMode: boolean;
  selected: boolean;
  onSelect: (checked: boolean) => void;
}

const BookmarkCard = ({ post, editMode, selected, onSelect }: Props) => {
  return (
    <div className="relative border p-2">
      {editMode && (
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onSelect(e.target.checked)}
          className="absolute top-2 left-2"
        />
      )}
      <img src={post.imageUrl?.[0] || "/noimg.png"} alt="post" />
      <p>{post.title}</p>
      <p>{post.likes.length} Likes</p>
    </div>
  );
};

export default BookmarkCard;
