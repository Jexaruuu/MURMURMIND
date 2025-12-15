import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

const tiles = [
  { label: "Home", href: "/" },
  { label: "Explore", href: "/(tabs)/explore" },
  { label: "Login", href: "/login" },
  { label: "Sign up", href: "/signup" }
];

const QUOTES = [
  `"Anyone who has never made a mistake has never tried anything new"`,
  `"Start where you are. Use what you have. Do what you can."`,
  `"Small steps every day lead to big results."`,
  `"Dream big, work hard, stay humble."`,
  `"Progress, not perfection."`,
  `"The secret of getting ahead is getting started."`,
  `"Done is better than perfect."`,
  `"Little by little, a little becomes a lot."`,
  `"Make it simple, but significant."`,
  `"Focus on what you can control."`,
  `"One day or day one. You decide."`,
  `"Be the energy you want to attract."`,
  `"Keep going. Everything you need will come."`,
  `"Consistency creates momentum."`,
  `"Action cures fear."`,
  `"Growth begins at the end of your comfort zone."`,
  `"Do something today your future self will thank you for."`,
  `"If it matters, you’ll make time."`,
  `"The best time was yesterday. The next best is now."`,
  `"You don’t have to be perfect to be amazing."`,
  `"Small progress is still progress."`,
  `"Win the morning, win the day."`,
  `"Say yes to your goals and no to your excuses."`,
  `"Be stubborn about goals, flexible about methods."`,
  `"Slow is smooth. Smooth is fast."`,
  `"Do it scared."`,
  `"Show up, even when it’s hard."`,
  `"Discipline is choosing what you want most over what you want now."`,
  `"Work in silence; let success be the noise."`,
  `"Start messy. Learn fast. Improve often."`,
  `"You are what you repeatedly do."`,
  `"Direction is more important than speed."`,
  `"Dreams don’t work unless you do."`,
  `"Better an oops than a what if."`,
  `"Measure progress, not perfection."`,
  `"Think it. Plan it. Do it."`,
  `"Make your habits your superpower."`,
  `"Keep moving; a step is still a step."`,
  `"If you get tired, learn to rest, not quit."`,
  `"Stay patient and trust your journey."`,
  `"Make it happen. Shock everyone."`,
  `"The comeback is always stronger than the setback."`,
  `"Today’s choices are tomorrow’s results."`,
  `"Less talk, more do."`,
  `"You’re allowed to be both a masterpiece and a work in progress."`,
  `"Results > reasons."`,
  `"It’s okay to start over."`,
  `"One more rep."`,
  `"Run your own race."`,
  `"Become the person your goals require."`,
  `"You didn’t come this far to only come this far."`,
  `"Small wins build big confidence."`,
  `"Finish what you start."`,
  `"Ship it."`,
  `"Focus beats talent when talent doesn’t focus."`,
  `"Show your work."`,
  `"Progress is a decision."`,
  `"Do the next right thing."`,
  `"Make your future proud."`,
  `"Your pace is the right pace."`,
  `"Keep it up; you’re leveling up."`,
  `"Learn, unlearn, relearn."`,
  `"Be relentlessly resourceful."`,
  `"Start before you feel ready."`,
  `"Move with purpose."`,
  `"Hard choices, easy life. Easy choices, hard life."`,
  `"Plan the work, work the plan."`,
  `"Create more than you consume."`,
  `"Aim for better, not perfect."`,
  `"One improvement a day."`,
  `"Say no to what doesn’t serve you."`,
  `"Curiosity over judgment."`,
  `"Practice until it’s natural."`,
  `"Stack good days."`,
  `"Do less, but better."`,
  `"Routine is a cheat code."`,
  `"Build the habit, then increase the effort."`,
  `"Momentum beats motivation."`,
  `"Prioritize progress over pride."`,
  `"Don’t break the chain."`,
  `"Make it obvious, easy, and satisfying."`,
  `"Track it to change it."`,
  `"You grow through what you go through."`,
  `"Keep promises to yourself."`,
  `"Trust the process and push the pace."`,
  `"You can do hard things."`,
  `"Choose courage over comfort."`,
  `"Direction, not perfection."`,
  `"Iterate to great."`,
  `"Tiny changes, remarkable results."`,
  `"Be brave enough to be bad at something new."`,
  `"Don’t let perfect be the enemy of good."`,
  `"Protect your focus."`,
  `"Turn pressure into practice."`,
  `"Be consistent longer than others."`,
  `"Build, measure, learn, repeat."`,
  `"Start with why, finish with how."`,
  `"Effort compounds."`,
  `"Make the next hour count."`,
  `"Keep showing up."`
];

const FEED = [
  "Start small, but start now.",
  "Progress over perfection, always.",
  "Your future self is watching—impress them.",
  "One more try can change everything.",
  "Discipline beats motivation on tough days.",
  "You’re closer than you think—keep going."
];

const SHOW_SOCIAL = false;
const SHOW_BOTTOM_NAV = false;

export default function Menu() {
  const [qIndex, setQIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const quote = useMemo(() => QUOTES[qIndex % QUOTES.length], [qIndex]);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.userWrap}>
          <Image
            source={{ uri: "https://api.dicebear.com/7.x/thumbs/png?seed=User" }}
            style={styles.userAvatar}
            contentFit="cover"
          />
          <ThemedText style={styles.userName}>Username</ThemedText>
        </View>
        <Pressable onPress={() => setMenuOpen((v) => !v)} style={styles.menuBtn}>
          <ThemedText style={styles.menuIcon}>☰</ThemedText>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollPad} showsVerticalScrollIndicator={false}>
        <View style={styles.quoteCard}>
          <ThemedText type="title" style={styles.quoteTitle}>Quote of the Day</ThemedText>
          <ThemedText style={styles.quoteText}>{quote}</ThemedText>

          <View style={styles.quoteActions}>
            {SHOW_SOCIAL && (
              <>
                <Pressable style={styles.circleBtn}>
                  <ThemedText style={styles.circleIcon}>✦</ThemedText>
                </Pressable>
                <Pressable style={styles.circleBtn}>
                  <ThemedText style={styles.circleIcon}>♡</ThemedText>
                </Pressable>
                <Pressable style={styles.circleBtn}>
                  <ThemedText style={styles.circleIcon}>⟳</ThemedText>
                </Pressable>
              </>
            )}
            <Pressable style={styles.generateBtn} onPress={() => setQIndex((i) => i + 1)}>
              <ThemedText style={styles.generateText}>GENERATE</ThemedText>
            </Pressable>
          </View>
        </View>

        <View style={styles.feedWrap}>
          {FEED.map((text, i) => (
            <View key={i} style={styles.post}>
              <View style={styles.postHead}>
                <Image
                  source={{ uri: `https://api.dicebear.com/7.x/thumbs/png?seed=${encodeURIComponent("User-"+i+"-"+text)}` }}
                  style={styles.avatarImg}
                  contentFit="cover"
                />
                <View style={styles.nameWrap}>
                  <ThemedText style={styles.name}>Anonymous</ThemedText>
                </View>
                <Pressable style={styles.moreBtn}>
                  <ThemedText style={styles.moreIcon}>⋯</ThemedText>
                </Pressable>
              </View>
              <ThemedText style={styles.postText}>{text}</ThemedText>
              <View style={styles.postActions}>
                {SHOW_SOCIAL && (
                  <>
                    <Pressable style={styles.postAction}>
                      <ThemedText style={styles.actionIcon}>♡</ThemedText>
                    </Pressable>
                    <Pressable style={styles.postAction}>
                      <ThemedText style={styles.actionIcon}>💬</ThemedText>
                    </Pressable>
                    <Pressable style={styles.postAction}>
                      <ThemedText style={styles.actionIcon}>⟳</ThemedText>
                    </Pressable>
                  </>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <Pressable style={styles.fab} onPress={() => router.push("/compose")}>
        <ThemedText style={styles.fabPlus}>＋</ThemedText>
      </Pressable>

      {SHOW_BOTTOM_NAV && (
        <View style={styles.bottomBar}>
          <Pressable style={styles.navBtn} onPress={() => router.push(tiles[0].href as any)}>
            <ThemedText style={styles.navIcon}>⌂</ThemedText>
          </Pressable>
          <Pressable style={styles.navBtn} onPress={() => router.push("/notifications")}>
            <ThemedText style={styles.navIcon}>🔔</ThemedText>
          </Pressable>
        </View>
      )}

      {menuOpen && (
        <>
          <Pressable style={styles.backdrop} onPress={() => setMenuOpen(false)} />
          <View style={styles.menuCaret} />
          <View style={styles.menuSheet}>
            <View style={styles.menuHeader}>
              <Image
                source={{ uri: "https://api.dicebear.com/7.x/thumbs/png?seed=User" }}
                style={styles.menuHeaderAvatar}
                contentFit="cover"
              />
              <View style={styles.menuHeaderTextWrap}>
                <ThemedText style={styles.menuHeaderName}>Username</ThemedText>
                <ThemedText style={styles.menuHeaderSub}>Quick actions</ThemedText>
              </View>
            </View>
            <View style={styles.menuDivider} />
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setMenuOpen(false);
                router.push("/notifications");
              }}
            >
              <ThemedText style={styles.menuText}>Notifications</ThemedText>
            </Pressable>
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setMenuOpen(false);
                router.push("/settings");
              }}
            >
              <ThemedText style={styles.menuText}>Settings</ThemedText>
            </Pressable>
            <View style={styles.menuDivider} />
            <Pressable
              style={[styles.menuItem, styles.logoutItem]}
              onPress={() => {
                setMenuOpen(false);
                router.push("/login");
              }}
            >
              <ThemedText style={[styles.menuText, styles.logoutText]}>Log out</ThemedText>
            </Pressable>
          </View>
        </>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  topBar: { paddingTop: 28, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  userWrap: { flexDirection: "row", alignItems: "center", gap: 8 },
  userAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#e5e7eb" },
  userName: { fontSize: 14, color: "#111" },
  menuBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center", alignSelf: "flex-end" },
  menuIcon: { fontSize: 20, color: "#000" },

  scrollPad: { paddingHorizontal: 12, paddingBottom: 160 },

  quoteCard: {
    backgroundColor: "#0a0a0a",
    borderRadius: 20,
    padding: 16,
    marginTop: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 }
  },
  notifyBtn: { position: "absolute", top: 12, right: 12, width: 28, height: 28, alignItems: "center", justifyContent: "center" },
  notifyIcon: { color: "white", fontSize: 18 },
  quoteTitle: { color: "white", textAlign: "center", marginBottom: 8, fontSize: 18, paddingRight: 28 },
  quoteText: { color: "white", textAlign: "center", lineHeight: 22, marginTop: 6, marginBottom: 14 },
  quoteActions: { flexDirection: "row", alignItems: "center", gap: 10 },
  circleBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "white", alignItems: "center", justifyContent: "center" },
  circleIcon: { color: "#111", fontSize: 16 },
  generateBtn: { marginLeft: "auto", backgroundColor: "white", paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20 },
  generateText: { color: "#111", fontSize: 12, letterSpacing: 0.5 },

  feedWrap: { marginTop: 16, gap: 10 },
  post: { backgroundColor: "white", borderRadius: 14, borderWidth: 1, borderColor: "#e5e7eb", padding: 12 },
  postHead: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#0a0a0a" },
  avatarImg: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#e5e7eb" },
  nameWrap: { marginLeft: 10, flex: 1 },
  name: { color: "#6b7280", fontSize: 12 },
  moreBtn: { width: 28, height: 28, alignItems: "center", justifyContent: "center" },
  moreIcon: { fontSize: 18, color: "#111" },
  postText: { marginTop: 6, fontSize: 14, color: "#111" },
  postActions: { flexDirection: "row", alignItems: "center", gap: 18, marginTop: 10, marginLeft: 4 },
  postAction: { paddingVertical: 2, paddingHorizontal: 4 },
  actionIcon: { fontSize: 14, color: "#111" },

  fab: {
    position: "absolute",
    bottom: 74,
    alignSelf: "center",
    width: 58,
    height: 58,
    borderRadius: 10,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 1,
    borderColor: "#e5e7eb"
  },
  fabPlus: { fontSize: 28, lineHeight: 28, color: "#111" },

  bottomBar: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    height: 60,
    backgroundColor: "black",
    borderRadius: 30,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  navBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  navIcon: { color: "white", fontSize: 18 },

  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.35)" },
  menuCaret: {
    position: "absolute",
    top: 68,
    right: 28,
    width: 14,
    height: 14,
    backgroundColor: "white",
    transform: [{ rotate: "45deg" }],
    borderLeftWidth: 1,
    borderTopWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }
  },
  menuSheet: {
    position: "absolute",
    top: 72,
    right: 12,
    backgroundColor: "white",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingVertical: 10,
    width: 260,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 }
  },
  menuHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 10 },
  menuHeaderAvatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#e5e7eb" },
  menuHeaderTextWrap: { marginLeft: 10, flex: 1 },
  menuHeaderName: { fontSize: 14, color: "#111" },
  menuHeaderSub: { fontSize: 12, color: "#6b7280" },
  menuDivider: { height: 1, backgroundColor: "#f1f5f9", marginVertical: 6, marginHorizontal: 8 },

  menuItem: { paddingVertical: 14, paddingHorizontal: 14, borderRadius: 12, marginHorizontal: 6 },
  menuText: { fontSize: 14, color: "#111" },
  logoutItem: { marginTop: 2 },
  logoutText: { color: "#b91c1c" }
});
