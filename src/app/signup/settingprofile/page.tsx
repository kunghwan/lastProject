"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IoAdd } from "react-icons/io5";
import {
  storageService,
  dbService,
  authService,
  FBCollection,
} from "@/lib/firebase";
import { AUTH } from "@/contextapi/context"; // ✅ context import

const SettingProfile = () => {
  const [profile, setProfile] = useState<
    Pick<User, "nickname" | "profileImageUrl" | "bio">
  >({
    nickname: "",
    profileImageUrl: "",
    bio: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { signin } = AUTH.use(); // ✅ signin 함수 사용

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    const signupUser = sessionStorage.getItem("signupUser");
    const baseUser = signupUser ? JSON.parse(signupUser) : null;

    if (!baseUser?.uid) {
      alert("회원가입 절차가 누락되었습니다. 다시 진행해주세요.");
      router.push("/signup");
    }
  }, [router]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setProfile((prev) => ({
        ...prev,
        profileImageUrl: previewUrl,
      }));
      setImageFile(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async () => {
    if (!profile.nickname?.trim()) {
      alert("닉네임을 입력하세요");
      return;
    }

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

      // ✅ context에 로그인 상태까지 적용
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
    }
  };

  return (
    <div className="flex flex-col gap-y-4 p-4">
      <input
        type="text"
        name="nickname"
        value={profile.nickname}
        onChange={handleChange}
        placeholder="유저이름"
        className={settingProfile}
      />

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

      <textarea
        name="bio"
        value={profile.bio}
        onChange={handleChange}
        placeholder="자기소개를 작성해주세요"
        className="border w-full h-32 p-3 resize-none"
      />

      <button
        onClick={handleSubmit}
        className="p-4 bg-emerald-300 rounded font-bold"
      >
        가입 완료
      </button>
    </div>
  );
};

export default SettingProfile;

const settingProfile = "bg-lime-300 p-3 rounded";
