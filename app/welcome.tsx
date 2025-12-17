import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
} from "@expo-google-fonts/poppins";
import { useFonts } from "expo-font";
import { Image } from "expo-image";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
  });
  const insets = useSafeAreaInsets();

  if (!fontsLoaded) return null;

  return (
    <ThemedView style={styles.container}>
      <Image
        source={require("@/assets/images/murmurbg.png")}
        style={styles.bg}
        contentFit="cover"
        pointerEvents="none"
      />

      <View style={styles.centerWrap}>
        <Image
          source={require("@/assets/images/murmurlogowhite.png")}
          style={styles.logo}
        />
        <ThemedText type="title" style={[styles.brand, styles.font400]}>
        </ThemedText>
      </View>

      <View style={[styles.sheet, { paddingBottom: 24 + Math.max(insets.bottom, 16) }]}>
        <ThemedText style={[styles.sheetTitle, styles.font500]}>Get Started</ThemedText>

        <Pressable style={styles.loginBtn} onPress={() => router.push("/login")}>
          <ThemedText type="defaultSemiBold" style={[styles.loginText, styles.font600]}>
            LOGIN
          </ThemedText>
        </Pressable>

        <Pressable style={styles.signupBtn} onPress={() => router.push("/signup")}>
          <ThemedText type="defaultSemiBold" style={[styles.signupText, styles.font600]}>
            SIGNUP
          </ThemedText>
        </Pressable>
      </View>

      <View style={styles.hiddenForm}>
        <View style={styles.form}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor="#9ca3af"
            style={[styles.input, styles.font400]}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry
            placeholderTextColor="#9ca3af"
            style={[styles.input, styles.font400]}
          />
          <Pressable style={styles.btn} onPress={() => router.push("/login")}>
            <ThemedText type="defaultSemiBold" style={[styles.btnText, styles.font600]}>
              Log in
            </ThemedText>
          </Pressable>
        </View>
        <ThemedText style={[styles.switchText, styles.font400]}>
          New here? <Link href="/signup">Create an account</Link>
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  bg: { ...StyleSheet.absoluteFillObject },
  centerWrap: { alignItems: "center", justifyContent: "center", gap: 12, marginTop: -40 },
  logo: { width: 450, height: 450, borderRadius: 9999, marginBottom: -135 },
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

  loginBtn: {
    width: "100%",
    backgroundColor: "#efefef",
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
  },
  loginText: { color: "#111" },

  signupBtn: {
    width: "100%",
    backgroundColor: "#000000",
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
  },
  signupText: { color: "white" },

  form: { width: "100%", gap: 12, maxWidth: 420 },
  input: {
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  btn: { backgroundColor: "#0ea5e9", paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  btnText: { color: "white" },
  switchText: { marginTop: 8 },
  hiddenForm: { height: 0, opacity: 0, overflow: "hidden" },

  font400: { fontFamily: "Poppins_400Regular" },
  font500: { fontFamily: "Poppins_500Medium" },
  font600: { fontFamily: "Poppins_600SemiBold" },
});
