"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, updateDoc, doc, query, where, orderBy, arrayUnion, arrayRemove } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { useAuthStore } from "@/store/auth-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ImageIcon, Send } from "lucide-react";

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

export default function MemberWallPage() {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<WallPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const q = query(collection(db, "wallPosts"), where("approved", "==", true), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      setPosts(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as WallPost)));
    } catch (error) {
      console.error("Error loading posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async () => {
    if (!newPost.trim() && !imageFile) return;
    setPosting(true);
    try {
      let imageURL = "";
      if (imageFile) {
        const storageRef = ref(storage, `wall/${Date.now()}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        imageURL = await getDownloadURL(storageRef);
      }
      await addDoc(collection(db, "wallPosts"), {
        content: newPost,
        imageURL,
        authorId: user?.uid,
        authorName: user?.displayName,
        approved: false,
        likes: [],
        createdAt: new Date().toISOString(),
      });
      setNewPost("");
      setImageFile(null);
      alert("Your post has been submitted for approval!");
    } catch (error) {
      console.error("Error posting:", error);
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (post: WallPost) => {
    if (!user) return;
    const isLiked = post.likes?.includes(user.uid);
    try {
      await updateDoc(doc(db, "wallPosts", post.id), {
        likes: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid),
      });
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? { ...p, likes: isLiked ? p.likes.filter((l) => l !== user.uid) : [...(p.likes || []), user.uid] }
            : p
        )
      );
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Wall</h1>

      <Card className="mb-6">
        <CardContent className="py-4">
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            rows={3}
            placeholder="Share something with the club..."
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
          />
          <div className="flex items-center justify-between mt-3">
            <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer hover:text-primary">
              <ImageIcon className="w-4 h-4" />
              {imageFile ? imageFile.name : "Add photo"}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
            </label>
            <Button size="sm" onClick={handlePost} disabled={posting || (!newPost.trim() && !imageFile)}>
              <Send className="w-4 h-4 mr-1" /> {posting ? "Posting..." : "Post"}
            </Button>
          </div>
          <p className="text-xs text-gray-400 mt-2">Posts require admin approval before they appear on the wall.</p>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>
      ) : posts.length === 0 ? (
        <Card><CardContent className="text-center py-12 text-gray-500">No posts yet. Be the first to share!</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardContent className="py-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">
                    {post.authorName?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{post.authorName}</p>
                    <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString("en-IN")}</p>
                  </div>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap mb-3">{post.content}</p>
                {post.imageURL && <img src={post.imageURL} alt="Post" className="rounded-lg max-h-80 object-cover w-full mb-3" />}
                <button
                  onClick={() => handleLike(post)}
                  className={`flex items-center gap-1 text-sm ${post.likes?.includes(user?.uid || "") ? "text-primary font-medium" : "text-gray-500"}`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  {post.likes?.length || 0} {(post.likes?.length || 0) === 1 ? "like" : "likes"}
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
