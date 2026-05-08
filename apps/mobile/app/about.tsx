import { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Image, Linking, TouchableOpacity } from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../src/lib/firebase";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../src/lib/colors";
import { Stack } from "expo-router";

interface ClubInfo {
  clubName: string;
  vision: string;
  mission: string;
  presidentName: string;
  presidentPhoto: string;
  presidentMessage: string;
  meetingDay: string;
  meetingTime: string;
  meetingVenue: string;
  contactEmail: string;
  contactPhone: string;
}

export default function AboutScreen() {
  const [info, setInfo] = useState<ClubInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInfo();
  }, []);

  const loadInfo = async () => {
    try {
      const snap = await getDoc(doc(db, "settings", "clubInfo"));
      if (snap.exists()) setInfo(snap.data() as ClubInfo);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  if (!info) {
    return (
      <>
        <Stack.Screen options={{ headerShown: true, title: "About Club" }} />
        <View style={styles.center}><Text style={styles.emptyText}>Club info not available yet.</Text></View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: "About Club" }} />
      <ScrollView style={styles.container}>
        {info.vision && (
          <View style={styles.card}>
            <View style={styles.iconRow}>
              <Ionicons name="eye" size={20} color={colors.primary} />
              <Text style={styles.cardLabel}>Vision</Text>
            </View>
            <Text style={styles.cardText}>{info.vision}</Text>
          </View>
        )}

        {info.mission && (
          <View style={styles.card}>
            <View style={styles.iconRow}>
              <Ionicons name="flag" size={20} color={colors.primary} />
              <Text style={styles.cardLabel}>Mission</Text>
            </View>
            <Text style={styles.cardText}>{info.mission}</Text>
          </View>
        )}

        {info.presidentName && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>President</Text>
            <View style={styles.presidentRow}>
              {info.presidentPhoto ? (
                <Image source={{ uri: info.presidentPhoto }} style={styles.presidentPhoto} />
              ) : (
                <View style={styles.presidentPlaceholder}>
                  <Ionicons name="person" size={24} color={colors.white} />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.presidentName}>{info.presidentName}</Text>
                {info.presidentMessage && <Text style={styles.presidentMsg}>"{info.presidentMessage}"</Text>}
              </View>
            </View>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Meeting Details</Text>
          {info.meetingDay && <InfoItem icon="calendar" text={info.meetingDay} />}
          {info.meetingTime && <InfoItem icon="time" text={info.meetingTime} />}
          {info.meetingVenue && <InfoItem icon="location" text={info.meetingVenue} />}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Contact</Text>
          {info.contactPhone && (
            <TouchableOpacity onPress={() => Linking.openURL(`tel:${info.contactPhone}`)}>
              <InfoItem icon="call" text={info.contactPhone} />
            </TouchableOpacity>
          )}
          {info.contactEmail && (
            <TouchableOpacity onPress={() => Linking.openURL(`mailto:${info.contactEmail}`)}>
              <InfoItem icon="mail" text={info.contactEmail} />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </>
  );
}

function InfoItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.infoItem}>
      <Ionicons name={icon as any} size={16} color={colors.gray[400]} />
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50], padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { color: colors.gray[400] },
  card: { backgroundColor: colors.white, borderRadius: 10, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.gray[200] },
  iconRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  cardLabel: { fontSize: 14, fontWeight: "600", color: colors.gray[700] },
  cardText: { fontSize: 14, color: colors.gray[600], lineHeight: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: colors.gray[900], marginBottom: 12 },
  presidentRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  presidentPhoto: { width: 60, height: 60, borderRadius: 30 },
  presidentPlaceholder: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.primary, justifyContent: "center", alignItems: "center" },
  presidentName: { fontSize: 16, fontWeight: "600", color: colors.gray[900] },
  presidentMsg: { fontSize: 13, color: colors.gray[500], fontStyle: "italic", marginTop: 4 },
  infoItem: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 6 },
  infoText: { fontSize: 14, color: colors.gray[600] },
});
