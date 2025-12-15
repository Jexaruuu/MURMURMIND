import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Image } from "expo-image";
import { Link, router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

const tiles = [
  { label: "Home", href: "/" },
  { label: "Explore", href: "/(tabs)/explore" },
  { label: "Login", href: "/login" },
  { label: "Sign up", href: "/signup" }
];

export default function Menu() {
  return (
    <ThemedView style={styles.container}>
      <Image source={require("@/assets/images/murmurwelcomebg.png")} style={styles.hero} contentFit="cover" />
      <View style={styles.header}>
        <Image source={require("@/assets/images/murmuricon.png")} style={styles.logo} />
        <ThemedText type="title">Menu</ThemedText>
      </View>
      <View style={styles.grid}>
        {tiles.map((t) => (
          <Pressable key={t.label} style={styles.card} onPress={() => router.push(t.href as any)}>
            <ThemedText type="defaultSemiBold">{t.label}</ThemedText>
          </Pressable>
        ))}
      </View>
      <ThemedText style={styles.links}>
        <Link href="/(tabs)">Open Tabs</Link>
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 16 },
  hero: { position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.08 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 8 },
  logo: { width: 36, height: 36, borderRadius: 8 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 12 },
  card: { flexBasis: "48%", backgroundColor: "white", borderRadius: 16, paddingVertical: 18, alignItems: "center", borderWidth: 1, borderColor: "#e5e7eb" },
  links: { marginTop: "auto", textAlign: "center" }
});
