"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { IoAdd } from "react-icons/io5";
import { storageService, dbService, FBCollection } from "@/lib/firebase";
import { AUTH } from "@/contextapi/context";
import LoadingPage from "@/components/Loading"; // 로딩 컴포넌트

const SettingProfile = () => {
  const [profile, setProfile] = useState<
    Pick<User, "nickname" | "profileImageUrl" | "bio">
  >({
    nickname: "",
    profileImageUrl: "",
    bio: "",
  });
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [bioError, setBioError] = useState<string | null>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { signin } = AUTH.use();

  const validateNickname = (nickname: string) => {
    if (!nickname) return "닉네임을 입력해주세요";
    if (!/^[a-zA-Z0-9]+$/.test(nickname)) return "한글은 입력 안됩니다";
    if (nickname.length >= 18)
      return "닉네임은 18글자 미만으로만 입력가능합니다";
    return null;
  };

  const validateBio = (bio: string) => {
    if (bio.length > 100) return "소개글은 100자 이하로 입력해주세요";
    return null;
  };

  useEffect(() => {
    const signupUser = sessionStorage.getItem("signupUser");
    const baseUser = signupUser ? JSON.parse(signupUser) : null;

    if (!baseUser?.uid) {
      alert("회원가입 절차가 누락되었습니다. 다시 진행해주세요.");
      router.push("/signup");
    }
  }, [router]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;

      setProfile((prev) => ({
        ...prev,
        [name]: value,
      }));

      if (name === "nickname") {
        setNicknameError(validateNickname(value));
      }

      if (name === "bio") {
        setBioError(validateBio(value));
      }
    },
    [] // 🚨 주의: 이건 validateNickname, validateBio가 바깥에 있고 불변이니까 의존성 없이 가능
  );

  const handleImageSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const previewUrl = URL.createObjectURL(file);
        setProfile((prev) => ({
          ...prev,
          profileImageUrl: previewUrl,
        }));
        setImageFile(file);
      }
    },
    []
  );

  const triggerFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!profile.nickname?.trim()) {
      alert("닉네임을 입력하세요");
      return;
    }
    if (nicknameError || bioError) {
      alert("입력값을 다시 확인해주세요.");
      return;
    }

    setLoading(true);
    try {
      const signupUser = sessionStorage.getItem("signupUser");
      if (!signupUser) {
        alert("회원가입 정보가 없습니다.");
        return;
      }

      const baseUser = JSON.parse(signupUser);

      if (!baseUser.uid) {
        alert("회원 ID가 없습니다. 다시 회원가입을 진행해주세요.");
        return;
      }

      let uploadedUrl = profile.profileImageUrl;

      if (imageFile) {
        const imageRef = storageService
          .ref()
          .child(`profileImages/${Date.now()}_${imageFile.name}`);
        await imageRef.put(imageFile);
        uploadedUrl = await imageRef.getDownloadURL();
      }

      const fullUser: User = {
        ...baseUser,
        nickname: profile.nickname,
        profileImageUrl: uploadedUrl,
        bio: profile.bio,
      };

      await dbService
        .collection(FBCollection.USERS)
        .doc(fullUser.uid)
        .set(fullUser);

      const result = await signin(baseUser.email, baseUser.password);
      if (!result.success) {
        alert("로그인에 실패했습니다: " + result.message);
        return;
      }

      alert("회원가입이 완료되었습니다!");
      sessionStorage.removeItem("signupUser");
      router.push("/");
    } catch (err) {
      console.error("가입 오류:", err);
      alert("회원가입 중 문제가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [profile, nicknameError, bioError, imageFile, router, signin]);

  return (
    <>
      {loading && <LoadingPage />}
      <div className="flex flex-col gap-y-4 p-4 lg:mx-auto lg:w-130 md:w-130 md:mx-auto sm:w-130 sm:mx-auto ">
        {/* 닉네임 입력 */}
        <div className="relative">
          <input
            type="text"
            name="nickname"
            value={profile.nickname}
            onChange={handleChange}
            placeholder="유저이름"
            className={`${settingProfile} ${
              nicknameError ? "border-red-500" : ""
            }`}
          />
          {nicknameError && (
            <div className="absolute text-red-500 text-xs mt-1">
              {nicknameError}
            </div>
          )}
        </div>

        {/* 프로필 추가 */}
        <div className="flex flex-col gap-y-5">
          <input
            type="text"
            placeholder="프로필추가"
            className={settingProfile}
            disabled
          />
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
          {profile.profileImageUrl && (
            <img
              src={profile.profileImageUrl}
              alt="preview"
              className="mt-2 w-32 h-32 object-cover border rounded"
            />
          )}
        </div>

        {/* 소개글 입력 */}
        <div className="relative">
          <textarea
            name="bio"
            value={profile.bio}
            onChange={handleChange}
            placeholder="자기소개를 작성해주세요"
            className="border w-full h-32 p-3 resize-none mt-5"
          />
          {bioError && (
            <div className="absolute text-red-500 text-xs mt-1">{bioError}</div>
          )}
        </div>

        {/* 가입 완료 버튼 */}
        <button
          onClick={handleSubmit}
          className="p-4 bg-emerald-300 rounded font-bold mt-5"
        >
          가입 완료
        </button>
      </div>
    </>
  );
};

export default SettingProfile;

const settingProfile = "bg-lime-300 p-3 rounded w-110 sm:w-122 mt-5 ";
