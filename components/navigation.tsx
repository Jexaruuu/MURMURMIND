import ProfileMenuSheet from "@/components/profile-menu-sheet";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useUserProfile } from "@/context/user-profile-context";
import { auth } from "@/firebase";
import { Poppins_400Regular, Poppins_600SemiBold } from "@expo-google-fonts/poppins";
import { useFonts } from "expo-font";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
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

const hashStr = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const uniqueTagForUid = (uidLike: string | null | undefined) => {
  const uid = typeof uidLike === "string" ? uidLike.trim() : "";
  if (!uid) return "";
  const a = hashStr(`tagA|${uid}`).toString(36).padStart(6, "0");
  const b = hashStr(`tagB|${uid}`).toString(36).padStart(6, "0");
  return (a + b).slice(0, 8);
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

  useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
  });

  const { profile, avatarSource, avatarCanError, markPhotoBroken } = useUserProfile();

  const uid = auth.currentUser?.uid ? String(auth.currentUser.uid) : null;
  const alias = useMemo(() => aliasForUid(uid), [uid]);

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

      <Pressable onPress={() => setOpen(true)} style={styles.menuBtn}>
        <ThemedText style={styles.menuIcon}>☰</ThemedText>
      </Pressable>

      <ProfileMenuSheet open={open} onClose={() => setOpen(false)} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
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
  menuBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center", alignSelf: "flex-end" },
  menuIcon: { fontSize: 25, color: "#ffffff", fontFamily: "Poppins_400Regular" },
});
