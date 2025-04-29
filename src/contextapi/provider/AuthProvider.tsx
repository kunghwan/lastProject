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
import { PropsWithChildren } from "react";
import { AUTH } from "../context";
import Loaiding from "@/components/Loading";
import { fetchSignInMethodsForEmail } from "firebase/auth";

// 🔥 Context 두개로 나눈다
// const AuthUserContext = createContext<User | null>(null);
// const AuthFunctionContext = createContext<{
//   signin: (email: string, password: string) => Promise<PromiseResult>;
//   signout: () => Promise<PromiseResult>;
//   signup: (newUser: User, password: string) => Promise<PromiseResult>;
//   updateUser: (target: keyof User, value: any) => Promise<PromiseResult>;
// } | null>(null);

const ref = dbService.collection(FBCollection.USERS);
const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [isPending, setIsPending] = useState(true);

  const signin = useCallback(
    async (email: string, password: string): Promise<PromiseResult> => {
      try {
        console.log(email, password);

        // 1️⃣ Firestore users 컬렉션에서 이메일 먼저 찾기
        const snapshot = await ref.where("email", "==", email).limit(1).get();

        if (snapshot.empty) {
          // 이메일이 없음 = 아이디 틀림
          console.log("❌ 이메일이 존재하지 않음");
          return { success: false, message: "아이디가 틀렸습니다." };
        }

        // 2️⃣ 이메일이 존재하면 로그인 시도
        const userCredential = await authService.signInWithEmailAndPassword(
          email,
          password
        );
        console.log("✅ 로그인 성공! userCredential:", userCredential);

        const fbUser = userCredential.user;
        if (!fbUser) return { success: false, message: "데이터 못가져옴" };

        console.log("✅ 로그인된 유저 uid:", fbUser.uid);

        const snap = await ref.doc(fbUser.uid).get();
        console.log("✅ Firestore에서 가져온 snap:", snap.exists);

        const data = snap.data() as User;
        if (!data) return { success: false, message: "존재하지 않음" };

        setUser(data);
        return { success: true };
      } catch (error: any) {
        console.error("❌ 로그인 실패:", error.message);

        if (error.code === "auth/wrong-password") {
          // 비밀번호 틀림
          const passwordWrong = await ref.where("password", "==", "password");
          console.log(password);
          return { success: false, message: "비밀번호가 틀렸습니다." };
        }

        return { success: false, message: "로그인 실패" };
      }
    },
    [ref]
  );

  useEffect(() => {
    console.log(user);
  }, [user]);

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
    const unsubscribe = authService.onAuthStateChanged(async (fbUser) => {
      console.log(fbUser);
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
    // unsubscribe();
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
      {!isPending || initialized ? children : <Loaiding />}
    </AUTH.context.Provider>
  );
};

export default AuthProvider;
