"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, X, BarChart3 } from "lucide-react";

interface PollOption {
  id: string;
  text: string;
  votes: string[];
}

interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  multiSelect: boolean;
  expiresAt: string;
  createdAt: string;
}

export default function PollsPage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    question: "",
    options: ["", ""],
    multiSelect: false,
    expiresAt: "",
  });

  useEffect(() => {
    loadPolls();
  }, []);

  const loadPolls = async () => {
    try {
      const q = query(collection(db, "polls"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      setPolls(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Poll)));
    } catch (error) {
      console.error("Error loading polls:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const validOptions = form.options.filter((o) => o.trim());
    if (validOptions.length < 2) {
      alert("Please add at least 2 options.");
      return;
    }
    setSaving(true);
    try {
      const pollData = {
        question: form.question,
        options: validOptions.map((text, i) => ({ id: `opt_${i}`, text, votes: [] })),
        multiSelect: form.multiSelect,
        expiresAt: form.expiresAt || null,
        createdAt: new Date().toISOString(),
      };
      const docRef = await addDoc(collection(db, "polls"), pollData);
      setPolls((prev) => [{ id: docRef.id, ...pollData } as Poll, ...prev]);
      setForm({ question: "", options: ["", ""], multiSelect: false, expiresAt: "" });
      setShowForm(false);
    } catch (error) {
      console.error("Error creating poll:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this poll?")) return;
    try {
      await deleteDoc(doc(db, "polls", id));
      setPolls((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Error deleting poll:", error);
    }
  };

  const addOption = () => setForm((p) => ({ ...p, options: [...p.options, ""] }));
  const updateOption = (i: number, val: string) => setForm((p) => ({ ...p, options: p.options.map((o, idx) => (idx === i ? val : o)) }));
  const removeOption = (i: number) => setForm((p) => ({ ...p, options: p.options.filter((_, idx) => idx !== i) }));

  const getTotalVotes = (poll: Poll) => poll.options.reduce((sum, o) => sum + (o.votes?.length || 0), 0);
  const isExpired = (poll: Poll) => poll.expiresAt && new Date(poll.expiresAt) < new Date();

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Polls</h1>
          <p className="text-gray-600">Create polls and see member votes</p>
        </div>
        <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-2" /> Create Poll</Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Create Poll</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}><X className="w-4 h-4" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <Input id="question" label="Question *" placeholder="What would you like to ask?" value={form.question} onChange={(e) => setForm((p) => ({ ...p, question: e.target.value }))} required />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Options *</label>
                {form.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2 mb-2">
                    <Input placeholder={`Option ${i + 1}`} value={opt} onChange={(e) => updateOption(i, e.target.value)} />
                    {form.options.length > 2 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeOption(i)}><Trash2 className="w-3 h-3 text-red-400" /></Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addOption}><Plus className="w-3 h-3 mr-1" /> Add Option</Button>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.multiSelect} onChange={(e) => setForm((p) => ({ ...p, multiSelect: e.target.checked }))} className="w-4 h-4 rounded" />
                  Allow multiple selections
                </label>
              </div>
              <Input id="expiresAt" label="Expires On (optional)" type="datetime-local" value={form.expiresAt} onChange={(e) => setForm((p) => ({ ...p, expiresAt: e.target.value }))} />
              <Button type="submit" disabled={saving}>{saving ? "Creating..." : "Create Poll"}</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>
      ) : polls.length === 0 ? (
        <Card><CardContent className="text-center py-12 text-gray-500">No polls created yet.</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {polls.map((poll) => {
            const totalVotes = getTotalVotes(poll);
            const expired = isExpired(poll);
            return (
              <Card key={poll.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{poll.question}</CardTitle>
                    <div className="flex items-center gap-2">
                      {expired && <Badge variant="danger">Expired</Badge>}
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(poll.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {poll.options.map((opt) => {
                      const pct = totalVotes > 0 ? Math.round((opt.votes?.length || 0) / totalVotes * 100) : 0;
                      return (
                        <div key={opt.id}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{opt.text}</span>
                            <span className="text-gray-500">{opt.votes?.length || 0} ({pct}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-primary rounded-full h-2 transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
                    <BarChart3 className="w-4 h-4" />
                    <span>{totalVotes} total votes</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
