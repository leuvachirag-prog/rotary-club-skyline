"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/store/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Megaphone, CalendarDays, BarChart3 } from "lucide-react";
import Link from "next/link";

interface Announcement {
  id: string;
  title: string;
  body: string;
  priority: string;
  createdAt: string;
}

interface FormDef {
  id: string;
  title: string;
  type: string;
}

export default function MemberDashboard() {
  const { user } = useAuthStore();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [activeForms, setActiveForms] = useState<FormDef[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [announcementSnap, formsSnap] = await Promise.all([
        getDocs(query(collection(db, "announcements"), orderBy("createdAt", "desc"), limit(5))),
        getDocs(query(collection(db, "forms"), where("status", "==", "active"))),
      ]);

      setAnnouncements(announcementSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Announcement)));
      setActiveForms(formsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as FormDef)));
    } catch (error) {
      console.error("Error loading dashboard:", error);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.displayName}</h1>
        <p className="text-gray-600">Rotary Club of Ahmedabad Skyline</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <Link href="/member/forms">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="flex flex-col items-center py-5">
              <FileText className="w-8 h-8 text-primary mb-2" />
              <span className="text-sm font-medium">Forms</span>
              <Badge variant="info" className="mt-1">{activeForms.length} active</Badge>
            </CardContent>
          </Card>
        </Link>
        <Link href="/member/events">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="flex flex-col items-center py-5">
              <CalendarDays className="w-8 h-8 text-green-600 mb-2" />
              <span className="text-sm font-medium">Events</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/member/wall">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="flex flex-col items-center py-5">
              <Megaphone className="w-8 h-8 text-purple-600 mb-2" />
              <span className="text-sm font-medium">Wall</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/member/polls">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="flex flex-col items-center py-5">
              <BarChart3 className="w-8 h-8 text-orange-600 mb-2" />
              <span className="text-sm font-medium">Polls</span>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader><CardTitle>Recent Announcements</CardTitle></CardHeader>
        <CardContent>
          {announcements.length === 0 ? (
            <p className="text-gray-500 text-sm">No announcements yet.</p>
          ) : (
            <div className="space-y-3">
              {announcements.map((a) => (
                <div key={a.id} className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900">{a.title}</h4>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{a.body}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
