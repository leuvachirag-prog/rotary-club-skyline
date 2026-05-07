"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, updateDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/store/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, CheckCircle } from "lucide-react";

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
  expiresAt?: string;
  createdAt: string;
}

export default function MemberPollsPage() {
  const { user } = useAuthStore();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);

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

  const hasVoted = (poll: Poll) => {
    return poll.options.some((o) => o.votes?.includes(user?.uid || ""));
  };

  const isExpired = (poll: Poll) => poll.expiresAt && new Date(poll.expiresAt) < new Date();

  const handleVote = async (poll: Poll, optionId: string) => {
    if (!user || hasVoted(poll) || isExpired(poll)) return;
    const updatedOptions = poll.options.map((o) =>
      o.id === optionId ? { ...o, votes: [...(o.votes || []), user.uid] } : o
    );
    try {
      await updateDoc(doc(db, "polls", poll.id), { options: updatedOptions });
      setPolls((prev) => prev.map((p) => (p.id === poll.id ? { ...p, options: updatedOptions } : p)));
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Polls</h1>

      {loading ? (
        <div className="text-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>
      ) : polls.length === 0 ? (
        <Card><CardContent className="text-center py-12"><BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">No polls available.</p></CardContent></Card>
      ) : (
        <div className="space-y-4">
          {polls.map((poll) => {
            const voted = hasVoted(poll);
            const expired = isExpired(poll);
            const totalVotes = poll.options.reduce((sum, o) => sum + (o.votes?.length || 0), 0);
            return (
              <Card key={poll.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{poll.question}</CardTitle>
                    <div className="flex gap-2">
                      {voted && <Badge variant="success">Voted</Badge>}
                      {expired && <Badge variant="danger">Expired</Badge>}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {poll.options.map((opt) => {
                      const pct = totalVotes > 0 ? Math.round((opt.votes?.length || 0) / totalVotes * 100) : 0;
                      const isMyVote = opt.votes?.includes(user?.uid || "");

                      if (voted || expired) {
                        return (
                          <div key={opt.id}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="flex items-center gap-1">
                                {isMyVote && <CheckCircle className="w-3 h-3 text-primary" />}
                                {opt.text}
                              </span>
                              <span className="text-gray-500">{pct}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div className={`rounded-full h-2.5 transition-all ${isMyVote ? "bg-primary" : "bg-gray-400"}`} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      }

                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleVote(poll, opt.id)}
                          className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-sm"
                        >
                          {opt.text}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-400 mt-3">{totalVotes} total votes</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
