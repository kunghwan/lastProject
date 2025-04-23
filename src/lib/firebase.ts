import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/storage";

const config = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID,
};

if (!firebase.apps.length) {
  firebase.initializeApp(config);
  console.log("Firebase Connected ✅");
}

const auth = firebase.auth;
const authService = auth();

const firestore = firebase.firestore;
const dbService = firestore();

const storage = firebase.storage;
const storageService = storage();

export {
  firebase,
  auth,
  authService,
  firestore,
  dbService,
  storage,
  storageService,
};

export enum FBCollection {
  USERS = "users",
  POSTS = "posts",
}
