"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, MessageSquare, Send } from "lucide-react";

interface Suggestion {
  id: string;
  subject: string;
  category: "suggestion" | "complaint";
  description: string;
  attachmentURL?: string;
  submittedBy: string;
  submittedByName: string;
  status: "open" | "in_progress" | "resolved";
  adminResponse?: string;
  createdAt: string;
}

export default function SuggestionsPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "open" | "in_progress" | "resolved">("all");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      const q = query(collection(db, "suggestions"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      setSuggestions(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Suggestion)));
    } catch (error) {
      console.error("Error loading suggestions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: Suggestion["status"]) => {
    try {
      await updateDoc(doc(db, "suggestions", id), { status });
      setSuggestions((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleReply = async (id: string) => {
    if (!replyText.trim()) return;
    try {
      await updateDoc(doc(db, "suggestions", id), { adminResponse: replyText, status: "resolved" as const });
      setSuggestions((prev) => prev.map((s) => (s.id === id ? { ...s, adminResponse: replyText, status: "resolved" as const } : s)));
      setReplyingTo(null);
      setReplyText("");
    } catch (error) {
      console.error("Error replying:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this suggestion?")) return;
    try {
      await deleteDoc(doc(db, "suggestions", id));
      setSuggestions((prev) => prev.filter((s) => s.id !== id));
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const filtered = suggestions.filter((s) => filter === "all" || s.status === filter);

  const statusVariant = (s: string) => {
    if (s === "resolved") return "success" as const;
    if (s === "in_progress") return "warning" as const;
    return "info" as const;
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Suggestions & Complaints</h1>
        <p className="text-gray-600">View and respond to member feedback</p>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {(["all", "open", "in_progress", "resolved"] as const).map((f) => (
          <Button key={f} variant={filter === f ? "primary" : "outline"} size="sm" onClick={() => setFilter(f)} className="capitalize">
            {f.replace("_", " ")}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="text-center py-12 text-gray-500">No suggestions found.</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((s) => (
            <Card key={s.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{s.subject}</h3>
                      <Badge variant={s.category === "complaint" ? "danger" : "info"}>{s.category}</Badge>
                      <Badge variant={statusVariant(s.status)}>{s.status.replace("_", " ")}</Badge>
                    </div>
                    <p className="text-xs text-gray-500">By {s.submittedByName} on {new Date(s.createdAt).toLocaleDateString("en-IN")}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(s.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                </div>

                <p className="text-gray-700 text-sm whitespace-pre-wrap mb-3">{s.description}</p>

                {s.adminResponse && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-3">
                    <p className="text-xs font-medium text-green-800 mb-1">Admin Response:</p>
                    <p className="text-sm text-green-700">{s.adminResponse}</p>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  {s.status === "open" && (
                    <Button variant="outline" size="sm" onClick={() => handleStatusChange(s.id, "in_progress")}>Mark In Progress</Button>
                  )}
                  {s.status === "in_progress" && (
                    <Button variant="outline" size="sm" onClick={() => handleStatusChange(s.id, "resolved")}>Mark Resolved</Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => { setReplyingTo(s.id); setReplyText(s.adminResponse || ""); }}>
                    <MessageSquare className="w-4 h-4 mr-1" /> Reply
                  </Button>
                </div>

                {replyingTo === s.id && (
                  <div className="mt-3 flex gap-2">
                    <textarea
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={2}
                      placeholder="Type your response..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                    />
                    <Button size="sm" onClick={() => handleReply(s.id)}><Send className="w-4 h-4" /></Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
