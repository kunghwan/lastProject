import { collection, getDocs, query, where } from "firebase/firestore";
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
