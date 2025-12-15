import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Image } from "expo-image";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <ThemedView style={styles.container}>
      <Image source={require("@/assets/images/murmuricon.png")} style={styles.logo} />
      <ThemedText type="title" style={styles.title}>Create account</ThemedText>
      <View style={styles.form}>
        <TextInput value={name} onChangeText={setName} placeholder="Full name" style={styles.input} />
        <TextInput value={email} onChangeText={setEmail} placeholder="Email" autoCapitalize="none" keyboardType="email-address" style={styles.input} />
        <TextInput value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry style={styles.input} />
        <Pressable style={styles.btn} onPress={() => router.push("/menu")}>
          <ThemedText type="defaultSemiBold" style={styles.btnText}>Sign up</ThemedText>
        </Pressable>
      </View>
      <ThemedText style={styles.switchText}>
        Already have an account? <Link href="/login">Log in</Link>
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, alignItems: "center", justifyContent: "center", gap: 16 },
  logo: { width: 96, height: 96, borderRadius: 16 },
  title: { marginTop: 4 },
  form: { width: "100%", gap: 12, maxWidth: 420 },
  input: { backgroundColor: "white", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, borderWidth: 1, borderColor: "#e5e7eb" },
  btn: { backgroundColor: "#0ea5e9", paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  btnText: { color: "white" },
  switchText: { marginTop: 8 }
});
