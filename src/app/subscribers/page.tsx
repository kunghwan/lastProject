"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService, dbService } from "@/lib/firebase";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  DocumentData,
} from "firebase/firestore";
import Loaiding from "@/components/Loading";
import FollowButton from "@/components/post/FollowButton";

interface FollowerInfo {
  uid: string;
  nickname?: string;
  profileImageUrl?: string;
}

export default function SubscribersPage() {
  const [followers, setFollowers] = useState<FollowerInfo[]>([]);
  const [following, setFollowing] = useState<FollowerInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchFollowData = async () => {
      const user = authService.currentUser;
      if (!user) return;

      const allUsersSnap = await getDocs(collection(dbService, "users"));

      const followerTasks = allUsersSnap.docs
        .filter((doc) => doc.id !== user.uid)
        .map(async (userDoc) => {
          const targetUid = userDoc.id;
          const followerRef = doc(
            dbService,
            "users",
            targetUid,
            "followers",
            user.uid
          );
          const snap = await getDoc(followerRef);
          if (snap.exists()) {
            const data = userDoc.data() as DocumentData;
            return {
              uid: targetUid,
              nickname: data.nickname ?? "닉네임 없음",
              profileImageUrl: data.profileImageUrl ?? "",
            };
          }
          return null;
        });

      const followingSnap = await getDocs(
        collection(dbService, "users", user.uid, "following")
      );

      const followingTasks = followingSnap.docs.map(async (docSnap) => {
        const data = docSnap.data();
        const targetUid = data.uid || data.followingId;
        const targetDoc = await getDoc(doc(dbService, "users", targetUid));
        if (targetDoc.exists()) {
          const userData = targetDoc.data() as DocumentData;
          return {
            uid: targetUid,
            nickname: userData.nickname ?? "닉네임 없음",
            profileImageUrl: userData.profileImageUrl ?? "",
          };
        }
        return null;
      });

      const [followerResults, followingResults] = await Promise.all([
        Promise.all(followerTasks),
        Promise.all(followingTasks),
      ]);

      setFollowers(followerResults.filter(Boolean) as FollowerInfo[]);
      setFollowing(followingResults.filter(Boolean) as FollowerInfo[]);
      setLoading(false);
    };

    fetchFollowData();
  }, []);

  const handleClickProfile = (uid: string, nickname?: string) => {
    const current = authService.currentUser;
    if (!current) return;
    if (uid === current.uid) {
      router.push("/profile/me");
    } else {
      router.push(`/profile/${encodeURIComponent(nickname || uid)}`);
    }
  };

  if (loading)
    return (
      <div className="p-4">
        <Loaiding message="구독자를 찾고 있습니다..." />
      </div>
    );

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">👥 구독 정보</h1>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-2">
          📥 나를 구독한 유저 ({followers.length})
        </h2>
        {followers.length === 0 ? (
          <p className="text-gray-500">아직 나를 팔로우한 유저가 없습니다.</p>
        ) : (
          <ul className="space-y-3">
            {followers.map((f) => (
              <li
                key={f.uid}
                className="flex items-center justify-between gap-3"
              >
                <div
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => handleClickProfile(f.uid, f.nickname)}
                >
                  <img
                    src={f.profileImageUrl || "/image/logo1.png"}
                    className="w-8 h-8 rounded-full"
                    alt="profile"
                  />
                  <span>{f.nickname}</span>
                </div>
                <FollowButton followingId={f.uid} followNickName={f.nickname} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">
          📤 내가 구독한 유저 ({following.length})
        </h2>
        {following.length === 0 ? (
          <p className="text-gray-500">아직 팔로우한 유저가 없습니다.</p>
        ) : (
          <ul className="space-y-3">
            {following.map((f) => (
              <li
                key={f.uid}
                className="flex items-center justify-between gap-3"
              >
                <div
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => handleClickProfile(f.uid, f.nickname)}
                >
                  <img
                    src={f.profileImageUrl || "/image/logo1.png"}
                    className="w-8 h-8 rounded-full"
                    alt="profile"
                  />
                  <span>{f.nickname}</span>
                </div>
                <FollowButton followingId={f.uid} followNickName={f.nickname} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
