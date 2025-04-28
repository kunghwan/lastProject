import UploadPostPage from "@/components/post/UploadPage";
import { AUTH } from "@/contextapi/context";
import React from "react";

const PostCreatePage = () => {
  return (
    <div className="p-5 mb-15">
      <UploadPostPage />
    </div>
  );
};

export default PostCreatePage;
