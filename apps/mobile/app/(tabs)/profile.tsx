import { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Image, TouchableOpacity } from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../src/lib/firebase";
import { useAuthStore } from "../../src/store/auth-store";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../src/lib/colors";
import { useRouter } from "expo-router";

interface MemberProfile {
  displayName: string;
  email: string;
  phone: string;
  birthday: string;
  profession: string;
  company: string;
  bloodGroup: string;
  photoURL: string;
  address: string;
  city: string;
}

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) loadProfile();
  }, [user]);

  const loadProfile = async () => {
    try {
      const snap = await getDoc(doc(db, "members", user!.uid));
      if (snap.exists()) {
        setProfile(snap.data() as MemberProfile);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  const data = profile || { displayName: user?.displayName || "", email: user?.email || "" };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {profile?.photoURL ? (
          <Image source={{ uri: profile.photoURL }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={40} color={colors.white} />
          </View>
        )}
        <Text style={styles.name}>{data.displayName}</Text>
        <Text style={styles.email}>{data.email}</Text>
      </View>

      <View style={styles.section}>
        <InfoRow icon="call" label="Phone" value={profile?.phone} />
        <InfoRow icon="calendar" label="Birthday" value={profile?.birthday} />
        <InfoRow icon="briefcase" label="Profession" value={profile?.profession} />
        <InfoRow icon="business" label="Company" value={profile?.company} />
        <InfoRow icon="water" label="Blood Group" value={profile?.bloodGroup} />
        <InfoRow icon="location" label="City" value={profile?.city} />
        <InfoRow icon="home" label="Address" value={profile?.address} />
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out" size={20} color={colors.red[500]} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value?: string }) {
  if (!value) return null;
  return (
    <View style={infoStyles.row}>
      <Ionicons name={icon as any} size={18} color={colors.gray[400]} />
      <View style={infoStyles.content}>
        <Text style={infoStyles.label}>{label}</Text>
        <Text style={infoStyles.value}>{value}</Text>
      </View>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-start", gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.gray[100] },
  content: { flex: 1 },
  label: { fontSize: 12, color: colors.gray[400] },
  value: { fontSize: 14, color: colors.gray[900], marginTop: 2 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { alignItems: "center", paddingVertical: 30, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.gray[200] },
  avatar: { width: 80, height: 80, borderRadius: 40 },
  avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary, justifyContent: "center", alignItems: "center" },
  name: { fontSize: 20, fontWeight: "bold", color: colors.gray[900], marginTop: 12 },
  email: { fontSize: 14, color: colors.gray[500], marginTop: 4 },
  section: { backgroundColor: colors.white, marginTop: 12, paddingHorizontal: 16 },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 24, marginBottom: 40, paddingVertical: 14, marginHorizontal: 16, backgroundColor: colors.white, borderRadius: 10, borderWidth: 1, borderColor: colors.red[500] },
  logoutText: { fontSize: 15, fontWeight: "600", color: colors.red[500] },
});
