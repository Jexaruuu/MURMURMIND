import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { auth, db } from "@/firebase";
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
} from "@expo-google-fonts/poppins";
import { useFonts } from "expo-font";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
  });
  const insets = useSafeAreaInsets();

  if (!fontsLoaded) return null;

  const prettyAuthError = (m: string) => {
    if (/auth\/invalid-email/i.test(m)) return "Invalid email.";
    if (/auth\/email-already-in-use/i.test(m)) return "Email already in use.";
    if (/auth\/weak-password/i.test(m)) return "Password is too weak (use 6+ characters).";
    if (/auth\/network-request-failed/i.test(m)) return "Network error. Check your internet.";
    return "Signup failed. Please try again.";
  };

  const onSignup = async () => {
    if (submitting) return;
    setError("");

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanPass = password;

    if (!cleanName) return setError("Please enter a username.");
    if (!cleanEmail) return setError("Please enter your email.");
    if (!cleanPass) return setError("Please enter your password.");

    setSubmitting(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPass);

      try {
        await updateProfile(cred.user, { displayName: cleanName });
      } catch {}

      await setDoc(doc(db, "users", cred.user.uid), {
        uid: cred.user.uid,
        name: cleanName,
        email: cred.user.email || cleanEmail,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      router.replace({ pathname: "/", params: { anim: "fromRight" } });
    } catch (e: any) {
      setError(prettyAuthError(e?.message || String(e)));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Image
        source={require("@/assets/images/murmurbg.png")}
        style={styles.bg}
        contentFit="cover"
        pointerEvents="none"
      />

      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <ThemedText style={styles.backText}>‹</ThemedText>
        </Pressable>
        <Pressable
          style={[styles.signupPill, styles.signupPillHidden]}
          onPress={() => router.push("/login")}
        >
          <ThemedText style={[styles.signupPillText, { fontFamily: "Poppins_500Medium" }]}>
            LOG IN
          </ThemedText>
        </Pressable>
      </View>

      <View style={styles.centerWrap}>
        <Image
          source={require("@/assets/images/murmurlogowhite.png")}
          style={styles.logo}
        />
        <ThemedText style={[styles.brand, { fontFamily: "Poppins_600SemiBold" }]}>
         
        </ThemedText>
      </View>

      <View style={[styles.sheet, { paddingBottom: 24 + Math.max(insets.bottom, 16) }]}>
        <ThemedText style={[styles.sheetTitle, { fontFamily: "Poppins_500Medium" }]}>
          Create Account
        </ThemedText>

        <View style={styles.form}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Username"
            placeholderTextColor="#9ca3af"
            style={[styles.input, { fontFamily: "Poppins_400Regular" }]}
          />
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor="#9ca3af"
            autoCapitalize="none"
            keyboardType="email-address"
            style={[styles.input, { fontFamily: "Poppins_400Regular" }]}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor="#9ca3af"
            secureTextEntry
            style={[styles.input, { fontFamily: "Poppins_400Regular" }]}
          />

          {!!error && (
            <ThemedText style={{ color: "#ef4444", fontSize: 12, marginTop: -4 }}>
              {error}
            </ThemedText>
          )}

          <Pressable onPress={onSignup} style={styles.loginBtnWrap}>
            <LinearGradient
              colors={["#000000", "#000000"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.loginBtn, submitting && { opacity: 0.7 }]}
            >
              <ThemedText style={[styles.loginLabel, { fontFamily: "Poppins_600SemiBold" }]}>
                {submitting ? "PLEASE WAIT..." : "SIGN UP"}
              </ThemedText>
            </LinearGradient>
          </Pressable>

          <Pressable onPress={() => router.push("/login")} style={styles.secondaryBtn}>
            <ThemedText style={[styles.secondaryText, { fontFamily: "Poppins_600SemiBold" }]}>
              I already have an account
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  bg: { ...StyleSheet.absoluteFillObject },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 72,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  backText: { fontSize: 28, color: "#111" },
  signupPill: {
    paddingHorizontal: 16,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
  },
  signupPillText: { color: "white", fontSize: 12, letterSpacing: 0.5 },
  signupPillHidden: { opacity: 0, width: 0, height: 0, paddingHorizontal: 0 },

  centerWrap: { alignItems: "center", justifyContent: "center", gap: 12, marginTop: -40 },
  logo: { width: 450, height: 450, borderRadius: 9999, marginBottom: -125 },
  brand: { color: "white", letterSpacing: 0.5, marginBottom: 335, fontSize: 30 },

  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 18,
    alignItems: "center",
    gap: 12,
  },
  sheetTitle: { fontSize: 16, marginBottom: 6, color: "#000" },

  form: { width: "100%", gap: 12, maxWidth: 420 },
  input: {
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    color: "#000"
  },

  loginBtnWrap: { width: "100%", borderRadius: 18, overflow: "hidden" },
  loginBtn: { paddingVertical: 14, borderRadius: 18, alignItems: "center" },
  loginLabel: { color: "white", fontSize: 14, letterSpacing: 1 },

  secondaryBtn: {
    width: "100%",
    backgroundColor: "#efefef",
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryText: { color: "#111", fontSize: 14, letterSpacing: 0.5 },
});
