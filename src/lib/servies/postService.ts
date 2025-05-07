import { dbService } from "@/lib/firebase";
import { Post } from "@/types/post";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";

export const fetchPostsByUid = async (uid: string): Promise<Post[]> => {
  const q = query(collection(dbService, "posts"), where("uid", "==", uid));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Post));
};

export const fetchPostsByNickname = async (
  nickname: string
): Promise<Post[]> => {
  const q = query(
    collection(dbService, "posts"),
    where("userNickname", "==", nickname)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Post));
};
