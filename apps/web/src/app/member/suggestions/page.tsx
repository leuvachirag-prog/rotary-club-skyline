"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/store/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, X, MessageSquare } from "lucide-react";

interface Suggestion {
  id: string;
  subject: string;
  category: "suggestion" | "complaint";
  description: string;
  status: "open" | "in_progress" | "resolved";
  adminResponse?: string;
  createdAt: string;
}

export default function MemberSuggestionsPage() {
  const { user } = useAuthStore();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<{ subject: string; category: "suggestion" | "complaint"; description: string }>({ subject: "", category: "suggestion", description: "" });

  useEffect(() => {
    loadSuggestions();
  }, [user]);

  const loadSuggestions = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, "suggestions"), where("submittedBy", "==", user.uid), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      setSuggestions(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Suggestion)));
    } catch (error) {
      console.error("Error loading suggestions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const data = {
        ...form,
        submittedBy: user.uid,
        submittedByName: user.displayName,
        status: "open" as const,
        createdAt: new Date().toISOString(),
      };
      const docRef = await addDoc(collection(db, "suggestions"), data);
      setSuggestions((prev) => [{ id: docRef.id, ...data }, ...prev]);
      setForm({ subject: "", category: "suggestion", description: "" });
      setShowForm(false);
    } catch (error) {
      console.error("Error submitting:", error);
    } finally {
      setSaving(false);
    }
  };

  const statusVariant = (s: string) => {
    if (s === "resolved") return "success" as const;
    if (s === "in_progress") return "warning" as const;
    return "info" as const;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Suggestions & Complaints</h1>
        <Button size="sm" onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-1" /> New</Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Submit Feedback</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}><X className="w-4 h-4" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input id="subject" label="Subject *" value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))} required />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as "suggestion" | "complaint" }))} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                  <option value="suggestion">Suggestion</option>
                  <option value="complaint">Complaint</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary" rows={4} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} required />
              </div>
              <Button type="submit" disabled={saving}>{saving ? "Submitting..." : "Submit"}</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>
      ) : suggestions.length === 0 ? (
        <Card><CardContent className="text-center py-12"><MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">No submissions yet.</p></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {suggestions.map((s) => (
            <Card key={s.id}>
              <CardContent className="py-4">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900">{s.subject}</h3>
                  <Badge variant={s.category === "complaint" ? "danger" : "info"}>{s.category}</Badge>
                  <Badge variant={statusVariant(s.status)}>{s.status.replace("_", " ")}</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{s.description}</p>
                {s.adminResponse && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-3 mt-2">
                    <p className="text-xs font-medium text-green-800 mb-1">Admin Response:</p>
                    <p className="text-sm text-green-700">{s.adminResponse}</p>
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-2">{new Date(s.createdAt).toLocaleDateString("en-IN")}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
