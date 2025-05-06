"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { IoAdd } from "react-icons/io5";
import { storageService, dbService, FBCollection } from "@/lib/firebase";
import { AUTH } from "@/contextapi/context";
import LoadingPage from "@/components/Loading";
import AlertModal from "@/components/AlertModal";

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
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const nicknameRef = useRef<HTMLInputElement>(null);
  const imageButtonRef = useRef<HTMLButtonElement>(null);
  const bioRef = useRef<HTMLTextAreaElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const router = useRouter();
  const { signin } = AUTH.use();
  const closeAlert = () => setAlertMsg("");

  useEffect(() => {
    nicknameRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (document.activeElement === nicknameRef.current) {
        setTimeout(() => setShowConfirmModal(true), 0);
      } else if (document.activeElement === imageButtonRef.current) {
        setShowConfirmModal(true);
      } else if (document.activeElement === bioRef.current) {
        submitButtonRef.current?.click();
      }
    }
  };

  const validateNickname = async (nickname: string) => {
    if (!nickname) return "닉네임을 입력해주세요";
    if (/[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(nickname)) return "한글은 입력할 수 없습니다";
    if (nickname.length >= 18)
      return "닉네임은 18글자 미만으로만 입력가능합니다";

    const snapshot = await dbService
      .collection(FBCollection.USERS)
      .where("nickname", "==", nickname)
      .get();
    if (!snapshot.empty) return "닉네임이 중복됩니다";

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
      setAlertMsg("회원가입 절차가 누락되었습니다. 다시 진행해주세요.");
      router.push("/signup");
    }
  }, [router]);

  const handleChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setProfile((prev) => ({ ...prev, [name]: value }));
      if (name === "nickname") setNicknameError(await validateNickname(value));
      if (name === "bio") setBioError(validateBio(value));
    },
    []
  );

  const handleImageSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const previewUrl = URL.createObjectURL(file);
        setProfile((prev) => ({ ...prev, profileImageUrl: previewUrl }));
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
      setAlertMsg("닉네임을 입력하세요");
      return;
    }

    const nicknameDuplicationCheck = await validateNickname(profile.nickname);
    if (nicknameDuplicationCheck) {
      setNicknameError(nicknameDuplicationCheck);
      setAlertMsg("닉네임을 다시 확인해주세요.");
      return;
    }

    if (nicknameError || bioError) {
      setAlertMsg("닉네임과 소개글을 다시 확인해주세요.");
      return;
    }

    setLoading(true);
    try {
      const signupUser = sessionStorage.getItem("signupUser");
      const baseUser = signupUser ? JSON.parse(signupUser) : null;
      if (!baseUser?.uid) {
        setAlertMsg("회원가입 정보가 없습니다.");
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
        setAlertMsg("로그인에 실패했습니다: " + result.message);
        return;
      }

      setAlertMsg("회원가입이 완료되었습니다!");
      sessionStorage.removeItem("signupUser");
      router.push("/");
    } catch (err) {
      console.error("가입 오류:", err);
      setAlertMsg("회원가입 중 문제가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [profile, nicknameError, bioError, imageFile, router, signin]);

  return (
    <>
      {loading && <LoadingPage />}
      <div className="flex flex-col gap-y-4 p-4 lg:mx-auto lg:w-130 md:w-130 sm:w-130">
        <div className="relative">
          <input
            ref={nicknameRef}
            type="text"
            name="nickname"
            value={profile.nickname}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="유저이름"
            className={`${settingProfile} ${nicknameError ? "border-red-500" : ""}`}
          />
          {nicknameError && (
            <div className="absolute text-red-500 text-xs mt-1">
              {nicknameError}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-y-5">
          <input type="text" placeholder="프로필추가" disabled />
          <button
            ref={imageButtonRef}
            type="button"
            onClick={triggerFileSelect}
            onKeyDown={handleKeyDown}
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

        <div className="relative">
          <textarea
            ref={bioRef}
            name="bio"
            value={profile.bio}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="자기소개를 작성해주세요"
            className="border w-full h-20 p-3 resize-none mt-5"
          />
          {bioError && (
            <div className="absolute text-red-500 text-xs mt-1">{bioError}</div>
          )}
        </div>

        <button
          ref={submitButtonRef}
          onClick={handleSubmit}
          className="p-4 bg-emerald-300 rounded font-bold mt-5"
        >
          가입 완료
        </button>
      </div>

      {alertMsg && (
        <AlertModal
          message={alertMsg}
          onClose={() => {
            setAlertMsg("");
            if (alertMsg === "닉네임을 입력하세요")
              setTimeout(() => nicknameRef.current?.focus(), 0);
            if (alertMsg === "소개글을 입력하세요")
              setTimeout(() => bioRef.current?.focus(), 0);
          }}
        />
      )}

      {showConfirmModal && (
        <AlertModal
          message="프로필 이미지를 추가하시겠습니까?"
          showCancel
          onClose={() => {
            setShowConfirmModal(false);
            setTimeout(() => bioRef.current?.focus(), 0);
          }}
          onConfirm={() => {
            // ✅ 모달 먼저 닫고 렌더 완료 후 파일 열기
            setShowConfirmModal(false);
            setTimeout(() => {
              fileInputRef.current?.click();
              document.body.focus(); // 포커스 해제
            }, 100);
          }}
        />
      )}
    </>
  );
};

export default SettingProfile;

const settingProfile = "bg-lime-400 p-3 rounded w-110 sm:w-122 mt-5";
