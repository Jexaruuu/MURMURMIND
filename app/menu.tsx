import HomeNavigation from "@/components/homenavigation";
import Navigation from "@/components/navigation";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { auth, db } from "@/firebase";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold } from "@expo-google-fonts/poppins";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { Image } from "expo-image";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { onAuthStateChanged } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { SvgXml } from "react-native-svg";

const tiles = [
  { label: "Home", href: "/" },
  { label: "Explore", href: "/(tabs)/explore" },
  { label: "Login", href: "/login" },
  { label: "Sign up", href: "/signup" },
];

const THOUGHTS = [
  "If you’re reading this, you’re already doing better than my Wi-Fi.",
  "I came, I saw, I forgot why I entered the room.",
  "Plot twist: you’re the main character. Act like it.",
  "Reminder: being tired is not a personality, but it is a lifestyle.",
  "I’m not procrastinating. I’m letting the idea marinate.",
  "Your future self is watching… and judging your snack choices.",
  "Confidence level: walked into the wrong room like I owned it.",
  "Small steps still count. Even the ones to the fridge.",
  "If it’s not on the calendar, it’s a rumor.",
  "Be proud of yourself. You survived another group chat.",
  "Sometimes the plan is: vibe, adjust, repeat.",
  "You don’t need a glow up. You need eight hours of sleep.",
  "If life gives you lemons, ask for salt and tequila.",
  "You can’t pour from an empty cup. Refill with iced coffee.",
  "Your pace is valid. Even if it’s ‘turtle with ambition’.",
  "Today’s mood: do not perceive me.",
  "Your goals are calling. Put them on speaker and take notes.",
  "Progress looks like messy hair and trying again anyway.",
  "You’re allowed to start over. It’s literally free.",
  "I support your dreams. From a safe emotional distance.",
  "Some days you win. Some days you learn. Some days you nap.",
  "Be the reason someone checks their phone and smiles… or panics.",
  "If you feel stuck, change the playlist. Then change the mindset.",
  "Don’t chase closure. Chase snacks and peace.",
  "Life is short. Buy the cute notebook. Write nothing in it.",
  "If you’re overwhelmed, do one tiny thing. Tiny is still heroic.",
  "Your brain is not a browser. Stop opening 37 tabs.",
  "Normalize saying: ‘Let me think’ instead of ‘Sure’ and suffering.",
  "If it drains you, it’s not a flex. It’s a leak.",
  "You’re doing great. Even if your laundry is judging you.",
  "New rule: no self-talk you wouldn’t say to your best friend.",
  "Being late is cardio. But let’s not make it a habit.",
  "If you can’t find motivation, try discipline’s annoying cousin: routine.",
  "Your peace is expensive. Don’t give discounts.",
  "Drink water. Your organs are running a meeting without you.",
  "You don’t need more time. You need fewer distractions with cute faces.",
  "Some thoughts should stay inside thoughts. This one included.",
  "If you’re not growing, you’re scrolling.",
  "You’re not behind. You’re just on your own timeline—like a Netflix release.",
  "Celebrate small wins. Like getting out of bed without negotiating.",
  "If it’s for you, it won’t require you to beg.",
  "Today’s goal: be 1% kinder to yourself. That’s a whole upgrade.",
  "Your vibe introduces you before you speak. Make it a good trailer.",
  "Stop shrinking to fit spaces that never fit you.",
  "One bad day doesn’t cancel your progress. It’s not a subscription.",
  "Your dream deserves more than ‘someday’. Schedule it.",
  "Be brave. Worst case, you get a funny story.",
  "Sometimes the glow up is just leaving what dimmed you.",
  "If you’re waiting for a sign, this is it. Hi.",
  "You can do hard things. You’ve done harder with less sleep.",
  "If you can’t be productive, be peaceful. Both are wins.",
  "Your energy is a currency. Spend it like you mean it.",
  "Do it scared. Do it awkward. Do it anyway.",
  "You’re allowed to outgrow people. Plants do it all the time.",
  "Your mind is a garden. Stop watering thoughts that hurt you.",
  "If it costs your mental health, it’s too expensive.",
  "Take breaks. Even your phone needs charging.",
  "You’re not lazy. You’re overstimulated and under-rested.",
  "Make choices your future self won’t roast you for.",
  "If it’s not a ‘heck yes’, it’s a ‘no, thanks’.",
  "Don’t confuse being busy with being better.",
  "You deserve good things that don’t come with anxiety.",
  "Be consistent. Not perfect. Perfect is exhausting.",
  "Remember: you’re learning. Even if it looks like chaos.",
  "If you feel lost, return to basics: sleep, food, movement, sunlight.",
  "You’re not too much. You’re just in the wrong room.",
  "Protect your focus. It’s your superpower.",
  "It’s okay to be a work in progress. Construction is loud.",
  "Your boundaries are not mean. They’re maintenance.",
  "If you’re spiraling, do something small and physical: stand up, breathe, reset.",
  "You don’t need permission to choose yourself.",
  "Let it be easy sometimes. You’re not being graded.",
  "Keep going. Even if it’s slow. Even if it’s ugly. Especially then.",
];

const FORTUNE_OPENERS = [
  "Today feels like a soft reset.",
  "Today has a gentle kind of luck in it.",
  "Your day is giving ‘quiet good news’.",
  "A small win is already looking for you.",
  "Something light is about to land on your shoulders (in a good way).",
  "You’re not late. You’re arriving with better timing.",
  "Your energy is getting a little brighter today.",
  "You’re more supported than you think today.",
  "Today is built for small, satisfying moments.",
  "A calm decision will feel extra right today.",
  "Today is less about proving, more about breathing.",
  "You’re allowed to take it slow today—still counts.",
  "Today wants you to be a little kinder to yourself.",
  "Your patience is about to pay you back today.",
  "Today’s vibe: steady, not stressed.",
  "Today is a good day to choose ease on purpose.",
  "Something you’ve been waiting for is moving.",
  "Today is a good day to feel proud in small ways.",
  "You’re going to handle today better than you expect.",
  "Today is giving ‘you got this’ without the pressure.",
];

const FORTUNE_MIDDLES = [
  "One simple choice will make the rest feel lighter.",
  "A quick message or hello could turn your mood around.",
  "You’ll notice a tiny sign that you’re on the right track.",
  "Someone is going to appreciate your presence more than they say.",
  "A small task you finish will unlock a bigger calm.",
  "Your best idea might show up when you stop forcing it.",
  "If you rest even a little, your brain will thank you.",
  "You’ll feel better after you do the first 10%.",
  "Something you feared will be easier than it looked in your head.",
  "A peaceful boundary will save you energy today.",
  "You’ll get a clean “yes” on something you’ve been unsure about.",
  "A tiny reset (water, walk, stretch) will work surprisingly well.",
  "You’re going to find the right words at the right time.",
  "The right plan today is the one you can actually do.",
  "You’ll feel a little spark of confidence return.",
  "A small moment will remind you that life can be sweet.",
  "You’ll get clarity by simplifying, not adding more.",
  "A gentle win is waiting in your next step.",
  "You’ll feel proud of yourself for showing up, even quietly.",
  "Your focus will improve once you remove one distraction.",
];

const FORTUNE_ENDERS = [
  "Keep it simple. You’re doing enough.",
  "No need to rush—your pace is working.",
  "Let it be a ‘one good thing at a time’ kind of day.",
  "You don’t have to earn rest. You can just take it.",
  "Choose the easy button once today. It’s allowed.",
  "You’re not behind. You’re building.",
  "Be gentle with yourself—today responds well to softness.",
  "You’re allowed to enjoy the small stuff without guilt.",
  "Your best is already showing, even if it’s quiet.",
  "Let today be warm, not loud.",
  "You can do less and still be proud.",
  "If it’s not urgent, let it wait.",
  "Treat yourself like someone you care about.",
  "You’re doing fine. Breathe and continue.",
  "You don’t need perfect. You need steady.",
];

const SHOW_SOCIAL = false;
const SHOW_BOTTOM_NAV = false;
const SHOW_FAB = false;

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

type PostItem = {
  id: string;
  text: string;
  textColor?: string | null;
  uid?: string | null;
  username?: string | null;
  photoUrl?: string | null;
  createdAt?: number | null;
  mediaType?: "image" | "drawing" | null;
  mediaUrl?: string | null;
  drawingSvg?: string | null;
};

type ReplyItem = {
  id: string;
  postId: string;
  parentId: string | null;
  text: string;
  textColor?: string | null;
  uid: string | null;
  username: string | null;
  photoUrl: string | null;
  createdAt: number | null;
};

type PhotoState = { url: string | null; ver: number };
type LikeState = { count: number; liked: boolean };

const HEART_PINK = "#EC4899";

export default function Menu() {
  useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
  });

  const [tIndex, setTIndex] = useState(0);
  const thought = useMemo(() => THOUGHTS[tIndex % THOUGHTS.length], [tIndex]);
  const insets = useSafeAreaInsets();

  const [posts, setPosts] = useState<PostItem[]>([]);
  const [myUid, setMyUid] = useState<string | null>(auth.currentUser?.uid ? String(auth.currentUser.uid) : null);
  const [myPhotoUrl, setMyPhotoUrl] = useState<string | null>(null);
  const [myPhotoVer, setMyPhotoVer] = useState<number>(0);

  const [userPhotoByUid, setUserPhotoByUid] = useState<Record<string, string | null>>({});
  const [userPhotoVerByUid, setUserPhotoVerByUid] = useState<Record<string, number>>({});
  const userPhotoUnsubs = useRef<Record<string, () => void>>({});

  const [postLikeById, setPostLikeById] = useState<Record<string, LikeState>>({});
  const [replyLikeByKey, setReplyLikeByKey] = useState<Record<string, LikeState>>({});
  const postLikeUnsubs = useRef<Record<string, () => void>>({});
  const replyLikeUnsubs = useRef<Record<string, () => void>>({});

  const [actionOpen, setActionOpen] = useState(false);
  const [actionPostId, setActionPostId] = useState<string | null>(null);
  const [actionPostUid, setActionPostUid] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editTextColor, setEditTextColor] = useState<string>("#111111");
  const [savingEdit, setSavingEdit] = useState(false);

  const [threadPostId, setThreadPostId] = useState<string | null>(null);
  const [replies, setReplies] = useState<ReplyItem[]>([]);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyingPostId, setReplyingPostId] = useState<string | null>(null);
  const [replyParentId, setReplyParentId] = useState<string | null>(null);
  const [replyParentName, setReplyParentName] = useState<string>("");
  const [sendingReply, setSendingReply] = useState(false);

  const REPLY_TEXT_COLORS = useMemo(
    () => ["#111111", "#EF4444", "#F97316", "#F59E0B", "#10B981", "#06B6D4", "#3B82F6", "#6366F1", "#A855F7", "#EC4899", "#22C55E"],
    []
  );
  const [replyTextColor, setReplyTextColor] = useState<string>("#111111");

  const [nowMs, setNowMs] = useState(Date.now());

  const [topNavH, setTopNavH] = useState(0);
  const navAnim = useRef(new Animated.Value(0)).current;
  const navHiddenRef = useRef(false);
  const lastScrollY = useRef(0);

  const [fortuneDismissedDay, setFortuneDismissedDay] = useState<string | null>(null);
  const fortuneAnim = useRef(new Animated.Value(0)).current;
  const fortuneAnimLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const liveDateTime = useMemo(() => {
    const d = new Date(nowMs);
    const date = d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "2-digit", year: "numeric" });
    const time = d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    return `${date} • ${time}`;
  }, [nowMs]);

  const dayStamp = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const da = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${da}`;
  }, []);

  const dayKeyNow = useMemo(() => {
    const d = new Date(nowMs);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const da = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${da}`;
  }, [nowMs]);

  const hashStr = (s: string) => {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  };

  const fortuneFor = (uidLike: string, dayKey: string) => {
    const uid = String(uidLike || "").trim();
    if (!uid) return "";
    const seed = hashStr(`fortune|${dayKey}|${uid}`);
    const a = FORTUNE_OPENERS[seed % FORTUNE_OPENERS.length];
    const b = FORTUNE_MIDDLES[Math.floor(seed / 11) % FORTUNE_MIDDLES.length];
    const c = FORTUNE_ENDERS[Math.floor(seed / 97) % FORTUNE_ENDERS.length];
    const bonusSeed = hashStr(`fortuneX|${dayKey}|${uid}`);
    const softAdd = [
      "Also: treat yourself to something small.",
      "Also: you’re allowed to say no politely.",
      "Also: take the shortcut that saves your energy.",
      "Also: a tiny cleanup can feel like a fresh start.",
      "Also: reply later if you need to.",
      "Also: drink water, then decide.",
      "Also: a short walk counts.",
      "Also: laugh a little—it helps.",
      "Also: your calm is doing something.",
      "Also: choose comfort where you can.",
      "Also: you don’t need to explain everything.",
      "Also: you’re not failing—you’re learning.",
    ][bonusSeed % 12];

    return `${a} ${b} ${c} ${softAdd}`;
  };

  const showFortune = useMemo(() => {
    if (!auth.currentUser || !myUid) return false;
    return (fortuneDismissedDay || "") !== dayKeyNow;
  }, [fortuneDismissedDay, dayKeyNow, myUid]);

  const fortuneText = useMemo(() => {
    if (!myUid || !auth.currentUser) return "";
    return fortuneFor(myUid, dayKeyNow);
  }, [myUid, dayKeyNow]);

  useEffect(() => {
    if (!showFortune) {
      try {
        fortuneAnimLoopRef.current?.stop?.();
      } catch {}
      fortuneAnimLoopRef.current = null;
      fortuneAnim.stopAnimation(() => {
        fortuneAnim.setValue(0);
      });
      return;
    }

    fortuneAnim.setValue(0);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(fortuneAnim, { toValue: 1, duration: 900, useNativeDriver: false }),
        Animated.timing(fortuneAnim, { toValue: 2, duration: 900, useNativeDriver: false }),
        Animated.timing(fortuneAnim, { toValue: 3, duration: 900, useNativeDriver: false }),
        Animated.timing(fortuneAnim, { toValue: 4, duration: 900, useNativeDriver: false }),
        Animated.timing(fortuneAnim, { toValue: 0, duration: 900, useNativeDriver: false }),
      ])
    );

    fortuneAnimLoopRef.current = loop;
    loop.start();

    return () => {
      try {
        loop.stop();
      } catch {}
      fortuneAnimLoopRef.current = null;
    };
  }, [showFortune]);

  const fortuneColor = useMemo(() => {
    return fortuneAnim.interpolate({
      inputRange: [0, 1, 2, 3, 4],
      outputRange: ["#F59E0B", "#EC4899", "#A855F7", "#3B82F6", "#10B981"],
    });
  }, [fortuneAnim]);

  const assetFor = (v: any) => {
    if (!v || typeof v !== "string") return null;
    const k = v.trim();
    if (!k.startsWith(ASSET_PREFIX)) return null;
    return AVATAR_ASSETS[k] || null;
  };

  const isHttpUrl = (v: string) => {
    const s = String(v || "").trim().toLowerCase();
    return s.startsWith("http://") || s.startsWith("https://");
  };

  const withVer = (u: string, ver: number) => {
    const s = u.trim();
    if (!s) return s;
    if (!isHttpUrl(s)) return s;
    const glue = s.includes("?") ? "&" : "?";
    return `${s}${glue}v=${Math.max(0, Math.floor(ver || 0))}`;
  };

  const sourceFor = (photoUrl: string | null | undefined, ver?: number | null) => {
    const asset = assetFor(photoUrl);
    if (asset) return asset;

    const s = typeof photoUrl === "string" ? photoUrl.trim() : "";
    if (!s) return fallbackAvatar;

    if (typeof ver === "number" && ver > 0 && isHttpUrl(s)) return { uri: withVer(s, ver) };
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

  const userPhotoVersionFromDoc = (data: any) => {
    const candidates: any[] = [
      data?.photoVer,
      data?.photoUpdatedAtMs,
      data?.updatedAtMs,
      toMs(data?.photoUpdatedAt),
      toMs(data?.updatedAt),
    ];
    for (const c of candidates) {
      if (typeof c === "number" && Number.isFinite(c) && c > 0) return Math.max(0, Math.floor(c));
    }
    return 0;
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

  const handleForUid = (uidLike: string | null | undefined) => {
    const uid = typeof uidLike === "string" ? uidLike.trim() : "";
    if (!uid) return "";
    const seed = hashStr(`${dayStamp}|${uid}|handle`);
    const h = seed.toString(36).slice(0, 6).padEnd(6, "0");
    return `@${h}`;
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      const uid = u?.uid ? String(u.uid) : null;
      setMyUid(uid);
      setMyPhotoUrl(null);
      setMyPhotoVer(0);
      setFortuneDismissedDay(null);
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
        const nextVer = userPhotoVersionFromDoc(data);
        const dismissed = typeof data?.fortuneDismissedDay === "string" ? data.fortuneDismissedDay.trim() : null;

        setMyPhotoUrl(nextPhoto);
        setMyPhotoVer(Math.max(0, Math.floor(nextVer || 0)));
        setFortuneDismissedDay(dismissed || null);
      },
      () => {
        setMyPhotoUrl(null);
        setMyPhotoVer(0);
        setFortuneDismissedDay(null);
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
            textColor: typeof data?.textColor === "string" ? data.textColor : null,
            uid: typeof data?.uid === "string" ? data.uid : null,
            username: typeof data?.username === "string" ? data.username : null,
            photoUrl: typeof data?.photoUrl === "string" ? data.photoUrl : null,
            createdAt: toMs(data?.createdAt) ?? toMs(data?.createdAtMs),
            mediaType: data?.mediaType === "image" || data?.mediaType === "drawing" ? data.mediaType : null,
            mediaUrl: typeof data?.mediaUrl === "string" ? data.mediaUrl : null,
            drawingSvg: typeof data?.drawingSvg === "string" ? data.drawingSvg : null,
          };
        })
        .filter((p) => {
          const hasText = p.text.trim().length > 0;
          const hasMedia = !!p.mediaType || !!p.mediaUrl || !!p.drawingSvg;
          return hasText || hasMedia;
        });

      setPosts(next);
      if (threadPostId && !next.some((p) => p.id === threadPostId)) {
        setThreadPostId(null);
        setReplies([]);
      }

      if (editingPostId && !next.some((p) => p.id === editingPostId)) {
        setEditOpen(false);
        setEditingPostId(null);
        setEditText("");
        setEditTextColor("#111111");
      }
    });

    return () => unsub();
  }, [threadPostId, editingPostId]);

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
              textColor: typeof data?.textColor === "string" ? data.textColor : null,
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

  useEffect(() => {
    const wanted = new Set<string>();

    for (const p of posts) {
      const uid = typeof p.uid === "string" ? p.uid.trim() : "";
      if (uid && uid !== (myUid || "")) wanted.add(uid);
    }

    for (const r of replies) {
      const uid = typeof r.uid === "string" ? r.uid.trim() : "";
      if (uid && uid !== (myUid || "")) wanted.add(uid);
    }

    for (const uid of wanted) {
      if (userPhotoUnsubs.current[uid]) continue;

      const unsub = onSnapshot(
        doc(db, "users", uid),
        (snap) => {
          const data: any = snap.exists() ? snap.data() : null;
          const next = typeof data?.photoUrl === "string" ? data.photoUrl : null;
          const nextVer = userPhotoVersionFromDoc(data);

          setUserPhotoByUid((prev) => (prev[uid] === next ? prev : { ...prev, [uid]: next }));
          setUserPhotoVerByUid((prev) => {
            const v = Math.max(0, Math.floor(nextVer || 0));
            return prev[uid] === v ? prev : { ...prev, [uid]: v };
          });
        },
        () => {
          setUserPhotoByUid((prev) => (prev[uid] === null ? prev : { ...prev, [uid]: null }));
          setUserPhotoVerByUid((prev) => (prev[uid] === 0 ? prev : { ...prev, [uid]: 0 }));
        }
      );

      userPhotoUnsubs.current[uid] = unsub;
    }

    for (const uid of Object.keys(userPhotoUnsubs.current)) {
      if (wanted.has(uid)) continue;
      try {
        userPhotoUnsubs.current[uid]();
      } catch {}
      delete userPhotoUnsubs.current[uid];
      setUserPhotoByUid((prev) => {
        if (!(uid in prev)) return prev;
        const next = { ...prev };
        delete next[uid];
        return next;
      });
      setUserPhotoVerByUid((prev) => {
        if (!(uid in prev)) return prev;
        const next = { ...prev };
        delete next[uid];
        return next;
      });
    }
  }, [posts, replies, myUid]);

  useEffect(() => {
    return () => {
      for (const uid of Object.keys(userPhotoUnsubs.current)) {
        try {
          userPhotoUnsubs.current[uid]();
        } catch {}
      }
      userPhotoUnsubs.current = {};
    };
  }, []);

  useEffect(() => {
    const wanted = new Set<string>();
    for (const p of posts) {
      if (p?.id) wanted.add(p.id);
    }

    for (const postId of wanted) {
      if (postLikeUnsubs.current[postId]) continue;

      const unsub = onSnapshot(
        collection(db, "posts", postId, "likes"),
        (snap) => {
          const count = snap.size || 0;
          const liked = !!myUid && snap.docs.some((d) => d.id === myUid);
          setPostLikeById((prev) => {
            const curr = prev[postId];
            if (curr && curr.count === count && curr.liked === liked) return prev;
            return { ...prev, [postId]: { count, liked } };
          });
        },
        () => {
          setPostLikeById((prev) => {
            const curr = prev[postId];
            if (curr && curr.count === 0 && curr.liked === false) return prev;
            return { ...prev, [postId]: { count: 0, liked: false } };
          });
        }
      );

      postLikeUnsubs.current[postId] = unsub;
    }

    for (const postId of Object.keys(postLikeUnsubs.current)) {
      if (wanted.has(postId)) continue;
      try {
        postLikeUnsubs.current[postId]();
      } catch {}
      delete postLikeUnsubs.current[postId];
      setPostLikeById((prev) => {
        if (!(postId in prev)) return prev;
        const next = { ...prev };
        delete next[postId];
        return next;
      });
    }
  }, [posts, myUid]);

  useEffect(() => {
    return () => {
      for (const k of Object.keys(postLikeUnsubs.current)) {
        try {
          postLikeUnsubs.current[k]();
        } catch {}
      }
      postLikeUnsubs.current = {};
    };
  }, []);

  useEffect(() => {
    const wanted = new Set<string>();
    if (threadPostId) {
      for (const r of replies) {
        if (r?.id) wanted.add(`${threadPostId}||${r.id}`);
      }
    }

    for (const key of wanted) {
      if (replyLikeUnsubs.current[key]) continue;
      const [postId, replyId] = key.split("||");
      if (!postId || !replyId) continue;

      const unsub = onSnapshot(
        collection(db, "posts", postId, "replies", replyId, "likes"),
        (snap) => {
          const count = snap.size || 0;
          const liked = !!myUid && snap.docs.some((d) => d.id === myUid);
          setReplyLikeByKey((prev) => {
            const curr = prev[key];
            if (curr && curr.count === count && curr.liked === liked) return prev;
            return { ...prev, [key]: { count, liked } };
          });
        },
        () => {
          setReplyLikeByKey((prev) => {
            const curr = prev[key];
            if (curr && curr.count === 0 && curr.liked === false) return prev;
            return { ...prev, [key]: { count: 0, liked: false } };
          });
        }
      );

      replyLikeUnsubs.current[key] = unsub;
    }

    for (const key of Object.keys(replyLikeUnsubs.current)) {
      if (wanted.has(key)) continue;
      try {
        replyLikeUnsubs.current[key]();
      } catch {}
      delete replyLikeUnsubs.current[key];
      setReplyLikeByKey((prev) => {
        if (!(key in prev)) return prev;
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }, [threadPostId, replies, myUid]);

  useEffect(() => {
    return () => {
      for (const k of Object.keys(replyLikeUnsubs.current)) {
        try {
          replyLikeUnsubs.current[k]();
        } catch {}
      }
      replyLikeUnsubs.current = {};
    };
  }, []);

  const quickName = useMemo(() => {
    const u = auth.currentUser;
    const n = typeof u?.displayName === "string" ? u.displayName.trim() : "";
    if (n) return n;
    const e = typeof u?.email === "string" ? u.email.trim() : "";
    return e && e.includes("@") ? e.split("@")[0] : "Guest";
  }, []);

  const headerSubtitle = useMemo(() => {
    const count = posts.length;
    if (count === 0) return "No posts yet. Tap Post to write your first thought.";
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

  const openEditPost = (postId: string) => {
    if (!auth.currentUser || !myUid) {
      router.replace("/login");
      return;
    }
    const p = posts.find((x) => x.id === postId) || null;
    if (!p) return;
    const owner = (p.uid || "").trim();
    if (!owner || owner !== myUid) return;

    setEditingPostId(postId);
    setEditText(typeof p.text === "string" ? p.text : "");
    setEditTextColor(typeof p.textColor === "string" && p.textColor.trim() ? p.textColor.trim() : "#111111");
    setSavingEdit(false);
    setEditOpen(true);
    closeActions();
  };

  const closeEdit = () => {
    if (savingEdit) return;
    setEditOpen(false);
    setEditingPostId(null);
    setEditText("");
    setEditTextColor("#111111");
    setSavingEdit(false);
  };

  const canSaveEdit = useMemo(() => {
    const t = editText.trim();
    return !!auth.currentUser && !!myUid && !!editingPostId && !savingEdit && t.length > 0 && t.length <= 280;
  }, [editText, editingPostId, savingEdit, myUid]);

  const saveEditPost = async () => {
    if (!auth.currentUser || !myUid) {
      router.replace("/login");
      return;
    }
    if (!editingPostId) return;

    const current = posts.find((x) => x.id === editingPostId) || null;
    if (!current) return;
    const owner = (current.uid || "").trim();
    if (!owner || owner !== myUid) return;

    const t = editText.trim();
    if (!t || t.length > 280) return;

    const c = (editTextColor || "#111111").trim() || "#111111";

    setSavingEdit(true);

    setPosts((prev) =>
      prev.map((p) =>
        p.id !== editingPostId
          ? p
          : {
              ...p,
              text: t,
              textColor: c,
            }
      )
    );

    try {
      await setDoc(
        doc(db, "posts", editingPostId),
        {
          text: t,
          textColor: c,
          updatedAt: serverTimestamp(),
          updatedAtMs: Date.now(),
        } as any,
        { merge: true }
      );
      closeEdit();
    } catch {
      setSavingEdit(false);
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
    setReplyTextColor("#111111");
    setReplyOpen(true);
  };

  const openReplyForReply = (postId: string, r: ReplyItem) => {
    if (!auth.currentUser) {
      router.replace("/login");
      return;
    }
    if (!!myUid && (r.uid || "") === myUid) return;

    setThreadPostId(postId);
    setReplyingPostId(postId);
    setReplyParentId(r.id);
    setReplyParentName((r.username || "").trim() || "Someone");
    setReplyText("");
    setReplyTextColor("#111111");
    setReplyOpen(true);
  };

  const closeReply = () => {
    if (sendingReply) return;
    setReplyOpen(false);
    setReplyText("");
    setReplyingPostId(null);
    setReplyParentId(null);
    setReplyParentName("");
    setReplyTextColor("#111111");
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

    if (replyParentId) {
      const parent = replies.find((x) => x.id === replyParentId) || null;
      if (parent && (parent.uid || "") === myUid) return;
    }

    setSendingReply(true);
    try {
      const payload: any = {
        uid: myUid,
        username: quickName,
        photoUrl: myPhotoUrl || null,
        text: t,
        textColor: replyTextColor,
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

  const replyNameById = useMemo(() => {
    const m: Record<string, string> = {};
    for (const r of replies) m[r.id] = aliasForUid(r.uid) || "Anonymous";
    return m;
  }, [replies]);

  const ensureAuthed = () => {
    if (!auth.currentUser) {
      router.replace("/login");
      return false;
    }
    return true;
  };

  const togglePostLike = async (p: PostItem) => {
    if (!ensureAuthed()) return;
    if (!myUid) return;
    const owner = typeof p.uid === "string" ? p.uid : "";
    if (owner && owner === myUid) return;

    const before = postLikeById[p.id] || { count: 0, liked: false };
    const nextLiked = !before.liked;
    const optimisticCount = Math.max(0, (before.count || 0) + (nextLiked ? 1 : -1));

    setPostLikeById((prev) => ({ ...prev, [p.id]: { count: optimisticCount, liked: nextLiked } }));

    const likeRef = doc(db, "posts", p.id, "likes", myUid);

    try {
      if (before.liked) {
        await deleteDoc(likeRef);
      } else {
        await setDoc(
          likeRef,
          {
            uid: myUid,
            createdAt: serverTimestamp(),
            createdAtMs: Date.now(),
          } as any,
          { merge: true }
        );
      }
    } catch {
      setPostLikeById((prev) => ({ ...prev, [p.id]: before }));
    }
  };

  const toggleReplyLike = async (postId: string, r: ReplyItem) => {
    if (!ensureAuthed()) return;
    if (!myUid) return;
    const owner = typeof r.uid === "string" ? r.uid : "";
    if (owner && owner === myUid) return;

    const key = `${postId}||${r.id}`;
    const before = replyLikeByKey[key] || { count: 0, liked: false };
    const nextLiked = !before.liked;
    const optimisticCount = Math.max(0, (before.count || 0) + (nextLiked ? 1 : -1));

    setReplyLikeByKey((prev) => ({ ...prev, [key]: { count: optimisticCount, liked: nextLiked } }));

    const likeRef = doc(db, "posts", postId, "replies", r.id, "likes", myUid);

    try {
      if (before.liked) {
        await deleteDoc(likeRef);
      } else {
        await setDoc(
          likeRef,
          {
            uid: myUid,
            createdAt: serverTimestamp(),
            createdAtMs: Date.now(),
          } as any,
          { merge: true }
        );
      }
    } catch {
      setReplyLikeByKey((prev) => ({ ...prev, [key]: before }));
    }
  };

  const renderFlatReplyList = (postId: string) => {
    if (!replies.length) return null;

    return replies.map((r, idx) => {
      const name = aliasForUid(r.uid) || "Anonymous";
      const uidShort = handleForUid(r.uid);
      const time = whenLabel(r.createdAt);

      const isMe = !!myUid && (r.uid || "") === myUid;

      const liveOtherPhoto = !isMe && r.uid ? userPhotoByUid[String(r.uid)] || null : null;
      const liveOtherVer = !isMe && r.uid ? userPhotoVerByUid[String(r.uid)] || 0 : 0;

      const bestPhoto: PhotoState = isMe
        ? { url: myPhotoUrl || null, ver: myPhotoVer || 0 }
        : liveOtherPhoto
        ? { url: liveOtherPhoto, ver: liveOtherVer }
        : { url: r.photoUrl || null, ver: 0 };

      const replyColor = typeof r.textColor === "string" && r.textColor.trim() ? r.textColor.trim() : "#111";
      const replyingToName = r.parentId ? replyNameById[r.parentId] || "Someone" : "";

      const isPostReply = !r.parentId;
      const showPostReplySeparator = isPostReply && idx !== 0;

      const canReplyToThisReply = !!auth.currentUser && !isMe;

      const likeKey = `${postId}||${r.id}`;
      const likeState = replyLikeByKey[likeKey] || { count: 0, liked: false };
      const likeCount = Math.max(0, likeState.count || 0);
      const liked = !!likeState.liked;

      const canReact = !!auth.currentUser && !!myUid && !isMe;
      const showCount = likeCount > 0;

      return (
        <View key={r.id} style={styles.replyItemWrap}>
          {showPostReplySeparator && <View style={styles.postReplySeparator} />}

          <View style={[styles.replyRow, { marginTop: 0 }]}>
            <Image source={sourceFor(bestPhoto.url, bestPhoto.ver)} style={styles.replyAvatar} contentFit="cover" />
            <View style={styles.replyBody}>
              <View style={styles.replyHead}>
                <ThemedText style={styles.replyName} numberOfLines={1}>
                  {name}
                </ThemedText>
                {!!uidShort && <ThemedText style={styles.replyHandle}>{uidShort}</ThemedText>}
                {!!time && <ThemedText style={styles.replyTime}>{time}</ThemedText>}
                <View style={{ flex: 1 }} />

                <Pressable
                  style={({ pressed }) => [
                    styles.heartBtn,
                    !canReact && styles.heartBtnDisabled,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => toggleReplyLike(postId, r)}
                  disabled={!canReact}
                >
                  <Ionicons name={canReact && liked ? "heart" : "heart-outline"} size={16} color={canReact && liked ? HEART_PINK : "#111"} />
                  {showCount ? <ThemedText style={styles.heartCount}>{likeCount}</ThemedText> : null}
                </Pressable>

                {canReplyToThisReply ? (
                  <Pressable style={({ pressed }) => [styles.replyBtn, pressed && styles.pressed]} onPress={() => openReplyForReply(postId, r)}>
                    <ThemedText style={styles.replyBtnText}>Reply</ThemedText>
                  </Pressable>
                ) : null}
              </View>

              {!!replyingToName && (
                <ThemedText style={styles.replyToText} numberOfLines={1}>
                  Replying to {replyingToName}
                </ThemedText>
              )}

              <ThemedText style={[styles.replyText, { color: replyColor }]}>{r.text}</ThemedText>
            </View>
          </View>
        </View>
      );
    });
  };

  const mediaLabelFor = (p: PostItem) => {
    if (p.mediaType === "image") return "Image";
    if (p.mediaType === "drawing") return "Drawing";
    return "Thought";
  };

  const renderPostMedia = (p: PostItem) => {
    if (p.mediaType === "image" && p.mediaUrl) {
      return (
        <View style={styles.mediaBox}>
          <Image source={{ uri: p.mediaUrl }} style={styles.mediaImg} contentFit="cover" />
        </View>
      );
    }

    if (p.mediaType === "drawing") {
      if (p.drawingSvg) {
        return (
          <View style={styles.mediaBox}>
            <SvgXml xml={p.drawingSvg} width="100%" height="100%" />
          </View>
        );
      }
      if (p.mediaUrl) {
        return (
          <View style={styles.mediaBox}>
            <Image source={{ uri: p.mediaUrl }} style={styles.mediaImg} contentFit="contain" />
          </View>
        );
      }
    }

    return null;
  };

  const setNavHidden = (hidden: boolean) => {
    if (navHiddenRef.current === hidden) return;
    navHiddenRef.current = hidden;
    Animated.timing(navAnim, {
      toValue: hidden ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  };

  const onFeedScroll = (e: any) => {
    const y = Math.max(0, Number(e?.nativeEvent?.contentOffset?.y || 0));
    lastScrollY.current = y;
    setNavHidden(false);
  };

  const navTranslateY = navAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0],
  });

  const navOpacity = navAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1],
  });

  const dismissFortuneToday = async () => {
    if (!auth.currentUser || !myUid) return;
    const day = dayKeyNow;
    setFortuneDismissedDay(day);
    try {
      await setDoc(
        doc(db, "users", myUid),
        {
          fortuneDismissedDay: day,
          fortuneDismissedAt: serverTimestamp(),
          fortuneDismissedAtMs: Date.now(),
        } as any,
        { merge: true }
      );
    } catch {}
  };

  const onThoughtGenerate = async () => {
    if (showFortune) {
      await dismissFortuneToday();
      setTIndex((i) => i + 1);
      return;
    }
    setTIndex((i) => i + 1);
  };

  const editingTitle = useMemo(() => {
    if (!editingPostId) return "Your post";
    const p = posts.find((x) => x.id === editingPostId) || null;
    const ownerUid = (p?.uid || "").trim();
    if (!ownerUid) return "Your post";
    const tag = uniqueTagForUid(ownerUid);
    return tag ? `Your post • ${tag}` : "Your post";
  }, [editingPostId, posts]);

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="light" backgroundColor="#000" translucent />

      <View pointerEvents="none" style={[styles.statusBg, { height: insets.top }]} />

      <Animated.View
        style={[styles.topNavWrap, { transform: [{ translateY: navTranslateY }], opacity: navOpacity }]}
        onLayout={(e) => {
          const h = Math.max(0, Math.floor(e.nativeEvent.layout.height));
          if (h && h !== topNavH) setTopNavH(h);
        }}
      >
        <Navigation />
        <View style={[styles.statusBg, { height: insets.top }]} />
      </Animated.View>

      <ScrollView
        contentContainerStyle={[styles.scrollPad, { paddingTop: (topNavH || 0) + 10 }]}
        showsVerticalScrollIndicator={false}
        onScroll={onFeedScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.heroLeft}>
              <ThemedText style={styles.heroKicker}>{liveDateTime}</ThemedText>
              <ThemedText type="title" style={styles.heroTitle}>
                Our Thoughts.
              </ThemedText>
              <ThemedText style={styles.heroSub}>{headerSubtitle}</ThemedText>
            </View>
          </View>

          <View style={styles.thoughtCard}>
            <View style={styles.thoughtHead}>
              <ThemedText style={styles.thoughtLabel} numberOfLines={2}>
                {showFortune ? "Your Fortune Today" : "Random Thoughts"}
              </ThemedText>
              <Pressable style={({ pressed }) => [styles.thoughtBtn, pressed && styles.pressed]} onPress={onThoughtGenerate}>
                <ThemedText style={styles.thoughtBtnText}>Generate</ThemedText>
              </Pressable>
            </View>

            {showFortune ? (
              <Animated.Text style={[styles.thoughtText, { color: fortuneColor, fontFamily: "Poppins_400Regular" }]}>{fortuneText}</Animated.Text>
            ) : (
              <ThemedText style={styles.thoughtText}>{thought}</ThemedText>
            )}
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
                <Image source={sourceFor(myPhotoUrl || null, myPhotoVer)} style={styles.avatarImg} contentFit="cover" />
                <View style={styles.nameWrap}>
                  <ThemedText style={styles.name}>{auth.currentUser ? aliasForUid(myUid) : "Brainrot Guest"}</ThemedText>
                </View>
              </View>
              <ThemedText style={styles.emptyTitle}>No posts yet</ThemedText>
              <ThemedText style={styles.emptyText}>Tap Post to write your first thought.</ThemedText>
            </View>
          ) : (
            posts.map((p) => {
              const isMe = !!myUid && (p.uid || "") === myUid;

              const liveOtherPhoto = !isMe && p.uid ? userPhotoByUid[String(p.uid)] || null : null;
              const liveOtherVer = !isMe && p.uid ? userPhotoVerByUid[String(p.uid)] || 0 : 0;

              const bestPhoto: PhotoState = isMe
                ? { url: myPhotoUrl || null, ver: myPhotoVer || 0 }
                : liveOtherPhoto
                ? { url: liveOtherPhoto, ver: liveOtherVer }
                : { url: p.photoUrl || null, ver: 0 };

              const isThreadOpen = threadPostId === p.id;
              const postTime = whenLabel(p.createdAt ?? null);
              const displayName = aliasForUid(p.uid) || "Anonymous";
              const handle = handleForUid(p.uid);

              const postTextColor = typeof p.textColor === "string" && p.textColor.trim() ? p.textColor.trim() : "#111";

              const likeState = postLikeById[p.id] || { count: 0, liked: false };
              const likeCount = Math.max(0, likeState.count || 0);
              const liked = !!likeState.liked;

              const canReact = !!auth.currentUser && !!myUid && !isMe;
              const showCount = likeCount > 0;

              return (
                <View key={p.id} style={styles.post}>
                  <View style={styles.postHead}>
                    <Image source={sourceFor(bestPhoto.url, bestPhoto.ver)} style={styles.avatarImg} contentFit="cover" />
                    <View style={styles.nameWrap}>
                      <ThemedText style={styles.name}>{displayName}</ThemedText>
                      <View style={styles.handleRow}>
                        {!!handle && <ThemedText style={styles.handle}>{handle}</ThemedText>}
                        {!!postTime && <ThemedText style={styles.postTime}>{postTime}</ThemedText>}
                      </View>
                    </View>

                    {isMe ? (
                      <Pressable style={({ pressed }) => [styles.moreBtn, pressed && styles.pressed]} onPress={() => openActionsFor(p)}>
                        <ThemedText style={styles.moreIcon}>⋯</ThemedText>
                      </Pressable>
                    ) : (
                      <View style={{ width: 34, height: 34 }} />
                    )}
                  </View>

                  {!!p.text.trim() && <ThemedText style={[styles.postText, { color: postTextColor }]}>{p.text}</ThemedText>}

                  {renderPostMedia(p)}

                  <View style={styles.threadRow}>
                    <Pressable style={({ pressed }) => [styles.threadBtn, pressed && styles.pressed]} onPress={() => openReplyForPost(p.id, displayName)}>
                      <ThemedText style={styles.threadBtnText}>Reply</ThemedText>
                    </Pressable>

                    <Pressable style={({ pressed }) => [styles.threadBtn, styles.threadBtnGhost, pressed && styles.pressed]} onPress={() => toggleThread(p.id)}>
                      <ThemedText style={styles.threadBtnTextGhost}>{isThreadOpen ? "Hide replies" : "View replies"}</ThemedText>
                    </Pressable>

                    <View style={{ flex: 1 }} />

                    <Pressable
                      style={({ pressed }) => [
                        styles.heartBtnPost,
                        !canReact && styles.heartBtnDisabled,
                        pressed && styles.pressed,
                      ]}
                      onPress={() => togglePostLike(p)}
                      disabled={!canReact}
                    >
                      <Ionicons name={canReact && liked ? "heart" : "heart-outline"} size={18} color={canReact && liked ? HEART_PINK : "#111"} />
                      {showCount ? <ThemedText style={styles.heartCount}>{likeCount}</ThemedText> : null}
                    </Pressable>

                    <View style={styles.pill}>
                      <ThemedText style={styles.pillText}>{mediaLabelFor(p)}</ThemedText>
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
                        <View style={styles.replyList}>{renderFlatReplyList(p.id)}</View>
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

      {SHOW_FAB && (
        <Pressable style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]} onPress={() => router.push("/compose")}>
          <ThemedText style={styles.fabPlus}>＋</ThemedText>
        </Pressable>
      )}

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

      <HomeNavigation />

      <Modal transparent visible={actionOpen} animationType="fade" onRequestClose={closeActions} statusBarTranslucent presentationStyle="overFullScreen">
        <View style={styles.actionWrap}>
          <Pressable style={styles.actionBackdrop} onPress={closeActions} />
          <View style={styles.actionCard}>
            <Pressable
              style={({ pressed }) => [
                styles.actionBtn,
                pressed && styles.pressed,
                deleting && styles.actionBtnDisabled,
                (!myUid || !actionPostId || actionPostUid !== myUid) && styles.actionBtnDisabled,
              ]}
              onPress={() => {
                if (!myUid || !actionPostId || actionPostUid !== myUid) return;
                openEditPost(actionPostId);
              }}
              disabled={deleting || !myUid || !actionPostId || actionPostUid !== myUid}
            >
              <ThemedText style={styles.actionEditText}>Edit post</ThemedText>
            </Pressable>

            <Pressable style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed, deleting && styles.actionBtnDisabled]} onPress={deleteMyPost} disabled={deleting}>
              <ThemedText style={styles.actionDeleteText}>{deleting ? "Deleting..." : "Delete post"}</ThemedText>
            </Pressable>

            <Pressable style={({ pressed }) => [styles.actionBtn, styles.actionCancelBtn, pressed && styles.pressed]} onPress={closeActions}>
              <ThemedText style={styles.actionCancelText}>Cancel</ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={editOpen} animationType="fade" onRequestClose={closeEdit} statusBarTranslucent presentationStyle="overFullScreen">
        <View style={styles.replyModalWrap}>
          <Pressable style={styles.replyBackdropPress} onPress={closeEdit} />
          <View style={styles.replyModalCard}>
            <View style={styles.replyModalTop}>
              <View style={styles.replyModalDot} />
            </View>

            <View style={styles.replyModalHead}>
              <View style={styles.replyTitleWrap}>
                <ThemedText style={styles.replyModalKicker}>Editing</ThemedText>
                <ThemedText style={styles.replyModalTitle} numberOfLines={1}>
                  {editingTitle}
                </ThemedText>
              </View>

              <Pressable style={({ pressed }) => [styles.replyModalX, pressed && styles.pressed]} onPress={closeEdit}>
                <ThemedText style={styles.replyModalXText}>✕</ThemedText>
              </Pressable>
            </View>

            <View style={styles.replyInputWrap}>
              <View style={styles.replyColorRow}>
                <ThemedText style={styles.replyColorLbl}>Choose Font Color:</ThemedText>
                <View style={styles.replyColorSwatchesWrap}>
                  {REPLY_TEXT_COLORS.map((c) => {
                    const selected = editTextColor === c;
                    return (
                      <Pressable
                        key={c}
                        onPress={() => setEditTextColor(c)}
                        style={({ pressed }) => [styles.replyColorSwatch, { backgroundColor: c }, selected && styles.replyColorSwatchSelected, pressed && styles.pressed]}
                      />
                    );
                  })}
                </View>
              </View>

              <View style={styles.replyDivider} />

              <TextInput
                value={editText}
                onChangeText={setEditText}
                placeholder="Edit your post..."
                placeholderTextColor="#9ca3af"
                style={[styles.replyInput, { color: editTextColor }]}
                multiline
                maxLength={280}
                textAlignVertical="top"
              />

              <View style={styles.replyMetaRow}>
                <ThemedText style={styles.replyMetaText}>{editText.trim().length}/280</ThemedText>
                <View style={{ flex: 1 }} />
                <Pressable style={({ pressed }) => [styles.replyCancelBtn, pressed && styles.pressed]} onPress={closeEdit} disabled={savingEdit}>
                  <ThemedText style={styles.replyCancelText}>Cancel</ThemedText>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [styles.replySendBtn, pressed && styles.pressed, !canSaveEdit && styles.replySendBtnDisabled]}
                  onPress={saveEditPost}
                  disabled={!canSaveEdit}
                >
                  <ThemedText style={styles.replySendText}>{savingEdit ? "Saving..." : "Save"}</ThemedText>
                </Pressable>
              </View>
            </View>
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
              <View style={styles.replyColorRow}>
                <ThemedText style={styles.replyColorLbl}>Choose Font Color:</ThemedText>
                <View style={styles.replyColorSwatchesWrap}>
                  {REPLY_TEXT_COLORS.map((c) => {
                    const selected = replyTextColor === c;
                    return (
                      <Pressable
                        key={c}
                        onPress={() => setReplyTextColor(c)}
                        style={({ pressed }) => [styles.replyColorSwatch, { backgroundColor: c }, selected && styles.replyColorSwatchSelected, pressed && styles.pressed]}
                      />
                    );
                  })}
                </View>
              </View>

              <View style={styles.replyDivider} />

              <TextInput
                value={replyText}
                onChangeText={setReplyText}
                placeholder="Write your reply..."
                placeholderTextColor="#9ca3af"
                style={[styles.replyInput, { color: replyTextColor }]}
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

  statusBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#000",
    zIndex: 200,
  },

  topNavWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    zIndex: 50,
  },

  scrollPad: { paddingHorizontal: 12, paddingBottom: 210 },

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
  heroKicker: { fontSize: 11, color: "#6b7280", letterSpacing: 0.4, textTransform: "uppercase", fontFamily: "Poppins_500Medium" },
  heroTitle: { color: "#111", fontSize: 28, fontFamily: "Poppins_600SemiBold" },
  heroSub: { marginTop: 4, fontSize: 12, color: "#6b7280", lineHeight: 18, fontFamily: "Poppins_400Regular" },

  thoughtCard: {
    backgroundColor: "#0a0a0a",
    borderRadius: 18,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  thoughtHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 10 },
  thoughtLabel: {
    flex: 1,
    minWidth: 0,
    color: "rgba(255,255,255,0.75)",
    fontSize: 11,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    paddingRight: 10,
    fontFamily: "Poppins_500Medium",
  },
  thoughtBtn: {
    height: 30,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  thoughtBtnText: { color: "#111", fontSize: 12, letterSpacing: 0.3, textTransform: "uppercase", fontFamily: "Poppins_600SemiBold" },
  thoughtText: { color: "white", lineHeight: 22, marginTop: 2, fontFamily: "Poppins_400Regular" },

  sectionHead: { marginTop: 14, paddingHorizontal: 2, flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" },
  sectionTitle: { fontSize: 13, color: "#111", letterSpacing: 0.3, fontFamily: "Poppins_600SemiBold" },
  sectionHint: { fontSize: 12, color: "#6b7280", fontFamily: "Poppins_400Regular" },

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
  name: { color: "#111", fontSize: 13, fontFamily: "Poppins_600SemiBold" },
  handleRow: { marginTop: 2, flexDirection: "row", alignItems: "center", gap: 8 },
  handle: { color: "#6b7280", fontSize: 11, fontFamily: "Poppins_400Regular" },
  postTime: { color: "#6b7280", fontSize: 11, fontFamily: "Poppins_400Regular" },

  moreBtn: { width: 34, height: 34, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "#f3f4f6", borderWidth: 1, borderColor: "#e5e7eb" },
  moreIcon: { fontSize: 18, color: "#111", marginTop: -2, fontFamily: "Poppins_600SemiBold" },
  moreBtnDisabled: { opacity: 0.45 },
  moreIconDisabled: { color: "#6b7280" },

  postText: { marginTop: 10, fontSize: 14, color: "#111", lineHeight: 20, fontFamily: "Poppins_400Regular" },

  mediaBox: {
    marginTop: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
    backgroundColor: "#fff",
    height: 210,
  },
  mediaImg: { width: "100%", height: "100%" },

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
  pillText: { fontSize: 11, color: "#111", fontFamily: "Poppins_500Medium" },

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
  threadBtnText: { color: "white", fontSize: 12, letterSpacing: 0.2, fontFamily: "Poppins_600SemiBold" },
  threadBtnTextGhost: { color: "#111", fontSize: 12, letterSpacing: 0.2, fontFamily: "Poppins_600SemiBold" },

  heartBtn: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  heartBtnPost: {
    height: 30,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  heartBtnDisabled: { opacity: 0.45 },
  heartCount: { fontSize: 12, color: "#111", fontFamily: "Poppins_600SemiBold" },

  threadBox: { marginTop: 12, borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.06)", paddingTop: 12 },
  threadEmpty: { paddingVertical: 8 },
  threadEmptyTitle: { fontSize: 12, color: "#111", fontFamily: "Poppins_600SemiBold" },
  threadEmptyText: { marginTop: 4, fontSize: 12, color: "#6b7280", lineHeight: 18, fontFamily: "Poppins_400Regular" },
  replyList: { gap: 10 },

  replyItemWrap: { gap: 10 },

  postReplySeparator: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginLeft: 40,
  },

  replyRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginTop: 10 },
  replyAvatar: { width: 30, height: 30, borderRadius: 10, backgroundColor: "#e5e7eb" },
  replyBody: { flex: 1, minWidth: 0 },
  replyHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  replyName: { fontSize: 12, color: "#111", maxWidth: 140, fontFamily: "Poppins_600SemiBold" },
  replyHandle: { fontSize: 11, color: "#6b7280", fontFamily: "Poppins_400Regular" },
  replyTime: { fontSize: 11, color: "#6b7280", fontFamily: "Poppins_400Regular" },

  replyToText: { marginTop: 4, fontSize: 11, color: "#6b7280", fontFamily: "Poppins_400Regular" },

  replyText: { marginTop: 6, fontSize: 13, color: "#111", lineHeight: 18, fontFamily: "Poppins_400Regular" },

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
  replyBtnText: { fontSize: 11, color: "#111", fontFamily: "Poppins_600SemiBold" },

  postActions: { marginTop: 12, flexDirection: "row", alignItems: "center", gap: 14 },
  postAction: { paddingVertical: 2, paddingHorizontal: 4 },
  actionIcon: { fontSize: 14, color: "#111", fontFamily: "Poppins_600SemiBold" },

  emptyCard: {
    backgroundColor: "white",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 12,
  },
  emptyTitle: { marginTop: 10, fontSize: 14, color: "#111", fontFamily: "Poppins_600SemiBold" },
  emptyText: { marginTop: 4, fontSize: 12, color: "#6b7280", lineHeight: 18, fontFamily: "Poppins_400Regular" },

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
  fabPlus: { fontSize: 26, lineHeight: 26, color: "white", fontFamily: "Poppins_600SemiBold" },

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
  navIcon: { color: "white", fontSize: 18, fontFamily: "Poppins_600SemiBold" },

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
  actionEditText: { color: "#111", fontSize: 13, letterSpacing: 0.3, fontFamily: "Poppins_600SemiBold" },
  actionDeleteText: { color: "#b91c1c", fontSize: 13, letterSpacing: 0.3, fontFamily: "Poppins_600SemiBold" },
  actionCancelBtn: { backgroundColor: "#111", borderColor: "#111", marginBottom: 40 },
  actionCancelText: { color: "white", fontSize: 13, letterSpacing: 0.3, fontFamily: "Poppins_600SemiBold" },

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
  replyModalKicker: { fontSize: 11, color: "#6b7280", letterSpacing: 0.3, textTransform: "uppercase", fontFamily: "Poppins_500Medium" },
  replyModalTitle: { marginTop: 2, fontSize: 16, color: "#111", letterSpacing: 0.2, fontFamily: "Poppins_600SemiBold" },

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
  replyModalXText: { fontSize: 14, color: "#111", fontFamily: "Poppins_600SemiBold" },

  replyInputWrap: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 16, padding: 12, backgroundColor: "white" },

  replyColorRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 10 },
  replyColorLbl: { fontSize: 12, color: "#6b7280", marginRight: 2, fontFamily: "Poppins_500Medium" },
  replyColorSwatchesWrap: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  replyColorSwatch: { width: 22, height: 22, borderRadius: 11, borderWidth: 1, borderColor: "#e5e7eb" },
  replyColorSwatchSelected: { borderWidth: 2, borderColor: "#111" },

  replyDivider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginBottom: 10,
  },

  replyInput: { minHeight: 120, fontSize: 14, color: "#111", lineHeight: 20, fontFamily: "Poppins_400Regular" },

  replyMetaRow: { marginTop: 12, flexDirection: "row", alignItems: "center", gap: 10 },
  replyMetaText: { fontSize: 12, color: "#6b7280", fontFamily: "Poppins_400Regular" },

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
  replyCancelText: { color: "#111", fontSize: 12, letterSpacing: 0.2, fontFamily: "Poppins_600SemiBold" },

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
  replySendText: { color: "white", fontSize: 12, letterSpacing: 0.2, fontFamily: "Poppins_600SemiBold" },
});
