"use client";

import { Post, Tag } from "@/types/post";
import { useCallback, useEffect, useRef, useState } from "react";
import { IoSettingsOutline, IoAdd } from "react-icons/io5";
import FollowButton from "../post/FollowButton";
import ProfileFeedComponent from "./ProfileFeedLayout";
import { updateDoc, doc } from "firebase/firestore";
import { dbService, storageService } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { validateNickname, validateBio } from "@/lib/validations";
const ProfileLayout = ({
  isMyPage,
  tags = [],
  userData,
  posts,
}: {
  isMyPage: boolean;
  tags?: Tag[];
  userData: {
    uid: string;
    nickname?: string;
    profileImageUrl?: string;
    bio?: string;
    likes?: number;
    shares?: number;
  };
  posts: Post[];
}) => {
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const [editNickname, setEditNickname] = useState(userData.nickname ?? "");
  const [editBio, setEditBio] = useState(userData.bio ?? "");
  const [previewImage, setPreviewImage] = useState(
    userData.profileImageUrl ?? ""
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [nicknameError, setNicknameError] = useState("");
  const [bioError, setBioError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editImageOnlyOpen, setEditImageOnlyOpen] = useState(false); // ✅ 프로필 사진 전용

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async () => {
    const nicknameValidation = validateNickname(editNickname);
    const bioValidation = validateBio(editBio);

    if (nicknameValidation) {
      setNicknameError(nicknameValidation);
      return;
    }

    if (bioValidation) {
      setBioError(bioValidation);
      return;
    }

    let imageUrl = previewImage;
    if (imageFile) {
      const storageRef = ref(storageService, `profile/${userData.uid}`);
      await uploadBytes(storageRef, imageFile);
      const newUrl = await getDownloadURL(storageRef);
      imageUrl = newUrl;
      setPreviewImage(newUrl); // 🔥 업데이트된 URL로 UI 갱신
    }

    try {
      await updateDoc(doc(dbService, "users", userData.uid), {
        nickname: editNickname,
        bio: editBio,
        profileImageUrl: imageUrl,
      });
      alert("프로필이 수정되었습니다.");
      setEditOpen(false);
      location.reload();
    } catch (err) {
      alert("수정에 실패했습니다.");
      console.error(err);
    }
  };

  const actualPostCount = posts.filter((post) => post.id !== "default").length;

  const getRandomColor = useCallback(() => {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r}, ${g}, ${b})`;
  }, []);

  const firstPost = posts[0] ?? null;

  // ✅ 예시: username.uid를 어떻게 가져오는가?
  const username = userData.nickname; // 예: 'skyblue123'
  const userUid = userData.uid; // 예: 'ABC123XYZ'

  // FollowButton 등에 이렇게 넘기면 됨
  // followNickName={username}
  // followingId={userUid}

  return (
    <div className="flex flex-col w-full h-screen">
      {!isSmallScreen ? (
        <div className="flex flex-col mx-auto">
          <div className="flex m-5 mb-0 pr-20 pl-20 gap-2.5 justify-center ">
            <div className="relative w-40 h-40">
              <img
                src={firstPost?.userProfileImage || defaultImgUrl}
                alt={`${userData.nickname}'s profile`}
                className="w-full h-full rounded-full  sm:x-auto  transition-all duration-500 ease-in-out transform hover:scale-[1.02] cursor-pointer"
              />
              {isMyPage && (
                <button
                  onClick={() => setEditOpen(true)} // ✅ 추가됨
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-sm font-medium rounded-full opacity-0 hover:opacity-70 transition-opacity"
                >
                  수정하기
                </button>
              )}
            </div>
            <div className="ml-10 w-120 flex-col flex flex-1 ">
              <div className="flex justify-between">
                <h1 className="font-medium text-4xl p-1 hover:scale-103 hover:animate-pulse transition-all relative inline-block cursor-pointer after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-current after:transition-width after:duration-300 hover:after:w-full">
                  {userData.nickname || `없는 유저asd입니다.`}
                </h1>
                {isMyPage ? (
                  <button
                    onClick={() => setEditOpen(true)} // ✅ 추가됨
                    className="text-2xl hover:animate-spin hover:scale-105 cursor-pointer p-2.5 active:text-gray-800 hover:text-gray-400 dark:active:text-gray-100"
                  >
                    <IoSettingsOutline />
                  </button>
                ) : (
                  <div>
                    <FollowButton
                      followNickName={userData.nickname ?? "unknown"}
                      followingId={userData.uid}
                    />
                  </div>
                )}
              </div>
              <div className="flex ml-2.5 gap-5 ">
                <div className="flex gap-2.5 p-2.5 hover:scale-103 hover:animate-pulse transition-all cursor-pointer active:text-gray-800 ">
                  게시물 <span>{actualPostCount}</span>
                </div>
                <div className="flex gap-2.5 p-2.5 hover:scale-103 hover:animate-pulse transition-all cursor-pointer active:text-gray-800 ">
                  구독수 <span>{firstPost?.shares?.length || 0}</span>
                </div>
              </div>
              <div>{userData.bio}</div>
            </div>
          </div>
          <div className="flex text-2xl p-2.5 ml-30 mr-30">
            <ul className="flex gap-2.5 ">
              {tags.map((tag) => (
                <li key={tag.id}>
                  <button
                    style={{ color: getRandomColor() }}
                    className="p-2.5 hover:animate-pulse transition-all relative inline-block cursor-pointer after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-current after:transition-width after:duration-300 hover:after:w-full"
                  >
                    #{tag.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-screen mx-auto">
          <div className="flex justify-center mt-5">
            <div className="relative w-32 h-32 ">
              <img
                src={firstPost?.userProfileImage || defaultImgUrl}
                alt={`${userData.nickname || "유저"}'s profile`}
                className=" transition-all duration-500 ease-in-out transform hover:scale-[1.02] w-full h-full rounded-full sm:x-auto cursor-pointer"
              />
              {isMyPage && (
                <button className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-sm font-medium rounded-full opacity-0 hover:opacity-70 transition-opacity">
                  수정하기
                </button>
              )}
            </div>
            {isMyPage ? (
              <button className="text-2xl absolute right-30 sm:right-50 hover:animate-spin hover:scale-105 cursor-pointer p-2.5 active:text-gray-800 hover:text-gray-400  dark:active:text-gray-100">
                <IoSettingsOutline />
              </button>
            ) : (
              <div className="absolute right-15 sm:right-40 hover:scale-105 cursor-pointer p-2.5 active:text-gray-800 hover:text-gray-400">
                <FollowButton
                  followNickName={userData.nickname ?? "unknown"}
                  followingId={userData.uid}
                />
              </div>
            )}
          </div>
          <div className="flex flex-col justify-center items-center">
            <h1 className="font-medium text-2xl p-1 hover:scale-103 hover:animate-pulse transition-all relative inline-block cursor-pointer after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-current after:transition-width after:duration-300 hover:after:w-full">
              {userData.nickname || `없는 유123저입니다.`}
            </h1>
            <div className="flex flex-1 justify-center mx-auto">
              <div className="flex gap-5 ">
                <div className="flex gap-2.5 p-2.5 hover:scale-103 hover:animate-pulse transition-all cursor-pointer active:text-gray-800 ">
                  게시물 <span>{actualPostCount}</span>
                </div>
                <div className="flex gap-2.5 p-2.5 hover:scale-103 hover:animate-pulse transition-all cursor-pointer active:text-gray-800 ">
                  구독수 <span>{firstPost?.shares?.length || 0}</span>
                </div>
              </div>
            </div>
            <div>
              <ul className="flex gap-2.5 ">
                {tags.map((tag) => (
                  <li key={tag.id}>
                    <button
                      style={{ color: getRandomColor() }}
                      className="p-2.5 hover:animate-pulse transition-all relative inline-block cursor-pointer after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-current after:transition-width after:duration-300 hover:after:w-full"
                    >
                      #{tag.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col -mb-100 items-center justify-center">
        {posts?.filter((post) => post.id !== "default").length > 0 ? (
          <ProfileFeedComponent
            posts={posts}
            isMyPage={isMyPage}
            uid={userUid}
          />
        ) : (
          <div className="flex pt-10 w-full justify-center">
            <div className="text-gray-800 text-xl mt-30 animate-bounce dark:text-gray-200">
              게시물이 없습니다
            </div>
          </div>
        )}
      </div>
      {editOpen && (
        <div className="fixed inset-0  bg-opacity-50 z-50 flex justify-center items-center ">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">프로필 수정</h2>

            <label className="block mb-2">닉네임</label>
            <input
              value={editNickname}
              onChange={(e) => {
                setEditNickname(e.target.value);
                setNicknameError("");
              }}
              className="w-full p-2 border rounded mb-1"
            />
            {nicknameError && (
              <p className="text-red-500 text-sm mb-2">{nicknameError}</p>
            )}

            <label className="block mb-2">소개글</label>
            <textarea
              value={editBio}
              onChange={(e) => {
                setEditBio(e.target.value);
                setBioError("");
              }}
              className="w-full p-2 border rounded mb-1"
            />
            {bioError && (
              <p className="text-red-500 text-sm mb-2">{bioError}</p>
            )}

            <div className="flex flex-col gap-y-7 mb-4">
              <input type="text" placeholder="프로필추가" disabled />
              <button
                type="button"
                onClick={triggerFileSelect}
                className="border w-24 h-24 flex justify-center items-center text-5xl rounded cursor-pointer"
              >
                <IoAdd />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              {previewImage && (
                <img
                  src={previewImage}
                  alt="preview"
                  className="mt-2 w-32 h-32 object-cover border rounded"
                />
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                취소
              </button>
              <button
                onClick={handleSaveProfile}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileLayout;

const defaultImgUrl =
  "https://i.pinimg.com/1200x/3e/c0/d4/3ec0d48e3332288604e8d48096296f3e.jpg";
