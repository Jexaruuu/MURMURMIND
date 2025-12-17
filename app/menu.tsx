import Navigation from "@/components/navigation";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { auth, db } from "@/firebase";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { onAuthStateChanged, signOut, updateEmail, updatePassword, updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

const FEED = [
  "Start small, but start now.",
  "Progress over perfection, always.",
  "Your future self is watching—impress them.",
  "One more try can change everything.",
  "Discipline beats motivation on tough days.",
  "You’re closer than you think—keep going.",
];

const SHOW_SOCIAL = false;
const SHOW_BOTTOM_NAV = false;

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

export default function Menu() {
  const [qIndex, setQIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const [username, setUsername] = useState("Username");
  const [userEmail, setUserEmail] = useState<string>("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoBroken, setPhotoBroken] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
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

  const quote = useMemo(() => QUOTES[qIndex % QUOTES.length], [qIndex]);
  const insets = useSafeAreaInsets();

  const menuX = useRef(new Animated.Value(MENU_WIDTH)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const assetFor = (v: string | null | undefined) => {
    if (!v) return null;
    if (typeof v !== "string") return null;
    const k = v.trim();
    if (!k.startsWith(ASSET_PREFIX)) return null;
    return AVATAR_ASSETS[k] || null;
  };

  const avatarAsset = assetFor(photoUrl);
  const avatarSource = avatarAsset ? avatarAsset : photoUrl && !photoBroken ? { uri: photoUrl } : fallbackAvatar;
  const avatarCanError = !avatarAsset && !!photoUrl;

  const isHttpUrl = (v: string | null | undefined) => {
    if (!v) return false;
    const s = String(v).trim().toLowerCase();
    return s.startsWith("http://") || s.startsWith("https://");
  };

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

  const showNotice = (text: string, ok = true) => {
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    setSaveOk(ok);
    setSaveNotice(text);
    noticeTimer.current = setTimeout(() => {
      setSaveNotice("");
    }, 2600);
  };

  useEffect(() => {
    return () => {
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
    };
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setPhotoBroken(false);

      if (!u) {
        setUsername("Guest");
        setUserEmail("");
        setPhotoUrl(null);
        return;
      }

      const quick = (u.displayName || "").trim() || (u.email ? u.email.split("@")[0] : "").trim();
      if (quick) setUsername(quick);

      const e = typeof u.email === "string" ? u.email.trim() : "";
      setUserEmail(e);

      const authPhoto = typeof u.photoURL === "string" && u.photoURL.trim() ? u.photoURL.trim() : null;
      setPhotoUrl(authPhoto);

      try {
        const snap = await getDoc(doc(db, "users", u.uid));
        if (snap.exists()) {
          const data: any = snap.data();
          const n = typeof data?.name === "string" ? data.name.trim() : "";
          if (n) setUsername(n);

          const mail = typeof data?.email === "string" ? data.email.trim() : "";
          if (mail) setUserEmail(mail);

          const fsPhoto = typeof data?.photoUrl === "string" && data.photoUrl.trim() ? data.photoUrl.trim() : null;
          if (fsPhoto) setPhotoUrl(fsPhoto);
        }
      } catch {}
    });

    return () => unsub();
  }, []);

  const openMenu = () => {
    if (menuVisible) return;
    setMenuOpen(true);
    setMenuVisible(true);
    menuX.setValue(MENU_WIDTH);
    backdropOpacity.setValue(0);
    Animated.parallel([
      Animated.timing(menuX, {
        toValue: 0,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeMenu = () => {
    if (!menuVisible) return;
    Animated.parallel([
      Animated.timing(menuX, {
        toValue: MENU_WIDTH,
        duration: 230,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setMenuOpen(false);
        setMenuVisible(false);
        setEditOpen(false);
        setSaveNotice("");
      }
    });
  };

  const toggleMenu = () => {
    if (menuVisible || menuOpen) closeMenu();
    else openMenu();
  };

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
        setPhotoUrl(dataUrl);
        setSaveNotice("");
        return;
      }

      if (asset.uri) {
        setEditPhoto(asset.uri);
        setPhotoBroken(false);
        setPhotoUrl(asset.uri);
        setSaveNotice("");
      }
    } catch {}
  };

  const editAsset = assetFor(editPhoto);
  const editAvatarSource = editAsset ? editAsset : editPhoto ? { uri: editPhoto } : editPlaceholder;

  const trim = (v: any) => (typeof v === "string" ? v.trim() : "");
  const same = (a: any, b: any) => trim(a) === trim(b);

  const nameChanged = trim(editName) && !same(editName, baseName);
  const emailChanged = trim(editEmail) && !same(editEmail, baseEmail);
  const photoChanged = (editPhoto || null) !== (basePhoto || null);
  const passwordReady = editPassword.length === 0 || editPassword.length >= 6;
  const passwordChanged = editPassword.length >= 6;

  const hasChanges = (nameChanged || emailChanged || photoChanged || passwordChanged) && passwordReady;

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
      const fsPatch: any = { updatedAt: Date.now() };
      if (nextName && !same(nextName, baseName)) fsPatch.name = nextName;
      if (nextEmail && !same(nextEmail, baseEmail)) fsPatch.email = nextEmail;
      if (photoChanged && editPhoto) fsPatch.photoUrl = editPhoto;

      await setDoc(doc(db, "users", u.uid), fsPatch, { merge: true });

      if (nextName && nextName !== (u.displayName || "").trim()) {
        await updateProfile(u, { displayName: nextName });
      }

      if (isHttpUrl(editPhoto) && editPhoto !== (u.photoURL || "").trim()) {
        await updateProfile(u, { photoURL: editPhoto });
      }

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
      if (photoChanged && editPhoto) {
        setPhotoUrl(editPhoto);
        setPhotoBroken(false);
      }

      if (didPasswordChange) {
        closeMenu();
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

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="dark" />

      <Navigation
        username={username}
        avatarSource={avatarSource}
        onMenuPress={toggleMenu}
        onAvatarError={() => {
          if (avatarCanError) setPhotoBroken(true);
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollPad} showsVerticalScrollIndicator={false}>
        <View style={styles.quoteCard}>
          <ThemedText type="title" style={styles.quoteTitle}>
            Quote of the Day
          </ThemedText>
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
                <Image source={fallbackAvatar} style={styles.avatarImg} contentFit="cover" />
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

      {menuVisible && (
        <>
          <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} pointerEvents="none" />
          <Pressable style={[styles.dismissArea, { right: MENU_WIDTH }]} onPress={closeMenu} />
          <View style={styles.menuCaret} />
          <Animated.View
            style={[
              styles.menuSheet,
              {
                width: MENU_WIDTH,
                transform: [{ translateX: menuX }],
                paddingTop: 14 + Math.max(insets.top, 12),
                paddingBottom: 16 + Math.max(insets.bottom, 12),
              },
            ]}
          >
            <View style={styles.menuTopRow}>
              <View style={styles.menuTopLeft}>
                {editOpen && (
                  <Pressable
                    style={styles.backBtn}
                    onPress={() => {
                      setEditOpen(false);
                      setSaveNotice("");
                    }}
                  >
                    <ThemedText style={styles.backIcon}>‹</ThemedText>
                  </Pressable>
                )}
                <ThemedText style={styles.menuTitle}>{editOpen ? "Edit profile" : "Menu"}</ThemedText>
              </View>
              <Pressable onPress={closeMenu} style={styles.closeBtn}>
                <ThemedText style={styles.closeIcon}>✕</ThemedText>
              </Pressable>
            </View>

            {!editOpen ? (
              <>
                <View style={styles.menuHeader}>
                  <Image
                    source={avatarSource}
                    style={styles.menuHeaderAvatar}
                    contentFit="cover"
                    onError={() => {
                      if (avatarCanError) setPhotoBroken(true);
                    }}
                  />
                  <View style={styles.menuHeaderTextWrap}>
                    <ThemedText style={styles.menuHeaderName}>{username}</ThemedText>
                    <Pressable onPress={openEdit} style={({ pressed }) => [styles.editTextBtn, pressed && styles.editTextBtnPressed]}>
                      <ThemedText style={styles.editTextBtnText}>Edit Profile</ThemedText>
                    </Pressable>
                  </View>
                </View>

                <View style={styles.menuDivider} />

                <Pressable
                  style={({ pressed }) => [styles.menuItem, styles.logoutItem, pressed && styles.menuItemPressed]}
                  onPress={async () => {
                    closeMenu();
                    await signOut(auth);
                    router.replace("/login");
                  }}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={[styles.menuIconBadge, styles.logoutBadge]}>
                      <Ionicons name="log-out-outline" size={MENU_ICON_SIZE} color="#b91c1c" />
                    </View>
                    <ThemedText style={[styles.menuText, styles.logoutText]}>Log out</ThemedText>
                  </View>
                  <ThemedText style={[styles.menuChevron, styles.logoutText]}>›</ThemedText>
                </Pressable>
              </>
            ) : (
              <>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.editScrollPad}>
                  <View style={styles.sectionCard}>
                    <ThemedText style={styles.sectionTitle}>Account</ThemedText>

                    <View style={styles.field}>
                      <ThemedText style={styles.fieldLabel}>Username</ThemedText>
                      <View style={styles.inputWrap}>
                        <TextInput
                          value={editName}
                          onChangeText={(t) => {
                            setEditName(t);
                            setSaveNotice("");
                          }}
                          placeholder="Enter username"
                          placeholderTextColor="#9ca3af"
                          style={styles.input}
                          autoCapitalize="words"
                        />
                      </View>
                    </View>

                    <View style={styles.field}>
                      <ThemedText style={styles.fieldLabel}>Email</ThemedText>
                      <View style={styles.inputWrap}>
                        <TextInput
                          value={editEmail}
                          onChangeText={(t) => {
                            setEditEmail(t);
                            setSaveNotice("");
                          }}
                          placeholder="Enter email"
                          placeholderTextColor="#9ca3af"
                          style={styles.input}
                          autoCapitalize="none"
                          keyboardType="email-address"
                        />
                      </View>
                    </View>

                    <View style={styles.field}>
                      <ThemedText style={styles.fieldLabel}>Password</ThemedText>
                      <View style={styles.inputWrap}>
                        <TextInput
                          value={editPassword}
                          onChangeText={(t) => {
                            setEditPassword(t);
                            setSaveNotice("");
                          }}
                          placeholder="New password (min 6)"
                          placeholderTextColor="#9ca3af"
                          style={styles.input}
                          secureTextEntry
                        />
                      </View>
                      {!passwordReady && (
                        <ThemedText style={[styles.noticeText, styles.noticeBad, styles.passwordHint]}>
                          Password must be at least 6 characters.
                        </ThemedText>
                      )}
                    </View>

                    <View style={styles.field}>
                      <ThemedText style={styles.fieldLabel}>Profile picture</ThemedText>

                      <Pressable style={styles.photoRow} onPress={pickImage}>
                        <Image source={editAvatarSource} style={styles.editAvatar} contentFit="cover" />
                        <View style={styles.photoMeta}>
                          <ThemedText style={styles.photoTitle}>Upload from gallery</ThemedText>
                          <ThemedText style={styles.photoSub}>Tap to pick an image.</ThemedText>
                        </View>
                      </Pressable>

                      <View style={styles.avatarGrid}>
                        {AVATAR_CHOICES.map((a) => {
                          const selected = (editPhoto || "") === a.key;
                          return (
                            <Pressable
                              key={a.key}
                              onPress={() => {
                                setEditPhoto(a.key);
                                setSaveNotice("");
                              }}
                              style={({ pressed }) => [styles.avatarOption, selected && styles.avatarOptionSelected, pressed && styles.avatarOptionPressed]}
                            >
                              <Image source={a.src} style={styles.avatarOptionImg} contentFit="cover" />
                              <ThemedText style={styles.avatarOptionLabel}>{a.label}</ThemedText>
                            </Pressable>
                          );
                        })}
                      </View>
                    </View>

                    <Pressable
                      style={({ pressed }) => [
                        styles.primaryBtn,
                        (saving || !auth.currentUser || !hasChanges) && styles.primaryBtnDisabled,
                        pressed && !saving && hasChanges && styles.primaryBtnPressed,
                      ]}
                      disabled={saving || !auth.currentUser || !hasChanges}
                      onPress={performSave}
                    >
                      <ThemedText style={styles.primaryBtnText}>{saving ? "SAVING..." : "SAVE CHANGES"}</ThemedText>
                    </Pressable>

                    {!!saveNotice && (
                      <ThemedText style={[styles.noticeText, saveOk ? styles.noticeOk : styles.noticeBad]}>
                        {saveNotice}
                      </ThemedText>
                    )}

                    {!saveNotice && !hasChanges && (
                      <ThemedText style={[styles.noticeText, styles.noticeMuted]}>
                        No changes yet.
                      </ThemedText>
                    )}
                  </View>
                </ScrollView>
              </>
            )}
          </Animated.View>
        </>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },

  scrollPad: { paddingHorizontal: 12, paddingBottom: 160 },

  quoteCard: {
    backgroundColor: "#0a0a0a",
    borderRadius: 20,
    padding: 16,
    marginTop: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  notifyBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  notifyIcon: { color: "white", fontSize: 18 },
  quoteTitle: { color: "white", textAlign: "center", marginBottom: 8, fontSize: 18, paddingRight: 28 },
  quoteText: { color: "white", textAlign: "center", lineHeight: 22, marginTop: 6, marginBottom: 14 },
  quoteActions: { flexDirection: "row", alignItems: "center", gap: 10 },
  circleBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "white", alignItems: "center", justifyContent: "center" },
  circleIcon: { color: "#111", fontSize: 16 },
  generateBtn: {
    marginLeft: "auto",
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  generateText: { color: "#111", fontSize: 12, letterSpacing: 0.5 },

  feedWrap: { marginTop: 16, gap: 10 },
  post: { backgroundColor: "white", borderRadius: 14, borderWidth: 1, borderColor: "#e5e7eb", padding: 12 },
  postHead: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#0a0a0a" },
  avatarImg: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#e5e7eb" },
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
    borderColor: "#e5e7eb",
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
    justifyContent: "space-between",
  },
  navBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  navIcon: { color: "white", fontSize: 18 },

  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.38)" },
  dismissArea: { position: "absolute", top: 0, bottom: 0, left: 0 },
  menuCaret: { position: "absolute", opacity: 0 },

  menuSheet: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    backgroundColor: "white",
    borderTopLeftRadius: 22,
    borderBottomLeftRadius: 22,
    borderLeftWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 14,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 24,
    shadowOffset: { width: -8, height: 0 },
  },

  menuTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 10,
  },
  menuTopLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  menuTitle: { fontSize: 14, color: "#111", letterSpacing: 0.4 },

  backBtn: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: { fontSize: 20, marginTop: -2, color: "#111" },

  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  closeIcon: { fontSize: 16, color: "#111" },

  menuHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 2,
    paddingVertical: 10,
  },
  menuHeaderAvatar: { width: 44, height: 44, borderRadius: 12, backgroundColor: "#e5e7eb" },
  menuHeaderTextWrap: { marginLeft: 12, flex: 1 },
  menuHeaderName: { fontSize: 16, color: "#111" },

  editTextBtn: { marginTop: 6, alignSelf: "flex-start" },
  editTextBtnPressed: { opacity: 0.75 },
  editTextBtnText: { fontSize: 12, color: "#111", textDecorationLine: "underline" },

  editPill: {
    marginTop: 6,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  editPillPressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
  editPillText: { fontSize: 12, color: "#111" },

  menuDivider: { height: 1, backgroundColor: "rgba(0,0,0,0.06)", marginVertical: 10 },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "white",
    marginBottom: 10,
  },
  menuItemPressed: { transform: [{ scale: 0.99 }], opacity: 0.92 },

  menuItemLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  menuIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },

  menuText: { fontSize: 14, color: "#111" },
  menuChevron: { fontSize: 18, color: "#9ca3af", marginTop: -1 },

  logoutItem: { marginTop: 2 },
  logoutText: { color: "#b91c1c" },
  logoutBadge: { backgroundColor: "#fef2f2", borderColor: "#fecaca" },

  editScrollPad: { paddingBottom: 30 },
  sectionCard: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 16,
    padding: 12,
    backgroundColor: "white",
    marginBottom: 10,
  },
  sectionHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  sectionTitle: { fontSize: 13, color: "#111" },

  smallBtn: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  smallBtnPressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
  smallBtnText: { fontSize: 12, color: "#111" },

  uploadBtn: {
    backgroundColor: "#0a0a0a",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadBtnText: { color: "white", fontSize: 12, letterSpacing: 0.6 },

  photoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "white",
  },
  photoRowPressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
  editAvatar: { width: 46, height: 46, borderRadius: 14, backgroundColor: "#e5e7eb" },
  photoMeta: { flex: 1 },
  photoTitle: { fontSize: 13, color: "#111" },
  photoSub: { fontSize: 12, color: "#6b7280", marginTop: 2 },

  field: { marginTop: 10 },
  fieldLabel: { fontSize: 12, color: "#6b7280", marginBottom: 6 },
  inputWrap: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    backgroundColor: "white",
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  input: { fontSize: 14, color: "#111" },

  avatarPickerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "white",
  },
  editAvatarPreview: { width: 46, height: 46, borderRadius: 14, backgroundColor: "#e5e7eb" },
  avatarPickerMeta: { flex: 1 },
  avatarPickerTitle: { fontSize: 13, color: "#111" },
  avatarPickerSub: { fontSize: 12, color: "#6b7280", marginTop: 2 },

  avatarGrid: { marginTop: 10, flexDirection: "row", flexWrap: "wrap", gap: 10 },
  avatarOption: {
    width: "47%",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "white",
    padding: 10,
    paddingRight: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatarOptionSelected: { borderColor: "#111", borderWidth: 2 },
  avatarOptionPressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
  avatarOptionImg: { width: 34, height: 34, borderRadius: 12, backgroundColor: "#e5e7eb" },
  avatarOptionLabel: { fontSize: 12, color: "#111" },

  primaryBtn: {
    marginTop: 12,
    backgroundColor: "#0a0a0a",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnInline: {
    backgroundColor: "#0a0a0a",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 110,
  },
  primaryBtnPressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnText: { color: "white", fontSize: 12, letterSpacing: 0.6 },

  noticeText: { marginTop: 10, fontSize: 12, lineHeight: 18 },
  noticeOk: { color: "#16a34a" },
  noticeBad: { color: "#b91c1c" },
  noticeMuted: { color: "#6b7280" },
  passwordHint: { marginTop: 8 },

  overlayWrap: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  overlayBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.35)" },
  overlayCard: {
    width: MENU_WIDTH - 28,
    maxWidth: 320,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "white",
    padding: 14,
  },
  overlayHeader: { flexDirection: "row", alignItems: "center" },
  overlayIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },
  overlayTextWrap: { marginLeft: 10, flex: 1 },
  overlayTitle: { fontSize: 14, color: "#111" },
  overlaySub: { fontSize: 12, color: "#6b7280", marginTop: 4, lineHeight: 18 },
  overlayActions: { marginTop: 12, flexDirection: "row", justifyContent: "flex-end" },

  secondaryBtn: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "white",
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnPressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
  secondaryBtnText: { fontSize: 12, color: "#111", letterSpacing: 0.6 },
});
