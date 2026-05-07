"use client";

import { useAuthStore } from "@/store/auth-store";
import { MemberBottomNav } from "@/components/member/bottom-nav";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import type { ReactNode } from "react";

export default function MemberLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/auth/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/auth/login";
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16 lg:pb-0">
      <header className="bg-primary text-white sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/member/dashboard">
            <div>
              <h1 className="text-lg font-bold">RC Ahmedabad Skyline</h1>
            </div>
          </Link>
          <button onClick={handleLogout} className="p-2 hover:bg-primary-dark rounded-md transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">{children}</main>

      <MemberBottomNav />
    </div>
  );
}
