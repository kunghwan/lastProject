"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { IoAdd } from "react-icons/io5";
import { storageService, dbService, FBCollection } from "@/lib/firebase";
import { AUTH } from "@/contextapi/context";
import LoadingPage from "@/components/Loading";
import { useAlertModal } from "@/components/AlertStore";
import AlertModal from "@/components/AlertModal";

const SettingProfile = () => {
  // 프로필 상태: 닉네임, 이미지 URL, 자기소개
  const [profile, setProfile] = useState<
    Pick<User, "nickname" | "profileImageUrl" | "bio">
  >({
    nickname: "",
    profileImageUrl: "",
    bio: "",
  });

  // 에러 상태들
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [bioError, setBioError] = useState<string | null>(null);

  const [imageFile, setImageFile] = useState<File | null>(null); // 업로드용 이미지 파일
  const [loading, setLoading] = useState(false); // 로딩 중 여부
  const [showConfirmModal, setShowConfirmModal] = useState(false); // 프로필 이미지 추가 여부 확인
  const [alertMsg, setAlertMsg] = useState(""); // 알림 메시지

  // input 요소들 참조
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nicknameRef = useRef<HTMLInputElement>(null);
  const imageButtonRef = useRef<HTMLButtonElement>(null);
  const bioRef = useRef<HTMLTextAreaElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const router = useRouter();
  const { signin } = AUTH.use(); // 로그인 함수

  const { openAlert } = useAlertModal();

  // 세션에서 작성 중이던 프로필 데이터 복원
  useEffect(() => {
    const savedDraft = sessionStorage.getItem("profileDraft");
    if (savedDraft) {
      const parsed = JSON.parse(savedDraft);
      setProfile(parsed);

      // 복원 후 유효성 검사
      if (parsed.nickname)
        validateNickname(parsed.nickname).then(setNicknameError);
      if (parsed.bio) setBioError(validateBio(parsed.bio));
    }
    nicknameRef.current?.focus(); // 최초 포커스
  }, []);

  // Enter 키로 다음 요소 이동
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (document.activeElement === nicknameRef.current) {
        openAlert("프로필 이미지를 추가하시겠습니까?", [
          {
            text: "아니오",
            onClick: () => setTimeout(() => bioRef.current?.focus(), 0),
          },
          {
            text: "예",
            isGreen: true,
            autoFocus: true,
            onClick: () => {
              setTimeout(() => {
                fileInputRef.current?.click();
                document.body.focus();
              }, 100);
            },
          },
        ]);
      } else if (document.activeElement === bioRef.current) {
        submitButtonRef.current?.click();
      }
    }
  };

  // 닉네임 유효성 검사
  const validateNickname = async (nickname: string) => {
    if (!nickname) return "닉네임을 입력해주세요";
    if (/[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(nickname)) return "한글은 입력할 수 없습니다";
    const isValid = /^[a-zA-Z0-9]+$/.test(nickname);
    if (!isValid) return "닉네임은 영어와 숫자만 사용할 수 있습니다";
    if (nickname.length >= 18)
      return "닉네임은 18글자 미만으로만 입력가능합니다";

    // Firebase에 중복 체크
    const snapshot = await dbService
      .collection(FBCollection.USERS)
      .where("nickname", "==", nickname)
      .get();
    if (!snapshot.empty) return "닉네임이 중복됩니다";

    return null;
  };

  // 소개글 유효성 검사
  const validateBio = (bio: string) => {
    if (bio.length > 100) return "소개글은 100자 이하로 입력해주세요";
    return null;
  };

  // uid 없으면 강제 리다이렉트
  useEffect(() => {
    const signupUser = sessionStorage.getItem("signupUser");
    const baseUser = signupUser ? JSON.parse(signupUser) : null;
    if (!baseUser?.uid) {
      openAlert("회원가입 절차가 누락되었습니다. 다시 진행해주세요.", [
        { text: "확인", isGreen: true, autoFocus: true },
      ]);
      router.push("/signup");
    }
  }, [router, openAlert]);

  // input 값 변경 시 상태 업데이트 및 유효성 검사
  const handleChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      const updated = { ...profile, [name]: value };
      setProfile(updated);
      sessionStorage.setItem("profileDraft", JSON.stringify(updated)); // 작성 중 저장

      if (name === "nickname") setNicknameError(await validateNickname(value));
      if (name === "bio") setBioError(validateBio(value));
    },
    [profile]
  );

  // 이미지 선택 시 미리보기 및 저장
  const handleImageSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const previewUrl = URL.createObjectURL(file); // 로컬 미리보기
        const updated = { ...profile, profileImageUrl: previewUrl };
        setProfile(updated);
        setImageFile(file);
        sessionStorage.setItem("profileDraft", JSON.stringify(updated));
      }
    },
    [profile]
  );

  // 이미지 선택창 열기
  const triggerFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // 가입 완료 처리
  const handleSubmit = useCallback(async () => {
    if (!profile.nickname?.trim()) {
      openAlert("닉네임을 입력하세요", [
        {
          text: "확인",
          isGreen: true,
          autoFocus: true,
          onClick: () => nicknameRef.current?.focus(),
        },
      ]);
      return;
    }

    // 닉네임 유효성 재확인
    const nicknameDuplicationCheck = await validateNickname(profile.nickname);
    if (nicknameDuplicationCheck) {
      setNicknameError(nicknameDuplicationCheck);
      openAlert("닉네임을 다시 확인해주세요.", [
        {
          text: "확인",
          isGreen: true,
          autoFocus: true,
          onClick: () => nicknameRef.current?.focus(),
        },
      ]);
      return;
    }

    if (nicknameError || bioError) {
      openAlert("닉네임과 소개글을 다시 확인해주세요.", [
        {
          text: "확인",
          isGreen: true,
          autoFocus: true,
          onClick: () => {
            if (nicknameError) nicknameRef.current?.focus();
            else if (bioError) bioRef.current?.focus();
          },
        },
      ]);
      return;
    }

    setLoading(true);
    try {
      const signupUser = sessionStorage.getItem("signupUser");
      const baseUser = signupUser ? JSON.parse(signupUser) : null;
      if (!baseUser?.uid) {
        openAlert("회원가입 정보가 없습니다.", [
          { text: "확인", isGreen: true },
        ]);
        return;
      }

      // 이미지 업로드 처리
      let uploadedUrl = profile.profileImageUrl;
      if (imageFile) {
        const imageRef = storageService
          .ref()
          .child(`profileImages/${Date.now()}_${imageFile.name}`);
        await imageRef.put(imageFile);
        uploadedUrl = await imageRef.getDownloadURL();
      }

      // 최종 유저 정보 구성
      const fullUser: User = {
        ...baseUser,
        nickname: profile.nickname,
        profileImageUrl: uploadedUrl,
        bio: profile.bio,
      };

      // Firestore에 저장
      await dbService
        .collection(FBCollection.USERS)
        .doc(fullUser.uid)
        .set(fullUser);

      // 로그인 시도
      const result = await signin(baseUser.email, baseUser.password);
      if (!result.success) {
        openAlert("로그인에 실패했습니다: " + result.message, [
          { text: "확인", isGreen: true },
        ]);
        return;
      }

      openAlert("회원가입이 완료되었습니다!", [
        {
          text: "확인",
          isGreen: true,
          autoFocus: true,
          onClick: () => router.push("/"),
        },
      ]);
      sessionStorage.removeItem("signupUser");
      sessionStorage.removeItem("profileDraft");
      router.push("/");
    } catch (err) {
      console.error("가입 오류:", err);
      openAlert("회원가입 중 문제가 발생했습니다.", [
        { text: "확인", isGreen: true },
      ]);
    } finally {
      setLoading(false);
    }
  }, [profile, nicknameError, bioError, imageFile, router, signin]);

  return (
    <>
      {loading && <LoadingPage />} {/* 로딩 화면 */}
      <div className="flex flex-col gap-y-2 p-4 lg:mx-auto lg:w-130 md:w-130 sm:w-130 overflow-auto min-h-screen">
        {/* 닉네임 입력 */}
        <div className="relative">
          <input
            ref={nicknameRef}
            type="text"
            name="nickname"
            value={profile.nickname}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
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

        {/* 프로필 이미지 업로드 */}
        <div className="flex flex-col gap-y-5 mt-5">
          <input
            type="text"
            placeholder="프로필추가"
            disabled
            className="placeholder:text-black dark:placeholder:text-white"
          />
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

        {/* 자기소개 */}
        <div className="relative">
          <textarea
            ref={bioRef}
            name="bio"
            value={profile.bio}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="자기소개를 작성해주세요"
            className="border outline-none w-full h-20 p-3 resize-none mt-5 placeholder:text-black dark:placeholder:text-white"
          />
          {bioError && (
            <div className="absolute text-red-500 text-xs mt-1">{bioError}</div>
          )}
        </div>

        {/* 가입 완료 버튼 */}
        <button
          ref={submitButtonRef}
          onClick={handleSubmit}
          className="p-4 bg-emerald-300 rounded font-bold mt-5 dark:bg-emerald-500  "
        >
          가입 완료
        </button>
      </div>
    </>
  );
};

export default SettingProfile;

// 닉네임 입력창 클래스
const settingProfile =
  "bg-primary p-3 rounded w-80 sm:w-122 mt-5 dark:bg-emerald-500 placeholder:text-black dark:placeholder:text-white outline-none";
