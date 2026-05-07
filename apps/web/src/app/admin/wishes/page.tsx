"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cake, Heart, CalendarDays } from "lucide-react";

interface BirthdayEntry {
  id: string;
  name: string;
  relation: string;
  birthday: string;
  memberName: string;
  photoURL?: string;
}

function getUpcomingBirthdays(members: Array<{ id: string; displayName: string; birthday?: string; spouseName?: string; spouseBirthday?: string; familyMembers?: Array<{ name: string; relation: string; birthday: string }>; photoURL?: string }>) {
  const entries: BirthdayEntry[] = [];
  const today = new Date();
  const next30 = new Date();
  next30.setDate(today.getDate() + 30);

  for (const m of members) {
    if (m.birthday) {
      const bday = new Date(m.birthday);
      bday.setFullYear(today.getFullYear());
      if (bday < today) bday.setFullYear(today.getFullYear() + 1);
      if (bday <= next30) {
        entries.push({ id: m.id, name: m.displayName, relation: "self", birthday: m.birthday, memberName: m.displayName, photoURL: m.photoURL });
      }
    }
    if (m.spouseName && m.spouseBirthday) {
      const bday = new Date(m.spouseBirthday);
      bday.setFullYear(today.getFullYear());
      if (bday < today) bday.setFullYear(today.getFullYear() + 1);
      if (bday <= next30) {
        entries.push({ id: m.id + "_spouse", name: m.spouseName, relation: "spouse", birthday: m.spouseBirthday, memberName: m.displayName });
      }
    }
    if (m.familyMembers) {
      for (const fm of m.familyMembers) {
        if (fm.birthday) {
          const bday = new Date(fm.birthday);
          bday.setFullYear(today.getFullYear());
          if (bday < today) bday.setFullYear(today.getFullYear() + 1);
          if (bday <= next30) {
            entries.push({ id: m.id + "_" + fm.name, name: fm.name, relation: fm.relation, birthday: fm.birthday, memberName: m.displayName });
          }
        }
      }
    }
  }

  return entries.sort((a, b) => {
    const da = new Date(a.birthday);
    da.setFullYear(today.getFullYear());
    const db2 = new Date(b.birthday);
    db2.setFullYear(today.getFullYear());
    return da.getTime() - db2.getTime();
  });
}

function getUpcomingAnniversaries(members: Array<{ id: string; displayName: string; anniversary?: string; spouseName?: string }>) {
  const entries: Array<{ id: string; memberName: string; spouseName: string; anniversary: string }> = [];
  const today = new Date();
  const next30 = new Date();
  next30.setDate(today.getDate() + 30);

  for (const m of members) {
    if (m.anniversary && m.spouseName) {
      const anniv = new Date(m.anniversary);
      anniv.setFullYear(today.getFullYear());
      if (anniv < today) anniv.setFullYear(today.getFullYear() + 1);
      if (anniv <= next30) {
        entries.push({ id: m.id, memberName: m.displayName, spouseName: m.spouseName, anniversary: m.anniversary });
      }
    }
  }

  return entries.sort((a, b) => {
    const da = new Date(a.anniversary);
    da.setFullYear(today.getFullYear());
    const db2 = new Date(b.anniversary);
    db2.setFullYear(today.getFullYear());
    return da.getTime() - db2.getTime();
  });
}

export default function WishesPage() {
  const [members, setMembers] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const snapshot = await getDocs(collection(db, "members"));
      setMembers(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error("Error loading members:", error);
    } finally {
      setLoading(false);
    }
  };

  const birthdays = getUpcomingBirthdays(members as never);
  const anniversaries = getUpcomingAnniversaries(members as never);

  const formatBirthday = (dateStr: string) => {
    const d = new Date(dateStr);
    d.setFullYear(new Date().getFullYear());
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  const getDaysUntil = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(dateStr);
    d.setFullYear(today.getFullYear());
    if (d < today) d.setFullYear(today.getFullYear() + 1);
    return Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return <div className="text-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Birthday & Anniversary Wishes</h1>
        <p className="text-gray-600">Upcoming birthdays and anniversaries in the next 30 days</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Cake className="w-5 h-5 text-pink-500" /> Upcoming Birthdays ({birthdays.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {birthdays.length === 0 ? (
              <p className="text-gray-500 text-sm">No upcoming birthdays in the next 30 days.</p>
            ) : (
              <div className="space-y-3">
                {birthdays.map((b) => {
                  const days = getDaysUntil(b.birthday);
                  return (
                    <div key={b.id} className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                          <Cake className="w-5 h-5 text-pink-500" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{b.name}</p>
                          <p className="text-xs text-gray-500">
                            {b.relation !== "self" && `${b.relation} of ${b.memberName} • `}
                            {formatBirthday(b.birthday)}
                          </p>
                        </div>
                      </div>
                      <Badge variant={days === 0 ? "danger" : days <= 3 ? "warning" : "default"}>
                        {days === 0 ? "Today!" : `${days}d`}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Heart className="w-5 h-5 text-red-500" /> Upcoming Anniversaries ({anniversaries.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {anniversaries.length === 0 ? (
              <p className="text-gray-500 text-sm">No upcoming anniversaries in the next 30 days.</p>
            ) : (
              <div className="space-y-3">
                {anniversaries.map((a) => {
                  const days = getDaysUntil(a.anniversary);
                  const years = new Date().getFullYear() - new Date(a.anniversary).getFullYear();
                  return (
                    <div key={a.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                          <Heart className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{a.memberName} & {a.spouseName}</p>
                          <p className="text-xs text-gray-500">{formatBirthday(a.anniversary)} • {years} years</p>
                        </div>
                      </div>
                      <Badge variant={days === 0 ? "danger" : days <= 3 ? "warning" : "default"}>
                        {days === 0 ? "Today!" : `${days}d`}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
