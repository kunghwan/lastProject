import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { dbService, FBCollection } from "@/lib/firebase";
import { Post } from "@/types/post";

export const fetchUsers = async (username: string): Promise<User[]> => {
  try {
    const usersRef = collection(dbService, FBCollection.USERS);
    const q = query(usersRef, where("nickname", "==", username));
    const querySnapshot = await getDocs(q);

    const users: User[] = [];
    querySnapshot.forEach((doc) => {
      users.push(doc.data() as User);
    });

    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};
export const getUserByUid = async (uid: string): Promise<User | null> => {
  const userRef = collection(dbService, FBCollection.USERS);
  const q = query(userRef, where("uid", "==", uid));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const userDoc = snapshot.docs[0];
  return userDoc.data() as User;
};

export const fetchPostsAndUserId = async (
  username: string
): Promise<{
  posts: Post[];
  userId: string | null;
}> => {
  if (typeof username !== "string") {
    throw new Error("Invalid username: must be a string");
  }

  try {
    const postsRef = collection(dbService, "posts");
    const q = query(postsRef, where("userNickname", "==", username));
    const querySnapshot = await getDocs(q);

    const posts: Post[] = [];
    let userId: string | null = null;

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      posts.push({ id: doc.id, ...data } as Post);

      if (!userId) {
        userId = data.uid || null;
      }
    });

    return { posts, userId };
  } catch (error) {
    console.error("Error fetching posts and user ID:", error);
    return { posts: [], userId: null };
  }
};

// 예시: 로그인한 유저 A가 유저 B를 팔로우할 때
const followUser = async (followerUid: string, targetUid: string) => {
  try {
    const followerRef = doc(dbService, "users", followerUid);
    const targetRef = doc(dbService, "users", targetUid);

    // A는 B를 following 리스트에 추가
    await updateDoc(followerRef, {
      following: arrayUnion(targetUid),
    });

    // B는 A를 followers 리스트에 추가
    await updateDoc(targetRef, {
      followers: arrayUnion(followerUid),
    });

    console.log("✅ 구독 성공");
  } catch (error) {
    console.error("❌ 구독 실패:", error);
  }
};

export const getFollowers = async (uid: string): Promise<User[]> => {
  const snap = await getDocs(collection(dbService, "users", uid, "followers"));
  return snap.docs.map((doc) => doc.data() as User);
};

export const getFollowing = async (uid: string): Promise<User[]> => {
  const snap = await getDocs(collection(dbService, "users", uid, "following"));
  return snap.docs.map((doc) => doc.data() as User);
};
