"use client";
import React, { useState } from "react";
import { FaPlus } from "react-icons/fa6";
import { RiDeleteBin5Fill } from "react-icons/ri";
import { ImFilePicture } from "react-icons/im";
import AlertModal from "../AlertModal";
import Image from "next/image";

interface FileItemProps {
  file?: File;
  onChangeFiles?: (props: FileList) => void;
  onDeleteFiles?: () => void;
}
const FileItem = ({ file, onChangeFiles, onDeleteFiles }: FileItemProps) => {
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  return (
    <div className="hsecol gap-y-1 hover:text-gray-400 cursor-pointer">
      {alertMessage && (
        <AlertModal
          message={alertMessage}
          onClose={() => setAlertMessage(null)}
        />
      )}
      <div className=" relative  w-24 h-24">
        {!file ? (
          <input
            id="imgs"
            accept="image/*,.gif" // 이미지 파일과 움짤만 허용(비디오는 ㄴㄴ)
            type="file"
            onChange={(e) => {
              if (onChangeFiles && e.target.files) {
                onChangeFiles(e.target.files);
              }
            }}
            multiple
            className=" border max-w-24 min-h-24 border-gray-500  relative  opacity-0 cursor-pointer z-10"
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              if (confirm("삭제하시겠습니까?")) {
                return onDeleteFiles && onDeleteFiles();
              }
              setAlertMessage("취소했습니다.");
            }}
            className=" absolute border rounded-2xl text-xl bg-white z-20 w-24 h-24 opacity-0 hover:opacity-80 flex justify-center items-center cursor-pointer"
          >
            <RiDeleteBin5Fill />
          </button>
        )}

        <div className="absolute top-0 left-0  w-full h-full border border-gray-400 rounded-2xl bg-white cursor-pointer  flex justify-center items-center overflow-hidden ">
          {file ? (
            <div className="border max-w-24 min-h-24">
              <Image
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="w-24 h-24 object-cover"
              />
            </div>
          ) : (
            <div className="flex gap-x-1 items-center ">
              <ImFilePicture className="text-3xl " />
              <FaPlus className="text-md text-black  " />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileItem;
