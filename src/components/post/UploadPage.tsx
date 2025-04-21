"use client";

import { Post } from "@/types/post";
import React, { useCallback, useState } from "react";

interface UploadPageProps {
  onCancel?: () => void;
}

const UploadPage = ({ onCancel }: UploadPageProps) => {
  const [title, setTitle] = useState("");

  const onSubmit = useCallback(async () => {}, []);

  return (
    <div>
      <h1>새글작성</h1>
      <form
        action=""
        onSubmit={(e) => e.preventDefault()}
        className="flex flex-col gap-2"
      >
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목"
          className="border"
        />
        <textarea name="" id="" className="border" />
      </form>
    </div>
  );
};

export default UploadPage;
