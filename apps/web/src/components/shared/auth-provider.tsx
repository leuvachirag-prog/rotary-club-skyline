"use client";

import { useAuth } from "@/hooks/use-auth";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const PUBLIC_PATHS = ["/auth/login", "/auth/signup", "/forms/"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const { loading } = useAuth();
  const pathname = usePathname();

  const isPublicPath = PUBLIC_PATHS.some((p) => pathname?.startsWith(p));

  if (loading && !isPublicPath) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
