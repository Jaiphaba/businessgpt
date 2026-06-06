import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

import { auth } from "../firebase/firebaseConfig";

// Register
export const registerUser = async (email, password) => {
  const userCredential =
    await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

  return userCredential.user;
};

// Login
export const loginUser = async (email, password) => {
  const userCredential =
    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

  return userCredential.user;
};

// Google Login
export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();

  const result =
    await signInWithPopup(auth, provider);

  return result.user;
};

// Logout
export const logoutUser = async () => {
  await signOut(auth);
};