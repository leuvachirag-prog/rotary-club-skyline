import { create } from "zustand";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: "super_admin" | "sub_admin" | "member";
  photoURL: string | null;
}

interface AuthState {
  user: AppUser | null;
  loading: boolean;
  setUser: (user: AppUser | null) => void;
  logout: () => Promise<void>;
  initialize: () => () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user, loading: false }),
  logout: async () => {
    await signOut(auth);
    set({ user: null });
  },
  initialize: () => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          const data = userDoc.data();
          set({
            user: {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: data?.displayName || firebaseUser.displayName,
              role: data?.role || "member",
              photoURL: data?.photoURL || firebaseUser.photoURL,
            },
            loading: false,
          });
        } catch {
          set({
            user: {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              role: "member",
              photoURL: firebaseUser.photoURL,
            },
            loading: false,
          });
        }
      } else {
        set({ user: null, loading: false });
      }
    });
    return unsubscribe;
  },
}));
