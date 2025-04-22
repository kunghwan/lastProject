import React from "react";
import { FaPlus } from "react-icons/fa6";
import { RiDeleteBin5Fill } from "react-icons/ri";

interface FileItemProps {
  file?: File;
  onChangeFiles?: (props: FileList) => void;
  onDeleteFiles?: () => void;
}
const FileItem = ({ file, onChangeFiles, onDeleteFiles }: FileItemProps) => {
  return (
    <div className=" relative  w-25 h-25">
      {!file ? (
        <input
          type="file"
          onChange={(e) => {
            if (onChangeFiles && e.target.files) {
              onChangeFiles(e.target.files);
            }
          }}
          multiple
          className="border max-w-25 min-h-25 border-gray-500  relative  opacity-0 cursor-pointer z-30"
        />
      ) : (
        <button
          type="button"
          onClick={onDeleteFiles}
          className=" absolute border rounded text-xl bg-white z-20 w-25 h-25 opacity-0 hover:opacity-80 flex justify-center items-center cursor-pointer"
        >
          <RiDeleteBin5Fill />
        </button>
      )}
      <div className="absolute top-0 left-0  w-full h-full border rounded bg-white cursor-pointer  flex justify-center items-center overflow-hidden ">
        {file ? (
          <div className="border max-w-25 min-h-25">
            <img
              src={URL.createObjectURL(file)}
              alt={file.name}
              className="w-25 h-25 object-cover"
            />
          </div>
        ) : (
          <FaPlus className="text-3xl text-black " />
        )}
      </div>
    </div>
  );
};

export default FileItem;
