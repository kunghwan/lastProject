"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { authService, dbService, FBCollection } from "@/lib";
import { onAuthStateChanged } from "firebase/auth";

import { PropsWithChildren } from "react";
import { AUTH } from "../context";

const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const ref = dbService.collection(FBCollection.USERS);

  const signin = useCallback(
    async (email: string, password: string): Promise<PromiseResult> => {
      try {
        const { user: fbUser } = await authService.signInWithEmailAndPassword(
          email,
          password
        );
        if (!fbUser) return { success: false, message: "데이터 못가져옴" };

        const snap = await ref.doc(fbUser.uid).get();
        const data = snap.data() as User;
        if (!data) return { success: false, message: "존재하지 않음" };

        setUser(data);
        return { success: true };
      } catch (error: any) {
        return { success: false, message: error.message };
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
      return { success: false, message: error.message };
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

        if (!fbUser) return { success: false, message: "유저 가입안됨" };

        const storedUser: User = {
          ...newUser,
          uid: fbUser.uid,
        };

        // 🔸 로그인 상태로 두지 않고 sessionStorage 에만 저장
        sessionStorage.setItem("signupUser", JSON.stringify(storedUser));

        return { success: true };
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    },
    []
  );

  const updateUser = useCallback(
    async (target: keyof User, value: any): Promise<PromiseResult> => {
      if (!user) {
        return {
          success: false,
          message: "로그인 한 유저만 사용할 수 있는 기능입니다.",
        };
      }

      try {
        const updated = { ...user, [target]: value };
        await ref.doc(user.uid).update({ [target]: value });
        setUser(updated);
        return { success: true };
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    },
    [user, ref]
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(authService, async (fbUser) => {
      if (fbUser) {
        const snap = await ref.doc(fbUser.uid).get();
        const data = snap.data() as User;
        if (data) setUser(data);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [ref]);

  const value = useMemo(
    () => ({
      user,
      isPending: false,
      initialized: true,
      signin,
      signout,
      signup,
      updateUser,
    }),
    [user, signin, signout, signup, updateUser]
  );

  return (
    <AUTH.context.Provider value={value}>{children}</AUTH.context.Provider>
  );
};

export default AuthProvider;
