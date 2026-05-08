import { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Image, TouchableOpacity, Linking } from "react-native";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../src/lib/firebase";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../src/lib/colors";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  imageURL?: string;
  formId?: string;
}

export default function EventsScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const q = query(collection(db, "events"), orderBy("date", "desc"));
      const snap = await getDocs(q);
      setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Event)));
    } catch (error) {
      console.error("Error loading events:", error);
    } finally {
      setLoading(false);
    }
  };

  const isUpcoming = (date: string) => new Date(date) >= new Date();

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  return (
    <ScrollView style={styles.container}>
      {events.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="calendar-outline" size={48} color={colors.gray[300]} />
          <Text style={styles.emptyText}>No events yet.</Text>
        </View>
      ) : (
        events.map((event) => (
          <View key={event.id} style={styles.card}>
            {event.imageURL && (
              <Image source={{ uri: event.imageURL }} style={styles.image} />
            )}
            <View style={styles.cardBody}>
              <View style={styles.row}>
                <Text style={styles.title}>{event.title}</Text>
                <View style={[styles.badge, isUpcoming(event.date) ? styles.badgeGreen : styles.badgeGray]}>
                  <Text style={styles.badgeText}>{isUpcoming(event.date) ? "Upcoming" : "Past"}</Text>
                </View>
              </View>
              {event.description ? <Text style={styles.desc} numberOfLines={2}>{event.description}</Text> : null}
              <View style={styles.meta}>
                <View style={styles.metaItem}>
                  <Ionicons name="calendar" size={14} color={colors.gray[400]} />
                  <Text style={styles.metaText}>
                    {new Date(event.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                  </Text>
                </View>
                {event.time ? (
                  <View style={styles.metaItem}>
                    <Ionicons name="time" size={14} color={colors.gray[400]} />
                    <Text style={styles.metaText}>{event.time}</Text>
                  </View>
                ) : null}
                {event.venue ? (
                  <View style={styles.metaItem}>
                    <Ionicons name="location" size={14} color={colors.gray[400]} />
                    <Text style={styles.metaText}>{event.venue}</Text>
                  </View>
                ) : null}
              </View>
              {event.formId && (
                <TouchableOpacity style={styles.registerBtn}>
                  <Text style={styles.registerText}>Register</Text>
                </TouchableOpacity>
              )}
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
  empty: { alignItems: "center", paddingVertical: 60 },
  emptyText: { color: colors.gray[400], marginTop: 12 },
  card: { backgroundColor: colors.white, borderRadius: 10, marginBottom: 14, overflow: "hidden", borderWidth: 1, borderColor: colors.gray[200] },
  image: { width: "100%", height: 160 },
  cardBody: { padding: 14 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontSize: 16, fontWeight: "600", color: colors.gray[900], flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, marginLeft: 8 },
  badgeGreen: { backgroundColor: "#dcfce7" },
  badgeGray: { backgroundColor: colors.gray[100] },
  badgeText: { fontSize: 11, fontWeight: "600" },
  desc: { fontSize: 13, color: colors.gray[600], marginTop: 6 },
  meta: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 10 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12, color: colors.gray[500] },
  registerBtn: { marginTop: 12, backgroundColor: colors.primary, paddingVertical: 10, borderRadius: 8, alignItems: "center" },
  registerText: { color: colors.white, fontWeight: "600", fontSize: 14 },
});
