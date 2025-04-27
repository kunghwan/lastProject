"use client";

import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useState,
  useEffect,
} from "react";
import { authService, dbService, FBCollection } from "@/lib";
import { onAuthStateChanged } from "firebase/auth";
import { PropsWithChildren } from "react";

// 🔥 Context 두개로 나눈다
const AuthUserContext = createContext<User | null>(null);
const AuthFunctionContext = createContext<{
  signin: (email: string, password: string) => Promise<PromiseResult>;
  signout: () => Promise<PromiseResult>;
  signup: (newUser: User, password: string) => Promise<PromiseResult>;
  updateUser: (target: keyof User, value: any) => Promise<PromiseResult>;
} | null>(null);

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

        const storedUser: User = { ...newUser, uid: fbUser.uid };
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

  const actions = useMemo(
    () => ({ signin, signout, signup, updateUser }),
    [signin, signout, signup, updateUser]
  );

  return (
    <AuthUserContext.Provider value={user}>
      <AuthFunctionContext.Provider value={actions}>
        {children}
      </AuthFunctionContext.Provider>
    </AuthUserContext.Provider>
  );
};

export default AuthProvider;

// 🔥 Context 사용 헬퍼
export const useAuthUser = () => {
  const context = useContext(AuthUserContext);
  if (context === undefined)
    throw new Error("useAuthUser must be used within AuthProvider");
  return context;
};

export const useAuthFunction = () => {
  const context = useContext(AuthFunctionContext);
  if (context === undefined)
    throw new Error("useAuthFunction must be used within AuthProvider");
  return context;
};
