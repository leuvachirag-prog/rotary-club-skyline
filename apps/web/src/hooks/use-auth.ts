"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db, isConfigured } from "@/lib/firebase";
import { useAuthStore, type AppUser } from "@/store/auth-store";

export function useAuth() {
  const { user, loading, setUser, setLoading, hasAccess } = useAuthStore();

  useEffect(() => {
    if (!auth || !isConfigured) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email ?? "",
              displayName: userData.displayName ?? firebaseUser.displayName ?? "",
              photoURL: userData.photoURL ?? firebaseUser.photoURL ?? undefined,
              role: userData.role ?? "member",
              moduleAccess: userData.moduleAccess ?? [],
              memberId: userData.memberId,
            });
          } else {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email ?? "",
              displayName: firebaseUser.displayName ?? "",
              role: "member",
              moduleAccess: [],
            });
          }
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading]);

  return { user, loading, hasAccess };
}
