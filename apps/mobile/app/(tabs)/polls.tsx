import { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import { db } from "../../src/lib/firebase";
import { useAuthStore } from "../../src/store/auth-store";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../src/lib/colors";

interface PollOption {
  text: string;
  votes: number;
}

interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  voters: string[];
  status: string;
  createdAt: string;
}

export default function PollsScreen() {
  const { user } = useAuthStore();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPolls();
  }, []);

  const loadPolls = async () => {
    try {
      const q = query(collection(db, "polls"), where("status", "==", "active"));
      const snap = await getDocs(q);
      setPolls(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Poll)));
    } catch (error) {
      console.error("Error loading polls:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (pollId: string, optionIndex: number) => {
    if (!user) return;
    const poll = polls.find((p) => p.id === pollId);
    if (!poll || poll.voters?.includes(user.uid)) return;

    const newOptions = [...poll.options];
    newOptions[optionIndex] = { ...newOptions[optionIndex], votes: (newOptions[optionIndex].votes || 0) + 1 };
    const newVoters = [...(poll.voters || []), user.uid];

    try {
      await updateDoc(doc(db, "polls", pollId), { options: newOptions, voters: newVoters });
      setPolls((prev) =>
        prev.map((p) => (p.id === pollId ? { ...p, options: newOptions, voters: newVoters } : p))
      );
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  const hasVoted = (poll: Poll) => poll.voters?.includes(user?.uid || "");
  const totalVotes = (poll: Poll) => poll.options.reduce((s, o) => s + (o.votes || 0), 0);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  return (
    <ScrollView style={styles.container}>
      {polls.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="bar-chart-outline" size={48} color={colors.gray[300]} />
          <Text style={styles.emptyText}>No active polls.</Text>
        </View>
      ) : (
        polls.map((poll) => {
          const voted = hasVoted(poll);
          const total = totalVotes(poll);
          return (
            <View key={poll.id} style={styles.card}>
              <Text style={styles.question}>{poll.question}</Text>
              {poll.options.map((opt, idx) => {
                const pct = total > 0 ? Math.round(((opt.votes || 0) / total) * 100) : 0;
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.option, voted && styles.optionVoted]}
                    onPress={() => handleVote(poll.id, idx)}
                    disabled={voted}
                  >
                    {voted && <View style={[styles.optionBar, { width: `${pct}%` }]} />}
                    <Text style={styles.optionText}>{opt.text}</Text>
                    {voted && <Text style={styles.optionPct}>{pct}%</Text>}
                  </TouchableOpacity>
                );
              })}
              <Text style={styles.totalVotes}>{total} vote{total !== 1 ? "s" : ""}</Text>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50], padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { alignItems: "center", paddingVertical: 60 },
  emptyText: { color: colors.gray[400], marginTop: 12 },
  card: { backgroundColor: colors.white, borderRadius: 10, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: colors.gray[200] },
  question: { fontSize: 16, fontWeight: "600", color: colors.gray[900], marginBottom: 14 },
  option: { borderWidth: 1, borderColor: colors.gray[200], borderRadius: 8, padding: 12, marginBottom: 8, flexDirection: "row", justifyContent: "space-between", overflow: "hidden" },
  optionVoted: { borderColor: colors.gray[100] },
  optionBar: { position: "absolute", top: 0, left: 0, bottom: 0, backgroundColor: "#dbeafe", borderRadius: 8 },
  optionText: { fontSize: 14, color: colors.gray[700], zIndex: 1 },
  optionPct: { fontSize: 13, fontWeight: "600", color: colors.primary, zIndex: 1 },
  totalVotes: { fontSize: 12, color: colors.gray[400], marginTop: 4 },
});
