import { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TextInput, TouchableOpacity } from "react-native";
import { collection, getDocs, addDoc, query, where, orderBy } from "firebase/firestore";
import { db } from "../src/lib/firebase";
import { useAuthStore } from "../src/store/auth-store";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../src/lib/colors";
import { Stack } from "expo-router";

interface Suggestion {
  id: string;
  subject: string;
  message: string;
  type: string;
  status: string;
  adminReply?: string;
  createdAt: string;
}

export default function SuggestionsScreen() {
  const { user } = useAuthStore();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("suggestion");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) loadSuggestions();
  }, [user]);

  const loadSuggestions = async () => {
    try {
      const q = query(collection(db, "suggestions"), where("userId", "==", user!.uid), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setSuggestions(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Suggestion)));
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, "suggestions"), {
        userId: user!.uid,
        userName: user!.displayName,
        subject: subject.trim(),
        message: message.trim(),
        type,
        status: "open",
        createdAt: new Date().toISOString(),
      });
      setSubject("");
      setMessage("");
      loadSuggestions();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const statusColor = (s: string) => {
    if (s === "resolved") return colors.green[500];
    if (s === "in_progress") return colors.yellow[500];
    return colors.gray[400];
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: "Feedback" }} />
      <ScrollView style={styles.container}>
        <View style={styles.form}>
          <TextInput style={styles.input} placeholder="Subject" value={subject} onChangeText={setSubject} />
          <TextInput style={[styles.input, styles.textarea]} placeholder="Your message..." value={message} onChangeText={setMessage} multiline numberOfLines={4} />
          <TouchableOpacity style={styles.btn} onPress={handleSubmit} disabled={submitting}>
            <Text style={styles.btnText}>{submitting ? "Submitting..." : "Submit Feedback"}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Your Submissions</Text>
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : suggestions.length === 0 ? (
          <Text style={styles.emptyText}>No submissions yet.</Text>
        ) : (
          suggestions.map((s) => (
            <View key={s.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{s.subject}</Text>
                <View style={[styles.statusDot, { backgroundColor: statusColor(s.status) }]} />
              </View>
              <Text style={styles.cardMsg}>{s.message}</Text>
              {s.adminReply && (
                <View style={styles.reply}>
                  <Text style={styles.replyLabel}>Admin Reply:</Text>
                  <Text style={styles.replyText}>{s.adminReply}</Text>
                </View>
              )}
              <Text style={styles.cardDate}>
                {new Date(s.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50], padding: 16 },
  form: { backgroundColor: colors.white, borderRadius: 10, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: colors.gray[200] },
  input: { borderWidth: 1, borderColor: colors.gray[200], borderRadius: 8, padding: 10, fontSize: 14, marginBottom: 10 },
  textarea: { textAlignVertical: "top", minHeight: 80 },
  btn: { backgroundColor: colors.primary, paddingVertical: 12, borderRadius: 8, alignItems: "center" },
  btnText: { color: colors.white, fontWeight: "600" },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: colors.gray[900], marginBottom: 12 },
  emptyText: { color: colors.gray[400], textAlign: "center", paddingVertical: 20 },
  card: { backgroundColor: colors.white, borderRadius: 8, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.gray[200] },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { fontSize: 14, fontWeight: "600", color: colors.gray[900], flex: 1 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  cardMsg: { fontSize: 13, color: colors.gray[600], marginTop: 6 },
  reply: { backgroundColor: colors.gray[50], padding: 10, borderRadius: 6, marginTop: 8 },
  replyLabel: { fontSize: 11, fontWeight: "600", color: colors.primary },
  replyText: { fontSize: 13, color: colors.gray[700], marginTop: 4 },
  cardDate: { fontSize: 11, color: colors.gray[400], marginTop: 8 },
});
