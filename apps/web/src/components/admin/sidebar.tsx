"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore, type ModuleAccess } from "@/store/auth-store";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  FileText,
  CalendarDays,
  IndianRupee,
  Megaphone,
  Cake,
  Info,
  MessageSquare,
  ImageIcon,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  module?: ModuleAccess;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Registrations", href: "/admin/registrations", icon: UserPlus, module: "membership" },
  { label: "Members", href: "/admin/members", icon: Users, module: "membership" },
  { label: "Events", href: "/admin/events", icon: CalendarDays, module: "events_forms" },
  { label: "Forms", href: "/admin/forms", icon: FileText, module: "events_forms" },
  { label: "Transactions", href: "/admin/transactions", icon: IndianRupee, module: "transactions" },
  { label: "Announcements", href: "/admin/announcements", icon: Megaphone, module: "announcements" },
  { label: "Birthday & Wishes", href: "/admin/wishes", icon: Cake, module: "wishes" },
  { label: "About Club", href: "/admin/about-club", icon: Info, module: "about_club" },
  { label: "Suggestions", href: "/admin/suggestions", icon: MessageSquare, module: "suggestions" },
  { label: "Wall Posts", href: "/admin/wall", icon: ImageIcon, module: "wall" },
  { label: "Polls", href: "/admin/polls", icon: BarChart3, module: "polls" },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, hasAccess } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const filteredItems = navItems.filter((item) => {
    if (!item.module) return true;
    return hasAccess(item.module);
  });

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/login";
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="px-6 py-5 border-b border-primary-dark">
        <h1 className="text-lg font-bold text-white">RC Ahmedabad</h1>
        <p className="text-sm text-blue-200">Skyline</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary-dark text-white"
                  : "text-blue-100 hover:bg-primary-dark/50 hover:text-white"
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-primary-dark">
        <div className="px-3 py-2 mb-2">
          <p className="text-sm font-medium text-white truncate">{user?.displayName}</p>
          <p className="text-xs text-blue-200 truncate">{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm font-medium text-blue-100 hover:bg-primary-dark/50 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-primary text-white rounded-md"
      >
        <Menu className="w-5 h-5" />
      </button>

      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen w-64 bg-primary transition-transform duration-300 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden absolute top-4 right-4 text-white"
        >
          <X className="w-5 h-5" />
        </button>
        {sidebarContent}
      </aside>
    </>
  );
}
