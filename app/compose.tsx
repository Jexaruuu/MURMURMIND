import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";

export default function Compose() {
  const [text, setText] = useState("");
  const max = 280;
  const over = text.length > max;
  const empty = text.trim().length === 0;

  const addTag = (t: string) => {
    setText((prev) => (prev ? prev + " " + t : t));
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]} onPress={() => router.back()}>
          <ThemedText style={styles.backText}>‹</ThemedText>
        </Pressable>
        <ThemedText type="title" style={styles.titleBlack}>Compose</ThemedText>
        <Pressable style={[styles.postBtn, styles.headerPostHidden, (empty || over) && styles.postBtnDisabled]} onPress={() => router.back()}>
          <ThemedText style={styles.postLbl}>Post</ThemedText>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.contentPad} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <ThemedText type="title" style={styles.cardTitle}>What’s on your mind?</ThemedText>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Write something inspiring..."
            placeholderTextColor="#d1d5db"
            style={styles.input}
            multiline
          />
          <View style={styles.divider} />
          <View style={styles.actions}>
            <Pressable style={styles.circleBtn}>
              <ThemedText style={styles.circleIcon}>📎</ThemedText>
            </Pressable>
            <Pressable style={styles.circleBtn}>
              <ThemedText style={styles.circleIcon}>🙂</ThemedText>
            </Pressable>
            <View style={{ flex: 1 }} />
            <ThemedText style={[styles.countPlain, over && styles.countOver]}>{text.length}/{max}</ThemedText>
            <Pressable style={[styles.postBtn, (empty || over) && styles.postBtnDisabled]} onPress={() => router.back()}>
              <ThemedText style={styles.postLbl}>Post</ThemedText>
            </Pressable>
          </View>
        </View>

        <ThemedText style={styles.sectionTitle}>Quick tags</ThemedText>
        <View style={styles.chipsRow}>
          <Pressable style={styles.chip} onPress={() => addTag("#Inspiration")}>
            <ThemedText style={styles.chipText}>#Inspiration</ThemedText>
          </Pressable>
          <Pressable style={styles.chip} onPress={() => addTag("#Grateful")}>
            <ThemedText style={styles.chipText}>#Grateful</ThemedText>
          </Pressable>
          <Pressable style={styles.chip} onPress={() => addTag("#Win")}>
            <ThemedText style={styles.chipText}>#Win</ThemedText>
          </Pressable>
          <Pressable style={styles.chip} onPress={() => addTag("#Question")}>
            <ThemedText style={styles.chipText}>#Question</ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 28, backgroundColor: "white" },
  header: { height: 56, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }
  },
  backBtnPressed: { transform: [{ scale: 0.96 }], shadowOpacity: 0.02 },
  backText: { fontSize: 24, lineHeight: 24, color: "#111" },
  titleBlack: { color: "#111" },
  postBtn: { paddingHorizontal: 16, height: 32, borderRadius: 10, backgroundColor: "#111", alignItems: "center", justifyContent: "center", marginLeft: 8 },
  postLbl: { color: "white", fontSize: 12, letterSpacing: 0.5 },

  contentPad: { paddingHorizontal: 16, paddingBottom: 24, gap: 12 },

  card: {
    backgroundColor: "#0a0a0a",
    borderRadius: 20,
    padding: 16,
    marginTop: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 }
  },
  cardTitle: { color: "white", textAlign: "center", marginBottom: 8, fontSize: 18, paddingRight: 28 },

  input: {
    minHeight: 180,
    color: "white",
    backgroundColor: "transparent",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 0,
    textAlignVertical: "top"
  },

  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.1)", marginTop: 8, marginBottom: 10 },

  actions: { flexDirection: "row", alignItems: "center", gap: 10 },
  circleBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "white", alignItems: "center", justifyContent: "center" },
  circleIcon: { color: "#111", fontSize: 16 },

  countPlain: { fontSize: 12, color: "#cbd5e1" },
  countOver: { color: "#fca5a5", fontWeight: "600" },

  sectionTitle: { marginTop: 6, marginBottom: 2, fontSize: 12, color: "#6b7280", letterSpacing: 0.3 },

  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    backgroundColor: "white",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 10
  },

  chip: {
    paddingHorizontal: 12,
    height: 30,
    borderRadius: 15,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center"
  },
  chipText: { fontSize: 12, color: "#111" },

  postBtnDisabled: { backgroundColor: "#9ca3af" },
  headerPostHidden: { opacity: 0, width: 0, paddingHorizontal: 0 }
});
