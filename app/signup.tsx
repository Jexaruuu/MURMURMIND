import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
} from "@expo-google-fonts/poppins";
import { useFonts } from "expo-font";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, StyleSheet, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AnimatedImage = Animated.createAnimatedComponent(Image);

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
  });
  const insets = useSafeAreaInsets();

  const spinVal = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const spinAnim = Animated.timing(spinVal, {
      toValue: 1,
      duration: 6000,
      easing: Easing.linear,
      useNativeDriver: true,
    });
    Animated.loop(spinAnim, { iterations: -1, resetBeforeIteration: true }).start();
  }, [spinVal]);

  if (!fontsLoaded) return null;

  const spin = spinVal.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <ThemedView style={styles.container}>
      <Image source={require("@/assets/images/murmurbg.png")} style={styles.bg} contentFit="cover" pointerEvents="none" />

      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <ThemedText style={styles.backText}>‹</ThemedText>
        </Pressable>
        <Pressable style={[styles.signupPill, styles.signupPillHidden]} onPress={() => router.push("/login")}>
          <ThemedText style={[styles.signupPillText, { fontFamily: "Poppins_500Medium" }]}>LOG IN</ThemedText>
        </Pressable>
      </View>

      <View style={styles.centerWrap}>
        <AnimatedImage
          source={require("@/assets/images/murmuricon.png")}
          style={[styles.logo, { transform: [{ rotate: spin }] }]}
        />
        <ThemedText style={[styles.brand, { fontFamily: "Poppins_600SemiBold" }]}>Murmurmind</ThemedText>
      </View>

      <View style={[styles.sheet, { paddingBottom: 24 + Math.max(insets.bottom, 16) }]}>
        <ThemedText style={[styles.sheetTitle, { fontFamily: "Poppins_500Medium" }]}>Create Account</ThemedText>

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

          <Pressable onPress={() => router.push("/menu")} style={styles.loginBtnWrap}>
            <LinearGradient
              colors={["#595959", "#595959"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.loginBtn}
            >
              <ThemedText style={[styles.loginLabel, { fontFamily: "Poppins_600SemiBold" }]}>SIGN UP</ThemedText>
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
  header: { position: "absolute", top: 0, left: 0, right: 0, height: 72, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16 },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  backText: { fontSize: 28, color: "#111" },
  signupPill: { paddingHorizontal: 16, height: 32, borderRadius: 16, backgroundColor: "#111", alignItems: "center", justifyContent: "center" },
  signupPillText: { color: "white", fontSize: 12, letterSpacing: 0.5 },
  signupPillHidden: { opacity: 0, width: 0, height: 0, paddingHorizontal: 0 },

  centerWrap: { alignItems: "center", justifyContent: "center", gap: 12, marginTop: -40 },
  logo: { width: 250, height: 250, borderRadius: 9999, marginBottom: -70 },
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
    gap: 12
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
    borderColor: "#e5e7eb"
  },

  loginBtnWrap: { width: "100%", borderRadius: 18, overflow: "hidden" },
  loginBtn: { paddingVertical: 14, borderRadius: 18, alignItems: "center" },
  loginLabel: { color: "white", fontSize: 14, letterSpacing: 1 },

  secondaryBtn: {
    width: "100%",
    backgroundColor: "#efefef",
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center"
  },
  secondaryText: { color: "#111", fontSize: 14, letterSpacing: 0.5 }
});
