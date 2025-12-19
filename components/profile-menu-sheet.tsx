import { ThemedText } from "@/components/themed-text";
import { auth, db } from "@/firebase";
import { Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold } from "@expo-google-fonts/poppins";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { signOut, updateEmail, updatePassword, updateProfile } from "firebase/auth";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Modal, Pressable, StatusBar as RNStatusBar, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const fallbackAvatar = require("@/assets/images/murmurblack.png");
const editPlaceholder = require("@/assets/images/murmurblack.png");

const MENU_WIDTH = 260;
const MENU_ICON_SIZE = 18;

const ASSET_PREFIX = "asset:";

const AVATAR_CHOICES = [
  { key: `${ASSET_PREFIX}murmurblack`, label: "Bla", src: require("@/assets/images/murmurblack.png") },
  { key: `${ASSET_PREFIX}murmuryellow`, label: "Yel", src: require("@/assets/images/murmuryellow.png") },
  { key: `${ASSET_PREFIX}murmurblue`, label: "Blu", src: require("@/assets/images/murmurblue.png") },
  { key: `${ASSET_PREFIX}murmurorange`, label: "Ora", src: require("@/assets/images/murmurorange.png") },
  { key: `${ASSET_PREFIX}murmurred`, label: "Red", src: require("@/assets/images/murmurred.png") },
  { key: `${ASSET_PREFIX}murmurgreen`, label: "Gre", src: require("@/assets/images/murmurgreen.png") },
];

const AVATAR_ASSETS: Record<string, any> = AVATAR_CHOICES.reduce((acc: any, a) => {
  acc[a.key] = a.src;
  return acc;
}, {});

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
  const tag = uniqueTagForUid(uid);
  return `${a} ${n} • ${tag}`;
};

export default function ProfileMenuSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
  });

  const [visible, setVisible] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const [uid, setUid] = useState<string | null>(null);

  const [username, setUsername] = useState("Guest");
  const [userEmail, setUserEmail] = useState<string>("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoVer, setPhotoVer] = useState<number>(0);
  const [photoBroken, setPhotoBroken] = useState(false);

  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editPhoto, setEditPhoto] = useState<string | null>(null);

  const [baseName, setBaseName] = useState("");
  const [baseEmail, setBaseEmail] = useState("");
  const [basePhoto, setBasePhoto] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveNotice, setSaveNotice] = useState("");
  const [saveOk, setSaveOk] = useState(true);
  const noticeTimer = useRef<any>(null);

  const slideX = useRef(new Animated.Value(MENU_WIDTH)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const lastServerPhoto = useRef<string | null>(null);
  const lastServerPhotoVer = useRef<number>(0);

  const statusEntry = useRef<any>(null);

  const assetFor = (v: string | null | undefined) => {
    if (!v) return null;
    if (typeof v !== "string") return null;
    const k = v.trim();
    if (!k.startsWith(ASSET_PREFIX)) return null;
    return AVATAR_ASSETS[k] || null;
  };

  const isHttpUrl = (v: string | null | undefined) => {
    if (!v) return false;
    const s = String(v).trim().toLowerCase();
    return s.startsWith("http://") || s.startsWith("https://");
  };

  const withVer = (u: string, ver: number) => {
    const s = u.trim();
    if (!s) return s;
    if (!isHttpUrl(s)) return s;
    const glue = s.includes("?") ? "&" : "?";
    return `${s}${glue}v=${Math.max(0, Math.floor(ver || 0))}`;
  };

  const avatarAsset = assetFor(photoUrl);
  const avatarUri = !avatarAsset && photoUrl && !photoBroken ? withVer(photoUrl, photoVer) : null;
  const avatarSource = avatarAsset ? avatarAsset : avatarUri ? { uri: avatarUri } : fallbackAvatar;
  const avatarCanError = !avatarAsset && !!photoUrl;

  const editAsset = assetFor(editPhoto);
  const editAvatarSource = editAsset ? editAsset : editPhoto ? { uri: editPhoto } : editPlaceholder;

  const trim = (v: any) => (typeof v === "string" ? v.trim() : "");
  const same = (a: any, b: any) => trim(a) === trim(b);

  const passwordReady = editPassword.length === 0 || editPassword.length >= 6;
  const passwordChanged = editPassword.length >= 6;
  const nameChanged = trim(editName) && !same(editName, baseName);
  const emailChanged = trim(editEmail) && !same(editEmail, baseEmail);
  const photoChanged = (editPhoto || null) !== (basePhoto || null);

  const hasChanges = (nameChanged || emailChanged || photoChanged || passwordChanged) && passwordReady;

  const friendlyError = (err: any) => {
    const code = typeof err?.code === "string" ? err.code : "";
    if (code.includes("permission-denied")) return "Firestore permission denied. Fix your Firestore Rules.";
    if (code === "auth/requires-recent-login") return "Please log in again to change email/password.";
    if (code === "auth/email-already-in-use") return "That email is already in use.";
    if (code === "auth/invalid-email") return "Invalid email.";
    if (code === "auth/weak-password") return "Password must be at least 6 characters.";
    if (code === "auth/invalid-photo-url") return "Profile photo must be a valid URL. Avatars are saved in Firestore.";
    return "Update failed. Please try again.";
  };

  const showNotice = (t: string, ok = true) => {
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    setSaveOk(ok);
    setSaveNotice(t);
    noticeTimer.current = setTimeout(() => setSaveNotice(""), 2600);
  };

  useEffect(() => {
    return () => {
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!visible) return;
    statusEntry.current = RNStatusBar.pushStackEntry({
      barStyle: "light-content",
      translucent: true,
      backgroundColor: "transparent",
      animated: true,
    } as any);
    return () => {
      if (statusEntry.current != null) {
        RNStatusBar.popStackEntry(statusEntry.current);
        statusEntry.current = null;
      }
    };
  }, [visible]);

  useEffect(() => {
    if (!open) {
      if (!visible) return;
      Animated.parallel([
        Animated.timing(slideX, { toValue: MENU_WIDTH, duration: 230, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 0, duration: 200, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      ]).start(({ finished }) => {
        if (finished) {
          setVisible(false);
          setEditOpen(false);
          setSaveNotice("");
        }
      });
      return;
    }

    setVisible(true);
    slideX.setValue(MENU_WIDTH);
    backdropOpacity.setValue(0);

    Animated.parallel([
      Animated.timing(slideX, { toValue: 0, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(backdropOpacity, { toValue: 1, duration: 220, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
  }, [open, visible, slideX, backdropOpacity]);

  useEffect(() => {
    if (!visible) return;

    const u = auth.currentUser;
    setPhotoBroken(false);

    const nextUid = u?.uid ? String(u.uid) : null;
    setUid(nextUid);

    if (!u) {
      setUsername("Guest");
      setUserEmail("");
      setPhotoUrl(null);
      setPhotoVer(0);
      lastServerPhoto.current = null;
      lastServerPhotoVer.current = 0;
      return;
    }

    const quick = (u.displayName || "").trim() || (u.email ? u.email.split("@")[0] : "").trim();
    if (quick) setUsername(quick);

    const e = typeof u.email === "string" ? u.email.trim() : "";
    setUserEmail(e);

    const authPhoto = typeof u.photoURL === "string" && u.photoURL.trim() ? u.photoURL.trim() : null;
    setPhotoUrl(authPhoto);
  }, [visible]);

  useEffect(() => {
    if (!visible) return;

    const u = auth.currentUser;
    if (!u) return;

    const unsub = onSnapshot(doc(db, "users", u.uid), (snap) => {
      const data: any = snap.exists() ? snap.data() : null;
      const fromFs = typeof data?.photoUrl === "string" ? data.photoUrl : null;
      const fromVer =
        typeof data?.photoVer === "number"
          ? data.photoVer
          : typeof data?.photoUpdatedAt === "number"
          ? data.photoUpdatedAt
          : typeof data?.updatedAt === "number"
          ? data.updatedAt
          : 0;

      const authPhoto = typeof u.photoURL === "string" && u.photoURL.trim() ? u.photoURL.trim() : null;
      const next = fromFs || authPhoto || null;

      lastServerPhoto.current = next;
      lastServerPhotoVer.current = Math.max(0, Math.floor(fromVer || 0));

      if (!editOpen) {
        setPhotoBroken(false);
        setPhotoUrl(next);
        setPhotoVer(lastServerPhotoVer.current);
      }
    });

    return () => unsub();
  }, [visible, editOpen]);

  useEffect(() => {
    if (!visible) return;
    if (editOpen) return;
    if (lastServerPhoto.current !== null || photoUrl !== null) {
      setPhotoBroken(false);
      setPhotoUrl(lastServerPhoto.current);
      setPhotoVer(lastServerPhotoVer.current);
    }
  }, [editOpen, visible]);

  const close = () => onClose();

  const openEdit = () => {
    const n = username === "Guest" ? "" : username;
    const e = userEmail || "";
    const p = photoUrl || null;

    setEditOpen(true);
    setEditName(n);
    setEditEmail(e);
    setEditPassword("");
    setEditPhoto(p);

    setBaseName(n);
    setBaseEmail(e);
    setBasePhoto(p);

    setSaveNotice("");
  };

  const pickImage = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) return;

      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
        base64: true,
      });

      if (res.canceled) return;
      const asset = res.assets?.[0];
      if (!asset) return;

      if (asset.base64) {
        const dataUrl = `data:image/jpeg;base64,${asset.base64}`;
        setEditPhoto(dataUrl);
        setPhotoBroken(false);
        setSaveNotice("");
        return;
      }

      if (asset.uri) {
        setEditPhoto(asset.uri);
        setPhotoBroken(false);
        setSaveNotice("");
      }
    } catch {}
  };

  const performSave = async () => {
    const u = auth.currentUser;
    if (!u) {
      showNotice("Please log in first", false);
      return;
    }

    if (!hasChanges) {
      showNotice(passwordReady ? "No changes to save" : "Password must be at least 6 characters.", false);
      return;
    }

    const nextName = editName.trim();
    const nextEmail = editEmail.trim();
    const nextPassword = editPassword;

    setSaving(true);

    try {
      const now = Date.now();
      const fsPatch: any = { updatedAt: now };
      if (nextName && !same(nextName, baseName)) fsPatch.name = nextName;
      if (nextEmail && !same(nextEmail, baseEmail)) fsPatch.email = nextEmail;
      if (photoChanged) {
        fsPatch.photoUrl = editPhoto || null;
        fsPatch.photoVer = now;
        fsPatch.photoUpdatedAt = now;
      }

      await setDoc(doc(db, "users", u.uid), fsPatch, { merge: true });

      if (nextName && nextName !== (u.displayName || "").trim()) await updateProfile(u, { displayName: nextName });
      if (isHttpUrl(editPhoto) && editPhoto !== (u.photoURL || "").trim()) await updateProfile(u, { photoURL: editPhoto });

      if (nextEmail && nextEmail !== (u.email || "").trim()) {
        await updateEmail(u, nextEmail);
        setUserEmail(nextEmail);
      }

      let didPasswordChange = false;
      if (nextPassword && nextPassword.length >= 6) {
        await updatePassword(u, nextPassword);
        didPasswordChange = true;
      }

      if (nextName) setUsername(nextName);

      if (photoChanged) {
        const finalPhoto = editPhoto || null;
        lastServerPhoto.current = finalPhoto;
        lastServerPhotoVer.current = now;
        setPhotoBroken(false);
        setPhotoUrl(finalPhoto);
        setPhotoVer(now);
      }

      if (didPasswordChange) {
        close();
        await signOut(auth);
        router.replace("/login");
        return;
      }

      setBaseName(nextName || baseName);
      setBaseEmail(nextEmail || baseEmail);
      setBasePhoto(photoChanged ? (editPhoto || null) : basePhoto);
      setEditPassword("");

      showNotice("Changes successfully", true);
    } catch (err: any) {
      showNotice(friendlyError(err), false);
    } finally {
      setSaving(false);
    }
  };

  const headerTitle = useMemo(() => (editOpen ? "Edit profile" : "Menu"), [editOpen]);
  const alias = useMemo(() => aliasForUid(uid), [uid]);

  if (!visible) return null;
  if (!fontsLoaded) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={close} statusBarTranslucent presentationStyle="overFullScreen">
      <View style={styles.wrap}>
        <Animated.View pointerEvents="none" style={[styles.backdrop, { opacity: backdropOpacity }]} />
        <Pressable style={styles.dismiss} onPress={close} />

        <Animated.View
          style={[
            styles.sheet,
            {
              width: MENU_WIDTH,
              paddingTop: 10 + Math.max(insets.top, 12),
              paddingBottom: 14 + Math.max(insets.bottom, 12),
              transform: [{ translateX: slideX }],
            },
          ]}
        >
          <View style={styles.topRow}>
            <View style={styles.topLeft}>
              {editOpen && (
                <Pressable
                  style={styles.navBtn}
                  onPress={() => {
                    setEditOpen(false);
                    setSaveNotice("");
                  }}
                >
                  <Ionicons name="chevron-back" size={18} color="#fff" />
                </Pressable>
              )}
              <ThemedText style={styles.title}>{headerTitle}</ThemedText>
            </View>

            <Pressable onPress={close} style={styles.navBtn}>
              <Ionicons name="close" size={18} color="#fff" />
            </Pressable>
          </View>

          {!editOpen ? (
            <>
              <View style={styles.hero}>
                <View style={styles.heroTop}>
                  <View style={styles.avatarRing}>
                    <Image
                      source={avatarSource}
                      style={styles.headerAvatar}
                      contentFit="cover"
                      onError={() => {
                        if (avatarCanError) setPhotoBroken(true);
                      }}
                    />
                  </View>

                  <View style={styles.heroText}>
                    <ThemedText style={styles.headerName} numberOfLines={1}>
                      {username}
                    </ThemedText>
                    <ThemedText style={styles.headerAlias} numberOfLines={1}>
                      {alias}
                    </ThemedText>
                    {!!userEmail && (
                      <ThemedText style={styles.headerEmail} numberOfLines={1}>
                        {userEmail}
                      </ThemedText>
                    )}
                  </View>
                </View>

                <Pressable
                  onPress={() => {
                    if (!auth.currentUser) {
                      close();
                      router.replace("/login");
                      return;
                    }
                    openEdit();
                  }}
                  style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressedBtn]}
                >
                  <Ionicons name={auth.currentUser ? "create-outline" : "log-in-outline"} size={16} color="#fff" />
                  <ThemedText style={styles.secondaryText}>{auth.currentUser ? "Edit profile" : "Log in"}</ThemedText>
                </Pressable>
              </View>

              <View style={styles.section}>
                {!!auth.currentUser && (
                  <Pressable
                    style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
                    onPress={async () => {
                      close();
                      await signOut(auth);
                      router.replace("/login");
                    }}
                  >
                    <View style={styles.itemLeft}>
                      <View style={[styles.iconBadge, styles.logoutBadge]}>
                        <Ionicons name="log-out-outline" size={MENU_ICON_SIZE} color="#ff4d4d" />
                      </View>
                      <ThemedText style={[styles.itemText, styles.logoutText]}>Log out</ThemedText>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#ff4d4d" />
                  </Pressable>
                )}
              </View>
            </>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.editPad}>
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <ThemedText style={styles.cardTitle}>Account</ThemedText>
                    <ThemedText style={styles.cardSub}>Update your details and avatar</ThemedText>
                  </View>
                </View>

                <View style={styles.field}>
                  <ThemedText style={styles.label}>Username</ThemedText>
                  <View style={styles.inputWrap}>
                    <Ionicons name="person-outline" size={16} color="#a3a3a3" />
                    <TextInput
                      value={editName}
                      onChangeText={(t) => {
                        setEditName(t);
                        setSaveNotice("");
                      }}
                      placeholder="Enter username"
                      placeholderTextColor="#6b7280"
                      style={styles.input}
                      autoCapitalize="words"
                    />
                  </View>
                </View>

                <View style={styles.field}>
                  <ThemedText style={styles.label}>Email</ThemedText>
                  <View style={styles.inputWrap}>
                    <Ionicons name="mail-outline" size={16} color="#a3a3a3" />
                    <TextInput
                      value={editEmail}
                      onChangeText={(t) => {
                        setEditEmail(t);
                        setSaveNotice("");
                      }}
                      placeholder="Enter email"
                      placeholderTextColor="#6b7280"
                      style={styles.input}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  </View>
                </View>

                <View style={styles.field}>
                  <ThemedText style={styles.label}>Password</ThemedText>
                  <View style={styles.inputWrap}>
                    <Ionicons name="lock-closed-outline" size={16} color="#a3a3a3" />
                    <TextInput
                      value={editPassword}
                      onChangeText={(t) => {
                        setEditPassword(t);
                        setSaveNotice("");
                      }}
                      placeholder="New password (min 6)"
                      placeholderTextColor="#6b7280"
                      style={styles.input}
                      secureTextEntry
                    />
                  </View>
                  {!passwordReady && <ThemedText style={[styles.notice, styles.bad, styles.hint]}>Password must be at least 6 characters.</ThemedText>}
                </View>

                <View style={styles.field}>
                  <View style={styles.avatarHeadRow}>
                    <ThemedText style={styles.label}>Choose Avatar</ThemedText>
                    <View style={styles.avatarPreview}>
                      <Image source={editAvatarSource} style={styles.previewImg} contentFit="cover" />
                    </View>
                  </View>

                  <View style={styles.grid}>
                    {AVATAR_CHOICES.map((a) => {
                      const selected = (editPhoto || "") === a.key;
                      return (
                        <Pressable
                          key={a.key}
                          onPress={() => {
                            setEditPhoto(a.key);
                            setSaveNotice("");
                          }}
                          style={({ pressed }) => [styles.avatarOption, selected && styles.avatarOptionSelected, pressed && styles.itemPressed]}
                        >
                          <Image source={a.src} style={styles.avatarImg} contentFit="cover" />
                          <View style={[styles.avatarPill, selected && styles.avatarPillSelected]}>
                            <ThemedText style={[styles.avatarLbl, selected && styles.avatarLblSelected]}>{a.label}</ThemedText>
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                <Pressable
                  style={({ pressed }) => [
                    styles.primary,
                    (saving || !auth.currentUser || !hasChanges) && styles.primaryDisabled,
                    pressed && !saving && hasChanges && styles.primaryPressed,
                  ]}
                  disabled={saving || !auth.currentUser || !hasChanges}
                  onPress={performSave}
                >
                  <Ionicons name="save-outline" size={16} color="white" />
                  <ThemedText style={styles.primaryText}>{saving ? "SAVING..." : "SAVE CHANGES"}</ThemedText>
                </Pressable>

                {!!saveNotice && <ThemedText style={[styles.notice, saveOk ? styles.ok : styles.bad]}>{saveNotice}</ThemedText>}
                {!saveNotice && !hasChanges && <ThemedText style={[styles.notice, styles.muted]}>No changes yet.</ThemedText>}
              </View>
            </ScrollView>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: "flex-start" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.78)" },
  dismiss: { ...StyleSheet.absoluteFillObject },

  sheet: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    height: "95%",
    backgroundColor: "#000000",
    borderLeftWidth: 1,
    borderColor: "#000000",
    paddingHorizontal: 14,
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 28,
    shadowOffset: { width: -10, height: 0 },
  },

  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingBottom: 10, paddingTop: 4 },
  topLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  title: { fontSize: 15, color: "#fff", letterSpacing: 0.2, fontFamily: "Poppins_600SemiBold" },

  navBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "#141414",
    borderWidth: 1,
    borderColor: "#242424",
    alignItems: "center",
    justifyContent: "center",
  },

  hero: {
    borderWidth: 1,
    borderColor: "#242424",
    borderRadius: 18,
    padding: 12,
    backgroundColor: "#111111",
  },
  heroTop: { flexDirection: "row", alignItems: "center" },
  avatarRing: {
    width: 52,
    height: 52,
    borderRadius: 18,
    padding: 2,
    backgroundColor: "#0b0b0b",
    borderWidth: 1,
    borderColor: "#242424",
  },
  headerAvatar: { width: "100%", height: "100%", borderRadius: 16, backgroundColor: "#1f1f1f" },
  heroText: { marginLeft: 12, flex: 1, minWidth: 0 },
  headerName: { fontSize: 16, color: "#fff", fontFamily: "Poppins_600SemiBold" },
  headerAlias: { fontSize: 12, color: "#b3b3b3", fontFamily: "Poppins_400Regular", marginTop: 2 },
  headerEmail: { fontSize: 12, color: "#8a8a8a", fontFamily: "Poppins_400Regular", marginTop: 2 },

  secondaryBtn: {
    marginTop: 10,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#242424",
    backgroundColor: "#141414",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  secondaryText: { fontSize: 12, color: "#fff", fontFamily: "Poppins_500Medium" },
  pressedBtn: { opacity: 0.9, transform: [{ scale: 0.99 }] },

  section: { marginTop: 10 },

  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#242424",
    backgroundColor: "#111111",
  },
  itemPressed: { transform: [{ scale: 0.99 }], opacity: 0.92 },

  itemLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconBadge: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "#141414",
    borderWidth: 1,
    borderColor: "#242424",
    alignItems: "center",
    justifyContent: "center",
  },

  itemText: { fontSize: 14, color: "#fff", fontFamily: "Poppins_500Medium" },

  logoutText: { color: "#ff4d4d", fontFamily: "Poppins_500Medium" },
  logoutBadge: { backgroundColor: "#1a0b0b", borderColor: "#3a1a1a" },

  editPad: { paddingBottom: 26 },
  card: {
    borderWidth: 1,
    borderColor: "#242424",
    borderRadius: 18,
    padding: 12,
    backgroundColor: "#111111",
    marginBottom: 10,
  },

  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardHeaderLeft: { flex: 1, minWidth: 0, paddingRight: 10 },
  cardTitle: { fontSize: 13, color: "#fff", fontFamily: "Poppins_600SemiBold" },
  cardSub: { fontSize: 11, color: "#b3b3b3", marginTop: 2, fontFamily: "Poppins_400Regular" },

  field: { marginTop: 12 },
  label: { fontSize: 12, color: "#b3b3b3", marginBottom: 8, fontFamily: "Poppins_400Regular" },

  inputWrap: {
    height: 44,
    borderWidth: 1,
    borderColor: "#242424",
    borderRadius: 14,
    backgroundColor: "#0f0f0f",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: { flex: 1, fontSize: 14, color: "#fff", fontFamily: "Poppins_400Regular", paddingVertical: 0 },

  avatarHeadRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  avatarPreview: {
    width: 28,
    height: 28,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#242424",
    backgroundColor: "#141414",
    overflow: "hidden",
  },
  previewImg: { width: "100%", height: "100%" },

  grid: { marginTop: 10, flexDirection: "row", flexWrap: "wrap", gap: 10 },
  avatarOption: {
    width: "30.5%",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#242424",
    backgroundColor: "#0f0f0f",
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  avatarOptionSelected: { borderColor: "#fff", borderWidth: 2 },
  avatarImg: { width: 38, height: 38, borderRadius: 14, backgroundColor: "#1f1f1f" },
  avatarPill: {
    marginTop: 8,
    paddingHorizontal: 8,
    height: 22,
    borderRadius: 999,
    backgroundColor: "#141414",
    borderWidth: 1,
    borderColor: "#242424",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarPillSelected: { backgroundColor: "#fff", borderColor: "#fff" },
  avatarLbl: { fontSize: 11, color: "#fff", fontFamily: "Poppins_500Medium" },
  avatarLblSelected: { color: "#111" },

  primary: {
    marginTop: 14,
    height: 44,
    backgroundColor: "#000000",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    borderWidth: 1,
    borderColor: "#000000",
  },
  primaryPressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
  primaryDisabled: { opacity: 0.5 },
  primaryText: { color: "white", fontSize: 12, letterSpacing: 0.6, fontFamily: "Poppins_600SemiBold" },

  notice: { marginTop: 10, fontSize: 12, lineHeight: 18, fontFamily: "Poppins_400Regular" },
  ok: { color: "#22c55e" },
  bad: { color: "#ff4d4d" },
  muted: { color: "#a3a3a3" },
  hint: { marginTop: 8 },
});
