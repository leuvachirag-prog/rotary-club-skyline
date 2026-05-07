"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Trash2, ThumbsUp } from "lucide-react";

interface WallPost {
  id: string;
  content: string;
  imageURL?: string;
  authorId: string;
  authorName: string;
  approved: boolean;
  likes: string[];
  createdAt: string;
}

export default function WallPostsPage() {
  const [posts, setPosts] = useState<WallPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const q = query(collection(db, "wallPosts"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      setPosts(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as WallPost)));
    } catch (error) {
      console.error("Error loading posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await updateDoc(doc(db, "wallPosts", id), { approved: true });
      setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, approved: true } : p)));
    } catch (error) {
      console.error("Error approving post:", error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updateDoc(doc(db, "wallPosts", id), { approved: false });
      setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, approved: false } : p)));
    } catch (error) {
      console.error("Error rejecting post:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    try {
      await deleteDoc(doc(db, "wallPosts", id));
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const filtered = posts.filter((p) => {
    if (filter === "pending") return !p.approved;
    if (filter === "approved") return p.approved;
    return true;
  });

  const pendingCount = posts.filter((p) => !p.approved).length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wall Posts</h1>
          <p className="text-gray-600">Review and manage member posts</p>
        </div>
        {pendingCount > 0 && <Badge variant="warning">{pendingCount} pending approval</Badge>}
      </div>

      <div className="flex gap-2 mb-6">
        {(["all", "pending", "approved"] as const).map((f) => (
          <Button key={f} variant={filter === f ? "primary" : "outline"} size="sm" onClick={() => setFilter(f)} className="capitalize">
            {f}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="text-center py-12 text-gray-500">No posts found.</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((post) => (
            <Card key={post.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">
                      {post.authorName?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{post.authorName}</p>
                      <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString("en-IN")}</p>
                    </div>
                  </div>
                  <Badge variant={post.approved ? "success" : "warning"}>
                    {post.approved ? "Approved" : "Pending"}
                  </Badge>
                </div>

                <p className="text-gray-700 whitespace-pre-wrap mb-3">{post.content}</p>

                {post.imageURL && (
                  <img src={post.imageURL} alt="Post" className="rounded-lg max-h-64 object-cover mb-3" />
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <ThumbsUp className="w-4 h-4" />
                    <span>{post.likes?.length || 0} likes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {!post.approved && (
                      <Button variant="ghost" size="sm" onClick={() => handleApprove(post.id)}>
                        <CheckCircle className="w-4 h-4 text-green-500 mr-1" /> Approve
                      </Button>
                    )}
                    {post.approved && (
                      <Button variant="ghost" size="sm" onClick={() => handleReject(post.id)}>
                        <XCircle className="w-4 h-4 text-yellow-500 mr-1" /> Unapprove
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(post.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
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
