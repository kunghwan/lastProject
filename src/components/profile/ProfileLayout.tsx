"use client";

import { Post, Tag } from "@/types/post";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { IoSettingsOutline, IoAdd } from "react-icons/io5";
import FollowButton from "../post/FollowButton";
import { updateDoc, doc, onSnapshot, collection } from "firebase/firestore";
import { dbService, FBCollection, storageService } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { validateNickname, validateBio } from "@/lib/validations";
import ProfileFeedComponent from "./ProfileFeedLayout";
import { useAlertModal } from "../AlertStore";

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
  const [followerCount, setFollowerCount] = useState(0);
  const [modal, setModal] = useState<{
    message: string;
    onConfirm?: () => void;
  } | null>(null);
  const [editPreviewImage, setEditPreviewImage] = useState(
    userData.profileImageUrl ?? ""
  ); // ✅ 모달용

  const handleResize = useCallback(() => {
    setIsSmallScreen(window.innerWidth < 1024);
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  const triggerFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleImageSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setImageFile(file);
        setEditPreviewImage(URL.createObjectURL(file)); // ✅ 바깥은 그대로, 미리보기만 갱신
      }
    },
    []
  );

  const handleSaveProfile = useCallback(async () => {
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
      setPreviewImage(newUrl);
      setEditPreviewImage(newUrl);
    }

    try {
      await updateDoc(doc(dbService, "users", userData.uid), {
        nickname: editNickname,
        bio: editBio,
        profileImageUrl: imageUrl,
      });

      openAlert(
        "프로필이 수정되었습니다.",
        [
          {
            text: "확인",
            isGreen: true,
            onClick: () => {
              setEditOpen(false);
              location.reload();
            },
          },
        ],
        "완료"
      );
    } catch (err) {
      openAlert(
        "수정에 실패했습니다.\n다시 시도해주세요.",
        [{ text: "닫기" }],
        "오류"
      );
      console.error(err);
    }
  }, [
    editNickname,
    editBio,
    imageFile,
    previewImage,
    userData.uid,
    setEditOpen,
    setPreviewImage,
    setEditPreviewImage,
  ]);

  const actualPostCount = useMemo(
    () => posts.filter((post) => post.id !== "default").length,
    [posts]
  );

  const tagColors = useMemo(() => {
    return tags.reduce((acc, tag) => {
      acc[tag.id] = `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(
        Math.random() * 256
      )}, ${Math.floor(Math.random() * 256)})`;
      return acc;
    }, {} as Record<string, string>);
  }, [tags]);

  const firstPost = useMemo(() => posts[0] ?? null, [posts]);

  useEffect(() => {
    if (!userData?.uid) return;
    const followersRef = collection(
      dbService,
      FBCollection.USERS,
      userData.uid,
      FBCollection.FOLLOWERS
    );

    const unsubscribe = onSnapshot(followersRef, (snapshot) => {
      const followerSize = snapshot.size;
      setFollowerCount((prev) => (prev !== followerSize ? followerSize : prev));
    });

    return () => unsubscribe();
  }, [userData?.uid]);
  const { openAlert } = useAlertModal();

  return (
    <div className="flex flex-col w-full ">
      {!isSmallScreen ? (
        <div className="flex flex-col mx-auto ">
          <div className="flex m-5 mb-0 pr-20 pb-5 pl-20 gap-2.5 justify-center ">
            <div className="relative w-40 h-40 ">
              <img
                src={previewImage || defaultImgUrl}
                alt={`${userData.nickname}'s profile`}
                className="w-full h-full rounded-full  sm:x-auto  transition-all duration-500 border border-gray-200 ease-in-out transform hover:scale-[1.02] cursor-pointer"
              />
              {isMyPage ? (
                <button
                  onClick={() => setEditOpen(true)}
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-sm font-medium rounded-full opacity-0 hover:opacity-70 transition-opacity"
                >
                  수정하기
                </button>
              ) : (
                <button
                  onClick={() => {
                    openAlert(
                      `${userData.nickname}님의 프로필 링크를 복사하시겠습니까?`,
                      [
                        {
                          text: "취소",
                          isGreen: false,
                        },
                        {
                          text: "복사",
                          isGreen: true,
                          onClick: async () => {
                            const url = `${
                              window.location.origin
                            }/profile/${encodeURIComponent(
                              userData.nickname ?? ""
                            )}`;
                            await navigator.clipboard.writeText(url);
                            openAlert("📋 프로필 링크가 복사되었습니다!");
                          },
                        },
                      ]
                    );
                  }}
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-sm font-medium rounded-full opacity-0 hover:opacity-70 transition-opacity"
                >
                  공유하기
                </button>
              )}
            </div>
            <div className="ml-10 w-120 flex-col flex flex-1 ">
              <div className="flex justify-between">
                <h1 className="font-medium text-4xl p-1 hover:scale-103 hover:animate-pulse transition-all relative inline-block cursor-pointer after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-current after:transition-width after:duration-300 hover:after:w-full">
                  {userData.nickname || `없는 유저입니다.`}
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
                  구독수 <span>{followerCount}</span>
                </div>
              </div>
              <div className="h-full line-clamp-3 break-words">
                {userData.bio}
              </div>
            </div>
          </div>
          <div className="flex text-2xl p-2.5 ml-30 mr-30">
            <ul className="flex gap-2.5 ">
              {tags.map((tag) => (
                <li key={tag.id}>
                  <button
                    style={{ color: tagColors[tag.id] }}
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
                src={previewImage || defaultImgUrl}
                alt={`${userData.nickname}'s profile`}
                className=" transition-all duration-500 ease-in-out transform hover:scale-[1.02] w-full h-full rounded-full border border-gray-200 sm:x-auto cursor-pointer "
              />
              {isMyPage && (
                <button
                  onClick={() => setEditOpen(true)}
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-sm font-medium rounded-full opacity-0 hover:opacity-70 transition-opacity"
                >
                  수정하기
                </button>
              )}
            </div>
            {isMyPage ? (
              <button
                onClick={() => setEditOpen(true)}
                className="text-2xl absolute right-20 sm:right-50 hover:animate-spin hover:scale-105 cursor-pointer p-2.5 active:text-gray-800 hover:text-gray-400  dark:active:text-gray-100"
              >
                <IoSettingsOutline />
              </button>
            ) : (
              <div className="absolute right-10 sm:right-30 hover:scale-105 cursor-pointer p-2.5 active:text-gray-800 hover:text-gray-400">
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
                  구독수 <span>{followerCount}</span>
                </div>
              </div>
            </div>
            <div>
              <ul className="flex gap-2.5 ">
                {tags.map((tag) => (
                  <li key={tag.id}>
                    <button
                      style={{ color: tagColors[tag.id] }}
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
      <div className="flex flex-col items-center justify-center">
        {posts?.filter((post) => post.id !== "default").length > 0 ? (
          <ProfileFeedComponent
            posts={posts}
            isMyPage={isMyPage}
            uid={userData.uid}
          />
        ) : (
          <div className="flex flex-col border-t-2 border-emerald-200 w-full mx-auto items-center">
            <div className="pt-20 text-gray-800 text-xl animate-bounce dark:text-gray-200">
              게시물이 없습니다
            </div>
          </div>
        )}
      </div>
      {editOpen && (
        <div className="fixed inset-0  bg-opacity-50 z-60 flex justify-center items-center ">
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

              {editPreviewImage && (
                <img
                  src={editPreviewImage}
                  alt="preview"
                  className="mt-2 w-32 h-32 object-cover border rounded"
                />
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded dark:bg-gray-500"
              >
                취소
              </button>
              <button
                onClick={handleSaveProfile}
                className="px-4 py-2 bg-emerald-300 text-white rounded dark:bg-emerald-500"
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
