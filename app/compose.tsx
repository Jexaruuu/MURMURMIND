import Navigation from "@/components/navigation";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { auth, db } from "@/firebase";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { addDoc, collection, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

export default function Compose() {
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);

  const max = 280;
  const over = text.length > max;
  const empty = text.trim().length === 0;

  const progress = useMemo(() => Math.min(1, text.length / max), [text.length]);
  const remaining = max - text.length;

  const submitPost = async () => {
    if (posting) return;

    const trimmed = text.trim();
    if (!trimmed || over) return;

    const u = auth.currentUser;
    if (!u) {
      router.replace("/login");
      return;
    }

    setPosting(true);

    try {
      let username =
        (typeof u.displayName === "string" && u.displayName.trim()) ||
        (typeof u.email === "string" && u.email.includes("@") ? u.email.split("@")[0] : "") ||
        "Guest";

      let photoUrl =
        typeof u.photoURL === "string" && u.photoURL.trim() ? u.photoURL.trim() : null;

      const userSnap = await getDoc(doc(db, "users", u.uid));
      if (userSnap.exists()) {
        const d: any = userSnap.data();
        const n = typeof d?.name === "string" ? d.name.trim() : "";
        const p = typeof d?.photoUrl === "string" ? d.photoUrl.trim() : "";
        if (n) username = n;
        if (p) photoUrl = p;
      }

      await addDoc(collection(db, "posts"), {
        uid: u.uid,
        text: trimmed,
        username,
        photoUrl: photoUrl || null,
        createdAt: serverTimestamp(),
      });

      setText("");
      router.back();
    } finally {
      setPosting(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="dark" />

      <Navigation />

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.header}>
          <Pressable style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]} onPress={() => router.back()}>
            <ThemedText style={styles.backText}>‹</ThemedText>
          </Pressable>

          <View style={styles.headerMid}>
            <ThemedText type="title" style={styles.titleBlack}>
              Compose
            </ThemedText>
            <ThemedText style={styles.subtitle}>Share a thought, a win, or a question.</ThemedText>
          </View>

          <View style={styles.headerRightGap} />
        </View>

        <ScrollView contentContainerStyle={styles.contentPad} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.cardTitleWrap}>
                <ThemedText style={styles.cardKicker}>New post</ThemedText>
                <ThemedText type="title" style={styles.cardTitle}>
                  What’s your thoughts?
                </ThemedText>
              </View>

              <View style={styles.counterPill}>
                <ThemedText style={[styles.counterText, over && styles.counterTextOver]}>
                  {remaining >= 0 ? `${remaining} left` : `${Math.abs(remaining)} over`}
                </ThemedText>
              </View>
            </View>

            <View style={[styles.inputWrap, over && styles.inputWrapOver]}>
              <TextInput
                value={text}
                onChangeText={setText}
                placeholder="Write something inspiring..."
                placeholderTextColor="#9ca3af"
                style={styles.input}
                multiline
              />
            </View>

            <View style={styles.metaRow}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
              </View>
              <ThemedText style={[styles.countPlain, over && styles.countOver]}>
                {text.length}/{max}
              </ThemedText>
            </View>

            <View style={styles.actions}>
              <View style={{ flex: 1 }} />

              <Pressable
                style={({ pressed }) => [
                  styles.postBtnBottom,
                  (empty || over || posting) && styles.postBtnDisabled,
                  pressed && !(empty || over || posting) && styles.postBtnPressed,
                ]}
                disabled={empty || over || posting}
                onPress={submitPost}
              >
                <ThemedText style={styles.postLbl}>{posting ? "POSTING..." : "POST"}</ThemedText>
              </Pressable>
            </View>
          </View>

          <View style={styles.tipCard}>
            <View style={styles.tipDot} />
            <ThemedText style={styles.tipText}>
              Keep it short and clear. Posts that feel personal usually connect the most.
            </ThemedText>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },

  container: { flex: 1, backgroundColor: "white" },

  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    backgroundColor: "white",
  },

  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  backBtnPressed: { transform: [{ scale: 0.97 }], shadowOpacity: 0.02 },
  backText: { fontSize: 24, lineHeight: 24, color: "#111" },

  headerMid: { flex: 1 },
  titleBlack: { color: "#111" },
  subtitle: { marginTop: 2, fontSize: 12, color: "#6b7280" },

  headerRightGap: { width: 42, height: 42 },

  contentPad: { paddingHorizontal: 16, paddingBottom: 24, gap: 12 },

  card: {
    backgroundColor: "white",
    borderRadius: 22,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },

  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  cardTitleWrap: { flex: 1 },
  cardKicker: { fontSize: 11, color: "#6b7280", letterSpacing: 0.4, textTransform: "uppercase" },
  cardTitle: { color: "#111", marginTop: 4, fontSize: 18 },

  counterPill: {
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 999,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },
  counterText: { fontSize: 12, color: "#111" },
  counterTextOver: { color: "#b91c1c" },

  inputWrap: {
    marginTop: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fafafa",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputWrapOver: { borderColor: "#fecaca", backgroundColor: "#fff7f7" },

  input: {
    minHeight: 170,
    color: "#111",
    backgroundColor: "transparent",
    borderRadius: 12,
    padding: 0,
    fontSize: 16,
    borderWidth: 0,
    textAlignVertical: "top",
    lineHeight: 22,
  },

  metaRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 10 },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#eef2f7",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  progressFill: { height: 8, borderRadius: 999, backgroundColor: "#111" },

  actions: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 12 },

  countPlain: { fontSize: 12, color: "#6b7280" },
  countOver: { color: "#b91c1c", fontWeight: "600" },

  postBtnBottom: {
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 14,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#000000",
  },

  postBtnPressed: { transform: [{ scale: 0.99 }], opacity: 0.92 },

  postLbl: { color: "white", fontSize: 12, letterSpacing: 0.6, textTransform: "uppercase" },
  postBtnDisabled: { backgroundColor: "#9ca3af", borderColor: "#9ca3af" },

  tipCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 12,
    borderRadius: 18,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  tipDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#111", marginTop: 4 },
  tipText: { flex: 1, fontSize: 12, lineHeight: 18, color: "#475569" },
});
