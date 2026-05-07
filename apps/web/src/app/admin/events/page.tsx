"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, CalendarDays, MapPin, Clock } from "lucide-react";
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
  status: "upcoming" | "past" | "cancelled";
  createdAt: string;
}

export default function EventsPage() {
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

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    try {
      await deleteDoc(doc(db, "events", id));
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const isUpcoming = (date: string) => new Date(date) >= new Date();

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-600">Create and manage club events</p>
        </div>
        <Link href="/admin/events/create">
          <Button><Plus className="w-4 h-4 mr-2" /> Create Event</Button>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>
      ) : events.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">No events created yet.</p>
            <Link href="/admin/events/create"><Button><Plus className="w-4 h-4 mr-2" /> Create Your First Event</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden">
              <div className="flex flex-col sm:flex-row">
                {event.imageURL && (
                  <img src={event.imageURL} alt={event.title} className="w-full sm:w-48 h-32 object-cover" />
                )}
                <CardContent className="py-4 flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 text-lg">{event.title}</h3>
                        <Badge variant={isUpcoming(event.date) ? "success" : "default"}>
                          {isUpcoming(event.date) ? "Upcoming" : "Past"}
                        </Badge>
                      </div>
                      {event.description && <p className="text-sm text-gray-600 mb-2 line-clamp-2">{event.description}</p>}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><CalendarDays className="w-4 h-4" />{new Date(event.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</span>
                        {event.time && <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{event.time}</span>}
                        {event.venue && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{event.venue}</span>}
                      </div>
                      {event.formId && <p className="text-xs text-primary mt-2">Registration form linked</p>}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(event.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
