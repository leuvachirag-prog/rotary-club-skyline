import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../src/lib/firebase";
import { useRouter } from "expo-router";
import { colors } from "../src/lib/colors";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/(tabs)");
    } catch (err: any) {
      if (err.code === "auth/invalid-credential") {
        setError("Invalid email or password.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Try again later.");
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View style={styles.header}>
        <Text style={styles.logo}>RC</Text>
        <Text style={styles.clubName}>Rotary Club of Ahmedabad</Text>
        <Text style={styles.skyline}>Skyline</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.title}>Sign In</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="your@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
        />

        <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleLogin} disabled={loading}>
          <Text style={styles.btnText}>{loading ? "Signing In..." : "Sign In"}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  header: { backgroundColor: colors.primary, paddingTop: 80, paddingBottom: 40, alignItems: "center" },
  logo: { fontSize: 36, fontWeight: "bold", color: colors.white },
  clubName: { fontSize: 18, fontWeight: "600", color: colors.white, marginTop: 8 },
  skyline: { fontSize: 14, color: "#93c5fd", marginTop: 2 },
  form: { padding: 24, marginTop: -20, backgroundColor: colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, flex: 1 },
  title: { fontSize: 22, fontWeight: "bold", color: colors.gray[900], marginBottom: 20 },
  error: { backgroundColor: "#fef2f2", color: colors.red[600], padding: 10, borderRadius: 8, fontSize: 13, marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "600", color: colors.gray[700], marginBottom: 6 },
  input: { borderWidth: 1, borderColor: colors.gray[200], borderRadius: 10, padding: 12, fontSize: 15, marginBottom: 16 },
  btn: { backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 10, alignItems: "center", marginTop: 8 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: colors.white, fontSize: 16, fontWeight: "600" },
});
