import ProfileMenuSheet from "@/components/profile-menu-sheet";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useUserProfile } from "@/context/user-profile-context";
import { auth, db } from "@/firebase";
import { Poppins_400Regular, Poppins_600SemiBold } from "@expo-google-fonts/poppins";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { collection, doc, limit, onSnapshot, orderBy, query, serverTimestamp, writeBatch } from "firebase/firestore";
import { useEffect, useMemo, useRef, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ALIAS_ADJ = [
  "Skibidi",
  "Sigma",
  "Rizz",
  "Based",
  "Sus",
  "NoCap",
  "Bussin",
  "Delulu",
  "NPC",
  "Ohio",
  "MainCharacter",
  "VibeCheck",
  "GlowUp",
  "Slay",
  "Goated",
  "Yeet",
  "Lowkey",
  "Highkey",
  "RentFree",
  "Core",
  "Giga",
  "Chad",
  "Aura",
  "Drip",
  "Flex",
  "W",
  "L",
  "IYKYK",
  "POV",
  "Lore",
  "Tea",
  "Canon",
  "Ratio",
  "Cringe",
  "Ick",
  "Feral",
  "Unhinged",
  "Chaotic",
  "LockedIn",
  "Cooked",
  "Banger",
  "Fire",
  "GG",
  "AFK",
  "IRL",
  "TouchGrass",
  "Lag",
  "Ping",
  "Glitchy",
  "Pixel",
  "Neuron",
  "Synapse",
  "Cortex",
  "Brainrot",
  "GoblinMode",
  "Yap",
  "Bet",
  "Bruh",
  "Sheesh",
  "Mood",
  "Stan",
  "Simp",
  "Ate",
  "Vibin",
  "Clapped",
  "Woke",
  "Zoomer",
  "ChronicallyOnline",
  "TikTokified",
  "Algorithmic",
];

const ALIAS_NOUN = [
  "Rizzler",
  "NPC",
  "Yapper",
  "Viber",
  "Enjoyer",
  "Gremlin",
  "Goblin",
  "Legend",
  "MemeLord",
  "ChaosAgent",
  "Bestie",
  "Captain",
  "Hero",
  "Villain",
  "Streamer",
  "Coder",
  "Wizard",
  "Ninja",
  "Knight",
  "Pirate",
  "Robot",
  "Alien",
  "Cyborg",
  "Glitch",
  "Byte",
  "Pixel",
  "Sprite",
  "Comet",
  "Meteor",
  "Vortex",
  "Portal",
  "Dream",
  "Thought",
  "Idea",
  "Spark",
  "Signal",
  "Neuron",
  "Synapse",
  "Cortex",
  "Panda",
  "Otter",
  "Fox",
  "Koala",
  "Cat",
  "Dolphin",
  "Bunny",
  "Turtle",
  "Hedgehog",
  "Chick",
  "Raccoon",
  "Penguin",
  "Tiger",
  "Sloth",
  "Llama",
  "Bear",
  "Sparrow",
  "Pup",
  "Kitten",
  "Dragon",
  "Goat",
  "Bard",
  "Gamer",
  "Snack",
  "Vibe",
  "Timeline",
  "PlotTwist",
  "SideQuest",
  "HotTake",
  "MoodBoard",
];

type NotifItem = {
  id: string;
  type: "reaction" | "reply";
  createdAtMs: number;
  readAtMs?: number | null;
};

const hashStr = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const aliasForUid = (uidLike: string | null | undefined) => {
  const uid = typeof uidLike === "string" ? uidLike.trim() : "";
  if (!uid) return "Brainrot Guest";
  const seed = hashStr(`alias|${uid}`);
  const a = ALIAS_ADJ[seed % ALIAS_ADJ.length];
  const n = ALIAS_NOUN[Math.floor(seed / ALIAS_ADJ.length) % ALIAS_NOUN.length];
  return `${a} ${n}`;
};

export default function Navigation() {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
  });

  const { profile, avatarSource, avatarCanError, markPhotoBroken } = useUserProfile();

  const uid = auth.currentUser?.uid ? String(auth.currentUser.uid) : null;
  const alias = useMemo(() => aliasForUid(uid), [uid]);

  const [nowMs, setNowMs] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const whenLabel = (ms: number | null) => {
    if (!ms) return "";
    let diff = nowMs - ms;
    if (diff < 0) diff = 0;

    const sRaw = Math.floor(diff / 1000);
    const s = Math.max(1, sRaw);
    if (s < 60) return `${s}s`;

    const m = Math.floor(sRaw / 60);
    if (m < 60) return `${m}m`;

    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;

    const d = Math.floor(h / 24);
    if (d < 7) return `${d}d`;

    const w = Math.floor(d / 7);
    return `${w}w`;
  };

  const [notifs, setNotifs] = useState<NotifItem[]>([]);
  const unreadCount = useMemo(() => notifs.filter((n) => !n.readAtMs).length, [notifs]);

  const lastMarkRef = useRef(0);

  useEffect(() => {
    if (!uid) {
      setNotifs([]);
      return;
    }

    const q = query(collection(db, "users", uid, "notifications"), orderBy("createdAtMs", "desc"), limit(30));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const next: NotifItem[] = snap.docs
          .map((d) => {
            const data = d.data() as Record<string, unknown>;

            const type: NotifItem["type"] = data?.type === "reply" ? "reply" : "reaction";
            const createdAtMs: number = typeof data?.createdAtMs === "number" ? (data as any).createdAtMs : 0;
            const readAtMs: number | null = typeof data?.readAtMs === "number" ? (data as any).readAtMs : null;

            return { id: d.id, type, createdAtMs, readAtMs };
          })
          .filter((x) => x.createdAtMs > 0);

        setNotifs(next);
      },
      () => setNotifs([])
    );

    return () => unsub();
  }, [uid]);

  useEffect(() => {
    if (!uid) return;
    if (!notifOpen) return;
    const now = Date.now();
    if (now - lastMarkRef.current < 400) return;
    lastMarkRef.current = now;

    const unread = notifs.filter((n) => !n.readAtMs).slice(0, 50);
    if (!unread.length) return;

    const batch = writeBatch(db);
    for (const n of unread) {
      batch.set(
        doc(db, "users", uid, "notifications", n.id),
        { readAt: serverTimestamp(), readAtMs: Date.now() } as any,
        { merge: true }
      );
    }

    batch.commit().catch(() => {});
  }, [notifOpen, notifs, uid]);

  return (
    <ThemedView style={[styles.topBar, { paddingTop: Math.max(insets.top, 12) + 10 }]}>
      <StatusBar style="light" />

      <View style={styles.userWrap}>
        <Image
          source={avatarSource}
          style={styles.userAvatar}
          contentFit="cover"
          onError={() => {
            if (avatarCanError) markPhotoBroken();
          }}
        />
        <View style={styles.nameRow}>
          <ThemedText style={styles.userName} numberOfLines={1}>
            {profile.username}
          </ThemedText>
          <ThemedText style={styles.userSep}>|</ThemedText>
          <ThemedText style={styles.userAlias} numberOfLines={1}>
            {alias}
          </ThemedText>
        </View>
      </View>

      <View style={styles.rightActions}>
        <Pressable onPress={() => setNotifOpen(true)} style={styles.iconBtn}>
          <Ionicons name="notifications-outline" size={22} color="#fff" />
          {unreadCount > 0 ? (
            <View style={styles.badge}>
              <ThemedText style={styles.badgeText}>{unreadCount > 99 ? "99+" : String(unreadCount)}</ThemedText>
            </View>
          ) : null}
        </Pressable>

        <Pressable onPress={() => setOpen(true)} style={styles.menuBtn}>
          <ThemedText style={styles.menuIcon}>☰</ThemedText>
        </Pressable>
      </View>

      <ProfileMenuSheet open={open} onClose={() => setOpen(false)} />

      <Modal transparent visible={notifOpen} animationType="fade" onRequestClose={() => setNotifOpen(false)} statusBarTranslucent presentationStyle="overFullScreen">
        <View style={styles.notifWrap}>
          <Pressable style={styles.notifBackdrop} onPress={() => setNotifOpen(false)} />
          <View style={styles.notifCard}>
            <View style={styles.notifHead}>
              <ThemedText style={styles.notifTitle}>Notifications</ThemedText>
              <Pressable style={({ pressed }) => [styles.notifClose, pressed && styles.pressed]} onPress={() => setNotifOpen(false)}>
                <ThemedText style={styles.notifCloseText}>✕</ThemedText>
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.notifList}>
              {notifs.length === 0 ? (
                <View style={styles.notifEmpty}>
                  <ThemedText style={styles.notifEmptyTitle}>No notifications yet</ThemedText>
                  <ThemedText style={styles.notifEmptyText}>When someone reacts or replies, it will show here.</ThemedText>
                </View>
              ) : (
                notifs.map((n) => {
                  const isReply = n.type === "reply";
                  const iconName = isReply ? "chatbubble-ellipses" : "heart";
                  const iconColor = isReply ? "#111" : "#EC4899";
                  const label = isReply ? "Someone reply on your thoughts." : "Someone react on your thoughts.";
                  const time = whenLabel(n.createdAtMs);

                  return (
                    <View key={n.id} style={[styles.notifItem, !n.readAtMs && styles.notifItemUnread]}>
                      <View style={styles.notifIconWrap}>
                        <Ionicons name={iconName as any} size={18} color={iconColor} />
                      </View>
                      <View style={styles.notifBody}>
                        <ThemedText style={styles.notifText}>{label}</ThemedText>
                        {!!time && <ThemedText style={styles.notifTime}>{time}</ThemedText>}
                      </View>
                    </View>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },

  topBar: {
    paddingHorizontal: 12,
    paddingBottom: 10,
    backgroundColor: "#000000",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  userWrap: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1, minWidth: 0 },
  userAvatar: { width: 25, height: 25, borderRadius: 8, backgroundColor: "#e5e7eb" },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1, minWidth: 0 },
  userName: { fontSize: 16, color: "#ffffff", fontFamily: "Poppins_600SemiBold", maxWidth: 170 },
  userSep: { fontSize: 14, color: "rgba(255,255,255,0.65)", fontFamily: "Poppins_400Regular" },
  userAlias: { fontSize: 12, color: "rgba(255,255,255,0.8)", fontFamily: "Poppins_400Regular", flex: 1, minWidth: 0 },

  rightActions: { flexDirection: "row", alignItems: "center", gap: 6 },
  iconBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center", position: "relative" },

  badge: {
    position: "absolute",
    top: 6,
    right: 6,
    minWidth: 16,
    height: 16,
    borderRadius: 999,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: { color: "white", fontSize: 10, fontFamily: "Poppins_600SemiBold" },

  menuBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center", alignSelf: "flex-end" },
  menuIcon: { fontSize: 25, color: "#ffffff", fontFamily: "Poppins_400Regular" },

  notifWrap: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 14 },
  notifBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.42)" },

  notifCard: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 22,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    maxHeight: 520,
  },

  notifHead: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  notifTitle: { flex: 1, fontSize: 16, color: "#111", letterSpacing: 0.2, fontFamily: "Poppins_600SemiBold" },
  notifClose: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  notifCloseText: { fontSize: 14, color: "#111", fontFamily: "Poppins_600SemiBold" },

  notifList: { paddingBottom: 8, gap: 10 },
  notifEmpty: { paddingVertical: 14 },
  notifEmptyTitle: { fontSize: 13, color: "#111", fontFamily: "Poppins_600SemiBold" },
  notifEmptyText: { marginTop: 6, fontSize: 12, color: "#6b7280", lineHeight: 18, fontFamily: "Poppins_400Regular" },

  notifItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 12,
    backgroundColor: "white",
  },
  notifItemUnread: { backgroundColor: "#f9fafb" },
  notifIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 14,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },
  notifBody: { flex: 1, minWidth: 0 },
  notifText: { fontSize: 13, color: "#111", lineHeight: 18, fontFamily: "Poppins_600SemiBold" },
  notifTime: { marginTop: 4, fontSize: 12, color: "#6b7280", fontFamily: "Poppins_400Regular" },
});
