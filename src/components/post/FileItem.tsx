import React from "react";
import { FaPlus } from "react-icons/fa6";

interface FileItemProps {
  file?: File;
}
const FileItem = ({ file }: FileItemProps) => {
  return (
    <div>
      <input
        type="file"
        multiple
        className="border max-w-20 min-h-20 border-gray-500  absolute opacity-0 cursor-pointer z-30"
      />
      <div className="border max-w-20 min-h-20 border-black bg-white cursor-pointer flex justify-center items-center z-10">
        <FaPlus className="text-3xl text-black " />
      </div>
    </div>
  );
};

export default FileItem;
