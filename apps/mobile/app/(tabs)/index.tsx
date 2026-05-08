import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "../../src/lib/firebase";
import { useAuthStore } from "../../src/store/auth-store";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../src/lib/colors";

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: string;
  createdAt: string;
}

export default function HomeScreen() {
  const { user, loading: authLoading } = useAuthStore();
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
      return;
    }
    if (user) loadData();
  }, [user, authLoading]);

  const loadData = async () => {
    try {
      const snap = await getDocs(query(collection(db, "announcements"), orderBy("createdAt", "desc"), limit(5)));
      setAnnouncements(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Announcement)));
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const quickLinks = [
    { label: "Events", icon: "calendar" as const, route: "/(tabs)/events" },
    { label: "Forms", icon: "document-text" as const, route: "/forms-list" },
    { label: "Wall", icon: "images" as const, route: "/(tabs)/wall" },
    { label: "Polls", icon: "bar-chart" as const, route: "/(tabs)/polls" },
    { label: "About", icon: "information-circle" as const, route: "/about" },
    { label: "Feedback", icon: "chatbox" as const, route: "/suggestions" },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.welcome}>
        <Text style={styles.welcomeText}>Welcome, {user?.displayName || "Member"}</Text>
        <Text style={styles.clubName}>Rotary Club of Ahmedabad Skyline</Text>
      </View>

      <View style={styles.quickLinksGrid}>
        {quickLinks.map((link) => (
          <TouchableOpacity key={link.label} style={styles.quickLink} onPress={() => router.push(link.route as never)}>
            <Ionicons name={link.icon} size={28} color={colors.primary} />
            <Text style={styles.quickLinkLabel}>{link.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Announcements</Text>
        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : announcements.length === 0 ? (
          <Text style={styles.emptyText}>No announcements yet.</Text>
        ) : (
          announcements.map((a) => (
            <View
              key={a.id}
              style={[styles.announcementCard, a.priority === "urgent" && styles.urgentCard]}
            >
              <View style={styles.announcementHeader}>
                <Text style={styles.announcementTitle}>{a.title}</Text>
                {a.priority !== "normal" && (
                  <View style={[styles.badge, a.priority === "urgent" ? styles.badgeDanger : styles.badgeWarning]}>
                    <Text style={styles.badgeText}>{a.priority}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.announcementContent} numberOfLines={2}>{a.content}</Text>
              <Text style={styles.announcementDate}>
                {new Date(a.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  welcome: { padding: 20, backgroundColor: colors.primary, paddingTop: 10 },
  welcomeText: { fontSize: 22, fontWeight: "bold", color: colors.white },
  clubName: { fontSize: 14, color: "#93c5fd", marginTop: 4 },
  quickLinksGrid: { flexDirection: "row", flexWrap: "wrap", padding: 12 },
  quickLink: {
    width: "33.33%",
    alignItems: "center",
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: colors.gray[100],
  },
  quickLinkLabel: { fontSize: 12, color: colors.gray[600], marginTop: 6 },
  section: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "600", color: colors.gray[900], marginBottom: 12 },
  emptyText: { fontSize: 14, color: colors.gray[400], textAlign: "center", paddingVertical: 20 },
  announcementCard: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  urgentCard: { borderColor: colors.red[500], backgroundColor: "#fef2f2" },
  announcementHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  announcementTitle: { fontSize: 15, fontWeight: "600", color: colors.gray[900], flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  badgeDanger: { backgroundColor: "#fecaca" },
  badgeWarning: { backgroundColor: "#fef3c7" },
  badgeText: { fontSize: 11, fontWeight: "600", textTransform: "capitalize" },
  announcementContent: { fontSize: 13, color: colors.gray[600], marginTop: 6 },
  announcementDate: { fontSize: 11, color: colors.gray[400], marginTop: 6 },
});
