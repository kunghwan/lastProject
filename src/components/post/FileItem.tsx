"use client";
import React, { useState } from "react";
import { FaPlus } from "react-icons/fa6";
import { RiDeleteBin5Fill } from "react-icons/ri";
import { ImFilePicture } from "react-icons/im";
import Image from "next/image";
import { useAlertModal } from "../AlertStore";

interface FileItemProps {
  file?: File;
  onChangeFiles?: (props: FileList) => void;
  onDeleteFiles?: () => void;
}
const FileItem = ({ file, onChangeFiles, onDeleteFiles }: FileItemProps) => {
  const { openAlert } = useAlertModal();

  return (
    <div className="hsecol gap-y-1  hover:text-gray-200  group cursor-pointer  shadow-md  ">
      <div className=" relative  w-24 h-24  ">
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
              openAlert(
                "삭제하시겠습니까?",
                [
                  {
                    text: "확인",
                    isGreen: true,
                    autoFocus: true,
                    onClick: () => {
                      return onDeleteFiles && onDeleteFiles();
                    },
                  },
                  {
                    text: "취소",
                    isGreen: false,
                    autoFocus: false,
                  },
                ],
                "알림"
              );
              return;

              // if (confirm("삭제하시겠습니까?")) {
              //   return onDeleteFiles && onDeleteFiles();
              // }
              // setAlertMessage("취소했습니다.");
            }}
            className=" absolute border rounded-2xl text-xl bg-white z-20 w-24 h-24 opacity-0 hover:opacity-80 flex justify-center items-center cursor-pointer pointer-events-auto"
          >
            <RiDeleteBin5Fill className="text-green-900" />
          </button>
        )}

        <div className="absolute top-0 left-0 w-full h-full border border-gray-400 rounded-2xl bg-white dark:bg-[#666666]  cursor-pointer  flex justify-center items-center overflow-hidden ">
          {file ? (
            <div className="border max-w-24 min-h-24 ">
              <Image
                src={URL.createObjectURL(file)}
                alt={file.name}
                className=" object-cover"
                width={96}
                height={96}
              />
            </div>
          ) : (
            <div className="flex gap-x-1 items-center  group-hover:text-gray-100  transition-colors">
              <ImFilePicture className="text-3xl dark:text-gray-300 dark:group-hover:text-white " />
              <FaPlus className="text-md text-black dark:text-gray-300 dark:group-hover:text-white" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileItem;
