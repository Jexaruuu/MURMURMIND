import Navigation from "@/components/navigation";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { auth, db } from "@/firebase";
import { Image } from "expo-image";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, deleteDoc, doc, limit, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";

const tiles = [
  { label: "Home", href: "/" },
  { label: "Explore", href: "/(tabs)/explore" },
  { label: "Login", href: "/login" },
  { label: "Sign up", href: "/signup" },
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
  `"Keep showing up."`,
];

const SHOW_SOCIAL = false;
const SHOW_BOTTOM_NAV = false;

const fallbackAvatar = require("@/assets/images/murmurblack.png");

const ASSET_PREFIX = "asset:";
const AVATAR_ASSETS: Record<string, any> = {
  [`${ASSET_PREFIX}murmurblack`]: require("@/assets/images/murmurblack.png"),
  [`${ASSET_PREFIX}murmuryellow`]: require("@/assets/images/murmuryellow.png"),
  [`${ASSET_PREFIX}murmurblue`]: require("@/assets/images/murmurblue.png"),
  [`${ASSET_PREFIX}murmurorange`]: require("@/assets/images/murmurorange.png"),
  [`${ASSET_PREFIX}murmurred`]: require("@/assets/images/murmurred.png"),
  [`${ASSET_PREFIX}murmurgreen`]: require("@/assets/images/murmurgreen.png"),
};

type PostItem = {
  id: string;
  text: string;
  uid?: string | null;
  username?: string | null;
  photoUrl?: string | null;
  createdAt?: number | null;
};

type ReplyItem = {
  id: string;
  postId: string;
  parentId: string | null;
  text: string;
  uid: string | null;
  username: string | null;
  photoUrl: string | null;
  createdAt: number | null;
};

export default function Menu() {
  const [qIndex, setQIndex] = useState(0);
  const quote = useMemo(() => QUOTES[qIndex % QUOTES.length], [qIndex]);

  const [posts, setPosts] = useState<PostItem[]>([]);
  const [myUid, setMyUid] = useState<string | null>(auth.currentUser?.uid ? String(auth.currentUser.uid) : null);
  const [myPhotoUrl, setMyPhotoUrl] = useState<string | null>(null);

  const [actionOpen, setActionOpen] = useState(false);
  const [actionPostId, setActionPostId] = useState<string | null>(null);
  const [actionPostUid, setActionPostUid] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [threadPostId, setThreadPostId] = useState<string | null>(null);
  const [replies, setReplies] = useState<ReplyItem[]>([]);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyingPostId, setReplyingPostId] = useState<string | null>(null);
  const [replyParentId, setReplyParentId] = useState<string | null>(null);
  const [replyParentName, setReplyParentName] = useState<string>("");
  const [sendingReply, setSendingReply] = useState(false);

  const [nowMs, setNowMs] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const assetFor = (v: any) => {
    if (!v || typeof v !== "string") return null;
    const k = v.trim();
    if (!k.startsWith(ASSET_PREFIX)) return null;
    return AVATAR_ASSETS[k] || null;
  };

  const sourceFor = (photoUrl: string | null | undefined) => {
    const asset = assetFor(photoUrl);
    if (asset) return asset;
    const s = typeof photoUrl === "string" ? photoUrl.trim() : "";
    if (!s) return fallbackAvatar;
    return { uri: s };
  };

  const toMs = (v: any): number | null => {
    if (typeof v === "number") return v;
    if (v && typeof v.toMillis === "function") return v.toMillis();
    if (v && typeof v.seconds === "number") {
      const ns = typeof v.nanoseconds === "number" ? v.nanoseconds : 0;
      return v.seconds * 1000 + Math.floor(ns / 1_000_000);
    }
    return null;
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      const uid = u?.uid ? String(u.uid) : null;
      setMyUid(uid);
      setMyPhotoUrl(null);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!myUid) return;
    const unsub = onSnapshot(
      doc(db, "users", myUid),
      (snap) => {
        const data: any = snap.exists() ? snap.data() : null;
        const nextPhoto = typeof data?.photoUrl === "string" ? data.photoUrl : null;
        setMyPhotoUrl(nextPhoto);
      },
      () => {
        setMyPhotoUrl(null);
      }
    );
    return () => unsub();
  }, [myUid]);

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(50));
    const unsub = onSnapshot(q, (snap) => {
      const next: PostItem[] = snap.docs
        .map((d) => {
          const data: any = d.data();
          return {
            id: d.id,
            text: typeof data?.text === "string" ? data.text : "",
            uid: typeof data?.uid === "string" ? data.uid : null,
            username: typeof data?.username === "string" ? data.username : null,
            photoUrl: typeof data?.photoUrl === "string" ? data.photoUrl : null,
            createdAt: toMs(data?.createdAt) ?? toMs(data?.createdAtMs),
          };
        })
        .filter((p) => p.text.trim().length > 0);

      setPosts(next);
      if (threadPostId && !next.some((p) => p.id === threadPostId)) {
        setThreadPostId(null);
        setReplies([]);
      }
    });

    return () => unsub();
  }, [threadPostId]);

  useEffect(() => {
    if (!threadPostId) {
      setReplies([]);
      return;
    }

    const rq = query(collection(db, "posts", threadPostId, "replies"), orderBy("createdAt", "asc"), limit(250));
    const unsub = onSnapshot(
      rq,
      (snap) => {
        const next: ReplyItem[] = snap.docs
          .map((d) => {
            const data: any = d.data();
            return {
              id: d.id,
              postId: threadPostId,
              parentId: typeof data?.parentId === "string" ? data.parentId : null,
              text: typeof data?.text === "string" ? data.text : "",
              uid: typeof data?.uid === "string" ? data.uid : null,
              username: typeof data?.username === "string" ? data.username : null,
              photoUrl: typeof data?.photoUrl === "string" ? data.photoUrl : null,
              createdAt: toMs(data?.createdAt) ?? toMs(data?.createdAtMs),
            };
          })
          .filter((r) => r.text.trim().length > 0);

        setReplies(next);
      },
      () => {
        setReplies([]);
      }
    );

    return () => unsub();
  }, [threadPostId]);

  const quickName = useMemo(() => {
    const u = auth.currentUser;
    const n = typeof u?.displayName === "string" ? u.displayName.trim() : "";
    if (n) return n;
    const e = typeof u?.email === "string" ? u.email.trim() : "";
    return e && e.includes("@") ? e.split("@")[0] : "Guest";
  }, []);

  const headerSubtitle = useMemo(() => {
    const count = posts.length;
    if (count === 0) return "No posts yet. Tap + to write your first thought.";
    if (count === 1) return "1 post in your feed";
    return `${count} posts in your feed`;
  }, [posts.length]);

  const closeActions = () => {
    if (deleting) return;
    setActionOpen(false);
    setActionPostId(null);
    setActionPostUid(null);
  };

  const openActionsFor = (p: PostItem) => {
    const uid = (p.uid || "").trim();
    if (!myUid || !uid || uid !== myUid) return;
    setActionPostId(p.id);
    setActionPostUid(uid);
    setActionOpen(true);
  };

  const deleteMyPost = async () => {
    if (deleting) return;
    if (!myUid) return;
    if (!actionPostId || !actionPostUid) return;
    if (actionPostUid !== myUid) return;

    setDeleting(true);
    try {
      await deleteDoc(doc(db, "posts", actionPostId));
      closeActions();
    } catch {
      closeActions();
    } finally {
      setDeleting(false);
    }
  };

  const toggleThread = (postId: string) => {
    setThreadPostId((curr) => (curr === postId ? null : postId));
  };

  const openReplyForPost = (postId: string, username?: string | null) => {
    if (!auth.currentUser) {
      router.replace("/login");
      return;
    }
    setThreadPostId(postId);
    setReplyingPostId(postId);
    setReplyParentId(null);
    setReplyParentName((username || "").trim() || "Anonymous");
    setReplyText("");
    setReplyOpen(true);
  };

  const openReplyForReply = (postId: string, r: ReplyItem) => {
    if (!auth.currentUser) {
      router.replace("/login");
      return;
    }
    setThreadPostId(postId);
    setReplyingPostId(postId);
    setReplyParentId(r.id);
    setReplyParentName((r.username || "").trim() || "Someone");
    setReplyText("");
    setReplyOpen(true);
  };

  const closeReply = () => {
    if (sendingReply) return;
    setReplyOpen(false);
    setReplyText("");
    setReplyingPostId(null);
    setReplyParentId(null);
    setReplyParentName("");
  };

  const canSendReply = useMemo(() => {
    const t = replyText.trim();
    return !!auth.currentUser && !!replyingPostId && t.length > 0 && t.length <= 280 && !sendingReply;
  }, [replyText, replyingPostId, sendingReply]);

  const sendReply = async () => {
    if (!auth.currentUser) {
      router.replace("/login");
      return;
    }
    if (!myUid) return;
    if (!replyingPostId) return;

    const t = replyText.trim();
    if (!t || t.length > 280) return;

    setSendingReply(true);
    try {
      const payload: any = {
        uid: myUid,
        username: quickName,
        photoUrl: myPhotoUrl || null,
        text: t,
        parentId: replyParentId || null,
        createdAt: serverTimestamp(),
        createdAtMs: Date.now(),
      };

      await addDoc(collection(db, "posts", replyingPostId, "replies"), payload);
      closeReply();
    } catch {
      setSendingReply(false);
    } finally {
      setSendingReply(false);
    }
  };

  const whenLabel = (ms: number | null) => {
    if (!ms) return "";
    let diff = nowMs - ms;
    if (diff < 0) diff = 0;

    const s = Math.floor(diff / 1000);
    if (s < 10) return "just now";
    if (s < 60) return `${s}s`;

    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m`;

    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;

    const d = Math.floor(h / 24);
    if (d < 7) return `${d}d`;

    const w = Math.floor(d / 7);
    if (w < 52) return `${w}w`;

    const y = Math.floor(w / 52);
    return `${y}y`;
  };

  const replyTree = useMemo(() => {
    const byParent: Record<string, ReplyItem[]> = {};
    const rootKey = "__root__";

    for (const r of replies) {
      const key = r.parentId ? r.parentId : rootKey;
      if (!byParent[key]) byParent[key] = [];
      byParent[key].push(r);
    }

    return { byParent, rootKey };
  }, [replies]);

  const renderReplyList = (postId: string, parentId: string | null, depth: number) => {
    const key = parentId ? parentId : replyTree.rootKey;
    const kids = replyTree.byParent[key] || [];
    if (!kids.length) return null;

    return kids.map((r) => {
      const name = (r.username || "").trim() || "Anonymous";
      const uidShort = r.uid ? `@${String(r.uid).slice(0, 6)}` : "";
      const time = whenLabel(r.createdAt);

      return (
        <View key={r.id} style={[styles.replyRow, depth > 0 && { marginLeft: Math.min(44, depth * 14) }]}>
          <Image source={sourceFor(r.photoUrl)} style={styles.replyAvatar} contentFit="cover" />
          <View style={styles.replyBody}>
            <View style={styles.replyHead}>
              <ThemedText style={styles.replyName} numberOfLines={1}>
                {name}
              </ThemedText>
              {!!uidShort && <ThemedText style={styles.replyHandle}>{uidShort}</ThemedText>}
              {!!time && <ThemedText style={styles.replyTime}>{time}</ThemedText>}
              <View style={{ flex: 1 }} />
              <Pressable style={({ pressed }) => [styles.replyBtn, pressed && styles.pressed]} onPress={() => openReplyForReply(postId, r)}>
                <ThemedText style={styles.replyBtnText}>Reply</ThemedText>
              </Pressable>
            </View>

            <ThemedText style={styles.replyText}>{r.text}</ThemedText>

            {renderReplyList(postId, r.id, depth + 1)}
          </View>
        </View>
      );
    });
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="dark" />

      <Navigation />

      <ScrollView contentContainerStyle={styles.scrollPad} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.heroLeft}>
              <ThemedText style={styles.heroKicker}>Today</ThemedText>
              <ThemedText type="title" style={styles.heroTitle}>
                Your feed
              </ThemedText>
              <ThemedText style={styles.heroSub}>{headerSubtitle}</ThemedText>
            </View>
          </View>

          <View style={styles.quoteCard}>
            <View style={styles.quoteHead}>
              <ThemedText style={styles.quoteLabel} numberOfLines={2}>
                Quote of the day
              </ThemedText>
              <Pressable style={({ pressed }) => [styles.quoteBtn, pressed && styles.pressed]} onPress={() => setQIndex((i) => i + 1)}>
                <ThemedText style={styles.quoteBtnText}>Generate</ThemedText>
              </Pressable>
            </View>
            <ThemedText style={styles.quoteText}>{quote}</ThemedText>
          </View>
        </View>

        <View style={styles.sectionHead}>
          <ThemedText style={styles.sectionTitle}>Latest posts</ThemedText>
          <ThemedText style={styles.sectionHint}>Most recent first</ThemedText>
        </View>

        <View style={styles.feedWrap}>
          {posts.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.postHead}>
                <Image source={sourceFor(myPhotoUrl || null)} style={styles.avatarImg} contentFit="cover" />
                <View style={styles.nameWrap}>
                  <ThemedText style={styles.name}>{auth.currentUser ? quickName : "Anonymous"}</ThemedText>
                </View>
              </View>
              <ThemedText style={styles.emptyTitle}>No posts yet</ThemedText>
              <ThemedText style={styles.emptyText}>Tap the + button to write your first thought.</ThemedText>
            </View>
          ) : (
            posts.map((p) => {
              const isMe = !!myUid && (p.uid || "") === myUid;
              const bestPhoto = (isMe ? myPhotoUrl : null) || p.photoUrl || null;
              const isThreadOpen = threadPostId === p.id;
              const postTime = whenLabel(p.createdAt ?? null);

              return (
                <View key={p.id} style={styles.post}>
                  <View style={styles.postHead}>
                    <Image source={sourceFor(bestPhoto)} style={styles.avatarImg} contentFit="cover" />
                    <View style={styles.nameWrap}>
                      <ThemedText style={styles.name}>{(p.username || "").trim() || "Anonymous"}</ThemedText>
                      <View style={styles.handleRow}>
                        {!!p.uid && <ThemedText style={styles.handle}>@{String(p.uid).slice(0, 6)}</ThemedText>}
                        {!!postTime && <ThemedText style={styles.postTime}>{postTime}</ThemedText>}
                      </View>
                    </View>

                    <Pressable style={({ pressed }) => [styles.moreBtn, pressed && styles.pressed, !isMe && styles.moreBtnDisabled]} onPress={() => openActionsFor(p)} disabled={!isMe}>
                      <ThemedText style={[styles.moreIcon, !isMe && styles.moreIconDisabled]}>⋯</ThemedText>
                    </Pressable>
                  </View>

                  <ThemedText style={styles.postText}>{p.text}</ThemedText>

                  <View style={styles.threadRow}>
                    <Pressable style={({ pressed }) => [styles.threadBtn, pressed && styles.pressed]} onPress={() => openReplyForPost(p.id, p.username)}>
                      <ThemedText style={styles.threadBtnText}>Reply</ThemedText>
                    </Pressable>

                    <Pressable style={({ pressed }) => [styles.threadBtn, styles.threadBtnGhost, pressed && styles.pressed]} onPress={() => toggleThread(p.id)}>
                      <ThemedText style={styles.threadBtnTextGhost}>{isThreadOpen ? "Hide replies" : "View replies"}</ThemedText>
                    </Pressable>

                    <View style={{ flex: 1 }} />

                    <View style={styles.pill}>
                      <ThemedText style={styles.pillText}>Thought</ThemedText>
                    </View>
                  </View>

                  {isThreadOpen && (
                    <View style={styles.threadBox}>
                      {replies.length === 0 ? (
                        <View style={styles.threadEmpty}>
                          <ThemedText style={styles.threadEmptyTitle}>No replies yet</ThemedText>
                          <ThemedText style={styles.threadEmptyText}>Be the first to reply.</ThemedText>
                        </View>
                      ) : (
                        <View style={styles.replyList}>{renderReplyList(p.id, null, 0)}</View>
                      )}
                    </View>
                  )}

                  {SHOW_SOCIAL && (
                    <View style={styles.postActions}>
                      <Pressable style={styles.postAction}>
                        <ThemedText style={styles.actionIcon}>♡</ThemedText>
                      </Pressable>
                      <Pressable style={styles.postAction}>
                        <ThemedText style={styles.actionIcon}>💬</ThemedText>
                      </Pressable>
                      <Pressable style={styles.postAction}>
                        <ThemedText style={styles.actionIcon}>⟳</ThemedText>
                      </Pressable>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      <Pressable style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]} onPress={() => router.push("/compose")}>
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

      <Modal transparent visible={actionOpen} animationType="fade" onRequestClose={closeActions} statusBarTranslucent presentationStyle="overFullScreen">
        <View style={styles.actionWrap}>
          <Pressable style={styles.actionBackdrop} onPress={closeActions} />
          <View style={styles.actionCard}>
            <Pressable style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed, deleting && styles.actionBtnDisabled]} onPress={deleteMyPost} disabled={deleting}>
              <ThemedText style={styles.actionDeleteText}>{deleting ? "Deleting..." : "Delete post"}</ThemedText>
            </Pressable>

            <Pressable style={({ pressed }) => [styles.actionBtn, styles.actionCancelBtn, pressed && styles.pressed]} onPress={closeActions}>
              <ThemedText style={styles.actionCancelText}>Cancel</ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={replyOpen} animationType="fade" onRequestClose={closeReply} statusBarTranslucent presentationStyle="overFullScreen">
        <View style={styles.replyModalWrap}>
          <Pressable style={styles.replyBackdropPress} onPress={closeReply} />
          <View style={styles.replyModalCard}>
            <View style={styles.replyModalTop}>
              <View style={styles.replyModalDot} />
            </View>

            <View style={styles.replyModalHead}>
              <View style={styles.replyTitleWrap}>
                <ThemedText style={styles.replyModalKicker}>Replying to</ThemedText>
                <ThemedText style={styles.replyModalTitle} numberOfLines={1}>
                  {replyParentName}
                </ThemedText>
              </View>

              <Pressable style={({ pressed }) => [styles.replyModalX, pressed && styles.pressed]} onPress={closeReply}>
                <ThemedText style={styles.replyModalXText}>✕</ThemedText>
              </Pressable>
            </View>

            <View style={styles.replyInputWrap}>
              <TextInput
                value={replyText}
                onChangeText={setReplyText}
                placeholder="Write your reply..."
                placeholderTextColor="#9ca3af"
                style={styles.replyInput}
                multiline
                maxLength={280}
                textAlignVertical="top"
              />

              <View style={styles.replyMetaRow}>
                <ThemedText style={styles.replyMetaText}>{replyText.trim().length}/280</ThemedText>
                <View style={{ flex: 1 }} />
                <Pressable style={({ pressed }) => [styles.replyCancelBtn, pressed && styles.pressed]} onPress={closeReply} disabled={sendingReply}>
                  <ThemedText style={styles.replyCancelText}>Cancel</ThemedText>
                </Pressable>
                <Pressable style={({ pressed }) => [styles.replySendBtn, pressed && styles.pressed, !canSendReply && styles.replySendBtnDisabled]} onPress={sendReply} disabled={!canSendReply}>
                  <ThemedText style={styles.replySendText}>{sendingReply ? "Sending..." : "Send"}</ThemedText>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  scrollPad: { paddingHorizontal: 12, paddingBottom: 170 },

  pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },

  hero: { marginTop: 8, gap: 12 },
  heroTop: {
    backgroundColor: "white",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  heroLeft: { flex: 1 },
  heroKicker: { fontSize: 11, color: "#6b7280", letterSpacing: 0.4, textTransform: "uppercase" },
  heroTitle: { color: "#111" },
  heroSub: { marginTop: 4, fontSize: 12, color: "#6b7280", lineHeight: 18 },

  quoteCard: {
    backgroundColor: "#0a0a0a",
    borderRadius: 18,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  quoteHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 10 },
  quoteLabel: {
    flex: 1,
    minWidth: 0,
    color: "rgba(255,255,255,0.75)",
    fontSize: 11,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    paddingRight: 10,
  },
  quoteBtn: {
    height: 30,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  quoteBtnText: { color: "#111", fontSize: 12, letterSpacing: 0.3, textTransform: "uppercase" },
  quoteText: { color: "white", lineHeight: 22, marginTop: 2 },

  sectionHead: { marginTop: 14, paddingHorizontal: 2, flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" },
  sectionTitle: { fontSize: 13, color: "#111", letterSpacing: 0.3 },
  sectionHint: { fontSize: 12, color: "#6b7280" },

  feedWrap: { marginTop: 10, gap: 10 },

  post: {
    backgroundColor: "white",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  postHead: { flexDirection: "row", alignItems: "center" },
  avatarImg: { width: 38, height: 38, borderRadius: 12, backgroundColor: "#e5e7eb" },
  nameWrap: { marginLeft: 10, flex: 1, minWidth: 0 },
  name: { color: "#111", fontSize: 13 },
  handleRow: { marginTop: 2, flexDirection: "row", alignItems: "center", gap: 8 },
  handle: { color: "#6b7280", fontSize: 11 },
  postTime: { color: "#6b7280", fontSize: 11 },

  moreBtn: { width: 34, height: 34, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "#f3f4f6", borderWidth: 1, borderColor: "#e5e7eb" },
  moreIcon: { fontSize: 18, color: "#111", marginTop: -2 },
  moreBtnDisabled: { opacity: 0.45 },
  moreIconDisabled: { color: "#6b7280" },

  postText: { marginTop: 10, fontSize: 14, color: "#111", lineHeight: 20 },

  pill: {
    height: 26,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },
  pillText: { fontSize: 11, color: "#111" },

  threadRow: { marginTop: 12, flexDirection: "row", alignItems: "center", gap: 10 },
  threadBtn: {
    height: 30,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#111",
    alignItems: "center",
    justifyContent: "center",
  },
  threadBtnGhost: { backgroundColor: "white", borderColor: "#e5e7eb" },
  threadBtnText: { color: "white", fontSize: 12, letterSpacing: 0.2 },
  threadBtnTextGhost: { color: "#111", fontSize: 12, letterSpacing: 0.2 },

  threadBox: { marginTop: 12, borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.06)", paddingTop: 12 },
  threadEmpty: { paddingVertical: 8 },
  threadEmptyTitle: { fontSize: 12, color: "#111" },
  threadEmptyText: { marginTop: 4, fontSize: 12, color: "#6b7280", lineHeight: 18 },
  replyList: { gap: 10 },

  replyRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginTop: 10 },
  replyAvatar: { width: 30, height: 30, borderRadius: 10, backgroundColor: "#e5e7eb" },
  replyBody: { flex: 1, minWidth: 0 },
  replyHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  replyName: { fontSize: 12, color: "#111", maxWidth: 140 },
  replyHandle: { fontSize: 11, color: "#6b7280" },
  replyTime: { fontSize: 11, color: "#6b7280" },
  replyText: { marginTop: 6, fontSize: 13, color: "#111", lineHeight: 18 },

  replyBtn: {
    height: 24,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },
  replyBtnText: { fontSize: 11, color: "#111" },

  postActions: { marginTop: 12, flexDirection: "row", alignItems: "center", gap: 14 },
  postAction: { paddingVertical: 2, paddingHorizontal: 4 },
  actionIcon: { fontSize: 14, color: "#111" },

  emptyCard: {
    backgroundColor: "white",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 12,
  },
  emptyTitle: { marginTop: 10, fontSize: 14, color: "#111" },
  emptyText: { marginTop: 4, fontSize: 12, color: "#6b7280", lineHeight: 18 },

  fab: {
    position: "absolute",
    bottom: 74,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    borderWidth: 1,
    borderColor: "#111",
  },
  fabPressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
  fabPlus: { fontSize: 26, lineHeight: 26, color: "white" },

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
    justifyContent: "space-between",
  },
  navBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  navIcon: { color: "white", fontSize: 18 },

  actionWrap: { flex: 1, justifyContent: "flex-end" },
  actionBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.38)" },
  actionCard: {
    marginTop: 12,
    borderRadius: 18,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 12,
  },
  actionBtn: {
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  actionBtnDisabled: { opacity: 0.6 },
  actionDeleteText: { color: "#b91c1c", fontSize: 13, letterSpacing: 0.3 },
  actionCancelBtn: { backgroundColor: "#111", borderColor: "#111", marginBottom: 40 },
  actionCancelText: { color: "white", fontSize: 13, letterSpacing: 0.3 },

  replyModalWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  replyBackdropPress: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.42)" },
  replyModalCard: {
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
  },
  replyModalTop: { alignItems: "center", marginBottom: 10 },
  replyModalDot: { width: 46, height: 5, borderRadius: 999, backgroundColor: "#e5e7eb" },

  replyTitleWrap: { flex: 1, minWidth: 0 },
  replyModalHead: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
  replyModalKicker: { fontSize: 11, color: "#6b7280", letterSpacing: 0.3, textTransform: "uppercase" },
  replyModalTitle: { marginTop: 2, fontSize: 16, color: "#111", letterSpacing: 0.2 },

  replyModalX: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  replyModalXText: { fontSize: 14, color: "#111" },

  replyInputWrap: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 16, padding: 12, backgroundColor: "white" },
  replyInput: { minHeight: 120, fontSize: 14, color: "#111", lineHeight: 20 },

  replyMetaRow: { marginTop: 12, flexDirection: "row", alignItems: "center", gap: 10 },
  replyMetaText: { fontSize: 12, color: "#6b7280" },

  replyCancelBtn: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },
  replyCancelText: { color: "#111", fontSize: 12, letterSpacing: 0.2 },

  replySendBtn: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#111",
    alignItems: "center",
    justifyContent: "center",
  },
  replySendBtnDisabled: { opacity: 0.5, borderWidth: 0, borderColor: "transparent" },
  replySendText: { color: "white", fontSize: 12, letterSpacing: 0.2 },
});
