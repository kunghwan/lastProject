import { collection, getDocs, query, where } from "firebase/firestore";
import { dbService } from "@/lib/firebase";

export interface User {
  uid: string;
  nickname: string;
  profileImageUrl?: string;
  bio?: string;
}

export const getUserByUsername = async (
  username: string
): Promise<User | null> => {
  // Firestore 로직
  const ref = collection(dbService, "users");
  const q = query(ref, where("nickname", "==", username));
  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  return { uid: doc.id, ...doc.data() } as User;
};
