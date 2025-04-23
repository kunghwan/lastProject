import { redirect } from "next/navigation";

const ProfilePage = () => {
  redirect("/profile/me"); // /profile 경로를 /profile/me로 리다이렉트
};

export default ProfilePage;
