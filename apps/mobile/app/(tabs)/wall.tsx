import { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Image, TouchableOpacity, TextInput } from "react-native";
import { collection, getDocs, addDoc, query, where, orderBy } from "firebase/firestore";
import { db } from "../../src/lib/firebase";
import { useAuthStore } from "../../src/store/auth-store";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../src/lib/colors";

interface WallPost {
  id: string;
  userId: string;
  userName: string;
  content: string;
  imageURL?: string;
  likes: string[];
  status: string;
  createdAt: string;
}

export default function WallScreen() {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<WallPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const q = query(collection(db, "wallPosts"), where("status", "==", "approved"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() } as WallPost)));
    } catch (error) {
      console.error("Error loading posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async () => {
    if (!newPost.trim() || !user) return;
    setPosting(true);
    try {
      await addDoc(collection(db, "wallPosts"), {
        userId: user.uid,
        userName: user.displayName,
        content: newPost.trim(),
        likes: [],
        status: "pending",
        createdAt: new Date().toISOString(),
      });
      setNewPost("");
      alert("Post submitted for admin approval.");
    } catch (error) {
      console.error("Error posting:", error);
    } finally {
      setPosting(false);
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.composer}>
        <TextInput
          style={styles.input}
          placeholder="Share something with the club..."
          value={newPost}
          onChangeText={setNewPost}
          multiline
          numberOfLines={3}
        />
        <TouchableOpacity style={[styles.postBtn, !newPost.trim() && styles.postBtnDisabled]} onPress={handlePost} disabled={posting || !newPost.trim()}>
          <Text style={styles.postBtnText}>{posting ? "Posting..." : "Post"}</Text>
        </TouchableOpacity>
        <Text style={styles.hint}>Posts need admin approval before they appear.</Text>
      </View>

      {posts.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="images-outline" size={48} color={colors.gray[300]} />
          <Text style={styles.emptyText}>No posts yet.</Text>
        </View>
      ) : (
        posts.map((post) => (
          <View key={post.id} style={styles.card}>
            <View style={styles.postHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{post.userName?.[0] || "?"}</Text>
              </View>
              <View>
                <Text style={styles.userName}>{post.userName}</Text>
                <Text style={styles.postDate}>
                  {new Date(post.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </Text>
              </View>
            </View>
            <Text style={styles.postContent}>{post.content}</Text>
            {post.imageURL && <Image source={{ uri: post.imageURL }} style={styles.postImage} />}
            <View style={styles.postFooter}>
              <Ionicons name="heart-outline" size={18} color={colors.gray[400]} />
              <Text style={styles.likeCount}>{post.likes?.length || 0}</Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50], padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  composer: { backgroundColor: colors.white, borderRadius: 10, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: colors.gray[200] },
  input: { borderWidth: 1, borderColor: colors.gray[200], borderRadius: 8, padding: 10, fontSize: 14, textAlignVertical: "top", minHeight: 70 },
  postBtn: { backgroundColor: colors.primary, paddingVertical: 10, borderRadius: 8, alignItems: "center", marginTop: 10 },
  postBtnDisabled: { opacity: 0.5 },
  postBtnText: { color: colors.white, fontWeight: "600" },
  hint: { fontSize: 11, color: colors.gray[400], marginTop: 6 },
  empty: { alignItems: "center", paddingVertical: 60 },
  emptyText: { color: colors.gray[400], marginTop: 12 },
  card: { backgroundColor: colors.white, borderRadius: 10, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: colors.gray[200] },
  postHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, justifyContent: "center", alignItems: "center" },
  avatarText: { color: colors.white, fontWeight: "bold", fontSize: 16 },
  userName: { fontSize: 14, fontWeight: "600", color: colors.gray[900] },
  postDate: { fontSize: 11, color: colors.gray[400] },
  postContent: { fontSize: 14, color: colors.gray[700], lineHeight: 20 },
  postImage: { width: "100%", height: 200, borderRadius: 8, marginTop: 10 },
  postFooter: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.gray[100] },
  likeCount: { fontSize: 13, color: colors.gray[500] },
});
