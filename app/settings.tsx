import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

export default function Settings() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <ThemedText style={styles.backText}>‹</ThemedText>
        </Pressable>
        <ThemedText type="title">Settings</ThemedText>
        <View style={{ width: 36 }} />
      </View>
      <View style={styles.body}>
        <ThemedText>Settings screen</ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 12, paddingHorizontal: 16, gap: 12 },
  header: { height: 56, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  backText: { fontSize: 28 },
  body: { paddingTop: 8, gap: 12 }
});
