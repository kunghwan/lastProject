"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CgSpinner } from "react-icons/cg";

interface LoadingState {
  isLoading: boolean;
  message?: string;
}

const Loaiding = () => {
  const [loading, setLoading] = useState<LoadingState>({
    isLoading: false,
    message: "로딩중입니다...",
  });

  const pathname = usePathname();

  useEffect(() => {
    setLoading({ isLoading: true, message: "로딩중입니다" });

    const timeset = setTimeout(() => {
      setLoading({ isLoading: false });
    }, 500);

    return () => clearTimeout(timeset);
  }, [pathname]);

  if (!loading.isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-white/80 flex items-center justify-center flex-col">
      <CgSpinner className="animate-spin text-2xl mb-2" />
      <p className="text-3xl font-bold">{loading.message}</p>
    </div>
  );
};

export default Loaiding;
