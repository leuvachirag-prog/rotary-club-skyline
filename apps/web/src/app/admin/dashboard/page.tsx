"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/auth-store";
import { Users, FileText, CalendarDays, IndianRupee, Megaphone, Cake, MessageSquare, ImageIcon, BarChart3 } from "lucide-react";
import Link from "next/link";

interface DashboardStats {
  totalMembers: number;
  activeForms: number;
  upcomingEvents: number;
  pendingWall: number;
  pendingSuggestions: number;
  activePolls: number;
  announcements: number;
  recentMembers: { id: string; displayName: string; status: string; createdAt: string }[];
  upcomingEventsList: { id: string; title: string; date: string; venue: string }[];
}

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    activeForms: 0,
    upcomingEvents: 0,
    pendingWall: 0,
    pendingSuggestions: 0,
    activePolls: 0,
    announcements: 0,
    recentMembers: [],
    upcomingEventsList: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];

      const [membersSnap, formsSnap, eventsSnap, wallSnap, suggestionsSnap, pollsSnap, announcementsSnap] = await Promise.all([
        getDocs(collection(db, "members")),
        getDocs(query(collection(db, "forms"), where("status", "==", "active"))),
        getDocs(query(collection(db, "events"), orderBy("date", "desc"), limit(10))),
        getDocs(query(collection(db, "wallPosts"), where("status", "==", "pending"))),
        getDocs(query(collection(db, "suggestions"), where("status", "==", "open"))),
        getDocs(query(collection(db, "polls"), where("status", "==", "active"))),
        getDocs(collection(db, "announcements")),
      ]);

      const upcomingEvents = eventsSnap.docs
        .map((d) => ({ id: d.id, ...d.data() } as { id: string; title: string; date: string; venue: string }))
        .filter((e) => e.date >= today);

      const recentMembers = membersSnap.docs
        .map((d) => ({ id: d.id, ...d.data() } as { id: string; displayName: string; status: string; createdAt: string }))
        .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
        .slice(0, 5);

      setStats({
        totalMembers: membersSnap.size,
        activeForms: formsSnap.size,
        upcomingEvents: upcomingEvents.length,
        pendingWall: wallSnap.size,
        pendingSuggestions: suggestionsSnap.size,
        activePolls: pollsSnap.size,
        announcements: announcementsSnap.size,
        recentMembers,
        upcomingEventsList: upcomingEvents.slice(0, 5),
      });
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: "Total Members", value: stats.totalMembers, icon: Users, color: "text-blue-600", bg: "bg-blue-50", href: "/admin/members" },
    { label: "Active Forms", value: stats.activeForms, icon: FileText, color: "text-green-600", bg: "bg-green-50", href: "/admin/forms" },
    { label: "Upcoming Events", value: stats.upcomingEvents, icon: CalendarDays, color: "text-yellow-600", bg: "bg-yellow-50", href: "/admin/events" },
    { label: "Announcements", value: stats.announcements, icon: Megaphone, color: "text-purple-600", bg: "bg-purple-50", href: "/admin/announcements" },
    { label: "Pending Suggestions", value: stats.pendingSuggestions, icon: MessageSquare, color: "text-orange-600", bg: "bg-orange-50", href: "/admin/suggestions" },
    { label: "Pending Wall Posts", value: stats.pendingWall, icon: ImageIcon, color: "text-teal-600", bg: "bg-teal-50", href: "/admin/wall" },
    { label: "Active Polls", value: stats.activePolls, icon: BarChart3, color: "text-indigo-600", bg: "bg-indigo-50", href: "/admin/polls" },
  ];

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.displayName || "Admin"}</h1>
        <p className="text-gray-600 mt-1">Rotary Club of Ahmedabad Skyline — Admin Dashboard</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="flex items-center gap-4 py-5">
                  <div className={`p-3 rounded-lg ${stat.bg}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Recent Members</CardTitle></CardHeader>
          <CardContent>
            {stats.recentMembers.length === 0 ? (
              <p className="text-gray-500 text-sm">No members yet.</p>
            ) : (
              <div className="space-y-3">
                {stats.recentMembers.map((m) => (
                  <Link key={m.id} href={`/admin/members/${m.id}`} className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                    <span className="text-sm font-medium text-gray-900">{m.displayName}</span>
                    <Badge variant={m.status === "active" ? "success" : "warning"}>{m.status || "active"}</Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Upcoming Events</CardTitle></CardHeader>
          <CardContent>
            {stats.upcomingEventsList.length === 0 ? (
              <p className="text-gray-500 text-sm">No upcoming events.</p>
            ) : (
              <div className="space-y-3">
                {stats.upcomingEventsList.map((e) => (
                  <div key={e.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{e.title}</p>
                      {e.venue && <p className="text-xs text-gray-500">{e.venue}</p>}
                    </div>
                    <span className="text-xs text-gray-500">{new Date(e.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
