import PostComponent from "@/components/post/PostComponent";

const Example = () => {
  const examplePost = {
    id: "1",
    imageUrl: "https://example.com/image.jpg",
    content: "이것은 예제 게시물입니다.",
    likes: ["user1", "user2"],
    shares: ["user3"],
    lo: {
      latitude: 37.5665,
      longitude: 126.978,
      address: "서울특별시",
    },
    createdAt: "2025-04-29T12:00:00Z",
  };

  return (
    <div>
      <PostComponent />
    </div>
  );
};

export default Example;
