"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Megaphone } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: "normal" | "high" | "urgent";
  createdAt: string;
}

export default function MemberAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      setAnnouncements(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Announcement)));
    } catch (error) {
      console.error("Error loading announcements:", error);
    } finally {
      setLoading(false);
    }
  };

  const priorityVariant = (p: string) => {
    if (p === "urgent") return "danger";
    if (p === "high") return "warning";
    return "default";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
        <p className="text-gray-600">Latest club announcements</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : announcements.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No announcements yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <Card key={a.id} className={a.priority === "urgent" ? "border-red-200 bg-red-50" : a.priority === "high" ? "border-yellow-200 bg-yellow-50" : ""}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{a.title}</h3>
                      {a.priority !== "normal" && (
                        <Badge variant={priorityVariant(a.priority)}>{a.priority}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{a.content}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(a.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
