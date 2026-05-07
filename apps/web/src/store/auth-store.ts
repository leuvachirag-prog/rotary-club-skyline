import { create } from "zustand";

export type UserRole = "super_admin" | "sub_admin" | "member";

export type ModuleAccess =
  | "membership"
  | "events_forms"
  | "transactions"
  | "announcements"
  | "wishes"
  | "about_club"
  | "suggestions"
  | "wall"
  | "polls";

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  moduleAccess: ModuleAccess[];
  memberId?: string;
}

interface AuthState {
  user: AppUser | null;
  loading: boolean;
  setUser: (user: AppUser | null) => void;
  setLoading: (loading: boolean) => void;
  hasAccess: (module: ModuleAccess) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  hasAccess: (module) => {
    const { user } = get();
    if (!user) return false;
    if (user.role === "super_admin") return true;
    return user.moduleAccess.includes(module);
  },
}));
