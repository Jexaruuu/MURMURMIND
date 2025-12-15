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

export default function Login() {
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
        <Pressable style={styles.signupPill} onPress={() => router.push("/signup")}>
          <ThemedText style={[styles.signupPillText, { fontFamily: "Poppins_500Medium" }]}>SIGN UP</ThemedText>
        </Pressable>
      </View>

      <View style={styles.centerWrap}>
        <AnimatedImage
          source={require("@/assets/images/murmuricon.png")}
          style={[styles.logo, { transform: [{ rotate: spin }] }]}
        />
        <ThemedText style={[styles.brand, { fontFamily: "Poppins_600SemiBold" }]}>Murmurmind</ThemedText>
      </View>

      <View style={styles.panelWrap}>
        <View style={[styles.panel, { paddingBottom: 24 + Math.max(insets.bottom, 12) }]}>
          <Image source={require("@/assets/images/murmurbg.png")} style={styles.panelPattern} contentFit="cover" />
          <LinearGradient colors={["rgba(0,0,0,0.55)", "rgba(0,0,0,1)"]} style={StyleSheet.absoluteFillObject} />
          <View style={styles.panelInner}>
            <ThemedText style={[styles.welcome, { fontFamily: "Poppins_600SemiBold" }]}>Welcome Back</ThemedText>
            <ThemedText style={[styles.sub, { fontFamily: "Poppins_400Regular" }]}>Enter your details below</ThemedText>

            <View style={styles.field}>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email Address"
                placeholderTextColor="#6b7280"
                autoCapitalize="none"
                keyboardType="email-address"
                style={[styles.input, { fontFamily: "Poppins_400Regular" }]}
              />
            </View>

            <View style={styles.field}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor="#6b7280"
                secureTextEntry
                style={[styles.input, { fontFamily: "Poppins_400Regular" }]}
              />
            </View>

            <Pressable onPress={() => router.push("/menu")} style={styles.loginBtnWrap}>
              <LinearGradient
                colors={["#5a5a5a", "#5a5a5a"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.loginGradient}
              >
                <ThemedText style={[styles.loginLabel, { fontFamily: "Poppins_600SemiBold" }]}>SIGNUP</ThemedText>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  bg: { ...StyleSheet.absoluteFillObject, opacity: 0 },
  header: { position: "absolute", top: 0, left: 0, right: 0, height: 72, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16 },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  backText: { fontSize: 28, color: "#111" },
  signupPill: { paddingHorizontal: 16, height: 32, borderRadius: 16, backgroundColor: "#111", alignItems: "center", justifyContent: "center" },
  signupPillText: { color: "white", fontSize: 12, letterSpacing: 0.5 },

  centerWrap: { alignItems: "center", marginTop: 96, marginBottom: 12 },
  logo: { width: 84, height: 84, borderRadius: 42, marginBottom: 10 },
  brand: { fontSize: 20, color: "#111" },

  panelWrap: { flex: 1, justifyContent: "flex-end" },
  panel: { marginHorizontal: 12, borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: "hidden", backgroundColor: "#000" },
  panelPattern: { ...StyleSheet.absoluteFillObject, opacity: 0.22 },
  panelInner: { paddingHorizontal: 24, paddingTop: 28, gap: 16 },

  welcome: { fontSize: 28, color: "white", textAlign: "left" },
  sub: { fontSize: 13, color: "#d1d5db", marginTop: -4 },

  field: { marginTop: 12 },
  input: { backgroundColor: "white", color: "#111", borderRadius: 14, paddingHorizontal: 18, paddingVertical: 14, borderWidth: 0, shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 3 },

  loginBtnWrap: { marginTop: 18, borderRadius: 16, overflow: "hidden" },
  loginGradient: { paddingVertical: 14, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  loginLabel: { color: "white", fontSize: 14, letterSpacing: 1 }
});
