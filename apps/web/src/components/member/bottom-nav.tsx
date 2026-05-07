"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, FileText, CalendarDays, ImageIcon, User, Info } from "lucide-react";

const navItems = [
  { label: "Home", href: "/member/dashboard", icon: LayoutDashboard },
  { label: "Events", href: "/member/events", icon: CalendarDays },
  { label: "Wall", href: "/member/wall", icon: ImageIcon },
  { label: "About", href: "/member/about", icon: Info },
  { label: "Profile", href: "/member/profile", icon: User },
];

export function MemberBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 lg:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1 text-xs",
                isActive ? "text-primary font-medium" : "text-gray-500"
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
