"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { authService } from "@/lib/firebase";
import { getFollowers, getFollowing } from "@/lib/user";

export default function SubscriptionsPage() {
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(authService, async (user) => {
      if (user) {
        const [f1, f2] = await Promise.all([
          getFollowers(user.uid),
          getFollowing(user.uid),
        ]);
        setFollowers(f1);
        setFollowing(f2);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div className="p-6">로딩 중...</div>;

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">나의 구독 정보</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          📥 나를 구독한 유저 ({followers.length})
        </h2>
        <ul className="bg-white dark:bg-gray-800 rounded shadow divide-y">
          {followers.map((f) => (
            <li key={f.uid} className="px-4 py-2">
              {f.nickname || "닉네임 없음"}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">
          📤 내가 구독한 유저 ({following.length})
        </h2>
        <ul className="bg-white dark:bg-gray-800 rounded shadow divide-y">
          {following.map((f) => (
            <li key={f.uid} className="px-4 py-2">
              {f.nickname || "닉네임 없음"}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
