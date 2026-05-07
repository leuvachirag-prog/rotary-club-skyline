"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Clock, ExternalLink } from "lucide-react";
import Link from "next/link";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  imageURL?: string;
  formId?: string;
  createdAt: string;
}

export default function MemberEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const q = query(collection(db, "events"), orderBy("date", "desc"));
      const snapshot = await getDocs(q);
      setEvents(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Event)));
    } catch (error) {
      console.error("Error loading events:", error);
    } finally {
      setLoading(false);
    }
  };

  const isUpcoming = (date: string) => new Date(date) >= new Date();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Events</h1>

      {loading ? (
        <div className="text-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>
      ) : events.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No events yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden">
              {event.imageURL && (
                <img src={event.imageURL} alt={event.title} className="w-full h-48 object-cover" />
              )}
              <CardContent className="py-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 text-lg">{event.title}</h3>
                  <Badge variant={isUpcoming(event.date) ? "success" : "default"}>
                    {isUpcoming(event.date) ? "Upcoming" : "Past"}
                  </Badge>
                </div>
                {event.description && <p className="text-sm text-gray-600 mb-3">{event.description}</p>}
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                  <span className="flex items-center gap-1"><CalendarDays className="w-4 h-4" />{new Date(event.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</span>
                  {event.time && <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{event.time}</span>}
                  {event.venue && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{event.venue}</span>}
                </div>
                {event.formId && (
                  <Link href={`/forms/${event.formId}`}>
                    <Button size="sm">Register <ExternalLink className="w-3 h-3 ml-1" /></Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
