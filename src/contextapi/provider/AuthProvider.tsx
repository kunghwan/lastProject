"use client";

import {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
} from "react";
import { authService, dbService, FBCollection } from "@/lib";
import { PropsWithChildren } from "react";
import { AUTH } from "../context";
import Loading from "@/components/Loading";

const ref = dbService.collection(FBCollection.USERS);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [isPending, setIsPending] = useState(true);

  const signin = useCallback(
    async (email: string, password: string): Promise<PromiseResult> => {
      try {
        // 1. Firestore users에서 email 존재 확인
        const snapshot = await ref.where("email", "==", email).limit(1).get();

        if (snapshot.empty) {
          return {
            success: false,
            message: "아이디가 일치하지 않습니다.",
            reason: "user-not-found",
          };
        }

        // 2. 이메일이 있으면 로그인 시도
        try {
          const userCredential = await authService.signInWithEmailAndPassword(
            email,
            password
          );
          const fbUser = userCredential.user;
          if (!fbUser)
            return {
              success: false,
              message: "유저 정보를 불러올 수 없습니다.",
              reason: "unknown-error",
            };

          const snap = await ref.doc(fbUser.uid).get();
          const data = snap.data() as User;
          if (!data)
            return {
              success: false,
              message: "Firestore 유저 정보 없음",
              reason: "unknown-error",
            };

          setUser(data);
          return { success: true };
        } catch (loginError: any) {
          console.error("❌ 로그인 실패:", loginError.message);
          return {
            success: false,
            message: "비밀번호가 틀렸습니다.",
            reason: "wrong-password",
          };
        }
      } catch (error: any) {
        console.error("❌ signin 오류:", error.message);
        return {
          success: false,
          message: "로그인 과정 오류",
          reason: "unknown-error",
        };
      }
    },
    [ref]
  );

  const signout = useCallback(async (): Promise<PromiseResult> => {
    try {
      await authService.signOut();
      setUser(null);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        reason: "unknown-error",
      };
    }
  }, []);

  const signup = useCallback(
    async (newUser: User, password: string): Promise<PromiseResult> => {
      try {
        const { user: fbUser } =
          await authService.createUserWithEmailAndPassword(
            newUser.email!,
            password
          );
        if (!fbUser)
          return {
            success: false,
            message: "유저 가입 실패",
            reason: "unknown-error",
          };

        const storedUser: User = { ...newUser, uid: fbUser.uid };
        await ref.doc(fbUser.uid).set(storedUser); // ✅ Firestore 저장
        return { success: true };
      } catch (error: any) {
        return {
          success: false,
          message: error.message,
          reason: "unknown-error",
        };
      }
    },
    []
  );

  const updateUser = useCallback(
    async (target: keyof User, value: any): Promise<PromiseResult> => {
      if (!user)
        return {
          success: false,
          message: "로그인 필요",
          reason: "unknown-error",
        };
      try {
        const updated = { ...user, [target]: value };
        await ref.doc(user.uid).update({ [target]: value });
        setUser(updated);
        return { success: true };
      } catch (error: any) {
        return {
          success: false,
          message: error.message,
          reason: "unknown-error",
        };
      }
    },
    [user, ref]
  );

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (fbUser) => {
      if (fbUser) {
        const snap = await ref.doc(fbUser.uid).get();
        const data = snap.data() as User;
        if (data) setUser(data);
      } else {
        setUser(null);
      }
      setTimeout(() => {
        setInitialized(true);
        setIsPending(false);
      }, 1000);
    });
    return unsubscribe;
  }, []);

  return (
    <AUTH.context.Provider
      value={{
        signin,
        isPending,
        initialized,
        signout,
        signup,
        user,
        updateUser,
      }}
    >
      {!isPending || initialized ? children : <Loading />}
    </AUTH.context.Provider>
  );
};

export default AuthProvider;
