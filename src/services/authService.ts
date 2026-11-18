import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from './firebase';

export const signInAdmin = async (email: string, pass: string): Promise<User> => {
  const credential = await signInWithEmailAndPassword(auth, email, pass);
  return credential.user;
};

// Helpful helper to initialize an admin account if needed
export const createAdminAccount = async (email: string, pass: string): Promise<User> => {
  const credential = await createUserWithEmailAndPassword(auth, email, pass);
  return credential.user;
};

export const signOutAdmin = async (): Promise<void> => {
  await signOut(auth);
};

export const subscribeToAuth = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};
