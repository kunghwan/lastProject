import { dbService } from "@/lib/firebase";

import { collection, getDocs, query, where } from "firebase/firestore";

export const fetchUserByUid = async (uid: string): Promise<User | null> => {
  const q = query(collection(dbService, "users"), where("uid", "==", uid));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return snapshot.docs[0].data() as User;
};

export const fetchUsersByNickname = async (
  nickname: string
): Promise<User[]> => {
  const q = query(
    collection(dbService, "users"),
    where("nickname", "==", nickname)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as User);
};
