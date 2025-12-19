import HomeNavigation from "@/components/homenavigation";
import Navigation from "@/components/navigation";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { auth, db } from "@/firebase";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { addDoc, collection, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { useMemo, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  StatusBar as RNStatusBar,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Path, Svg, SvgXml } from "react-native-svg";

type MediaType = "image" | "drawing" | null;

function approxBytesFromBase64(b64: string) {
  if (!b64) return 0;
  const cleaned = b64.replace(/\s/g, "");
  const padding = cleaned.endsWith("==") ? 2 : cleaned.endsWith("=") ? 1 : 0;
  return Math.floor((cleaned.length * 3) / 4) - padding;
}

function DrawingModal({
  visible,
  onCancel,
  onSave,
}: {
  visible: boolean;
  onCancel: () => void;
  onSave: (svg: string) => void;
}) {
  type DrawPath = { d: string; c: string };

  const COLORS = useMemo(
    () => [
      "#111111",
      "#EF4444",
      "#F97316",
      "#F59E0B",
      "#10B981",
      "#06B6D4",
      "#3B82F6",
      "#6366F1",
      "#A855F7",
      "#EC4899",
      "#8B5CF6",
      "#22C55E",
    ],
    []
  );

  const [w, setW] = useState(320);
  const [h, setH] = useState(320);
  const [paths, setPaths] = useState<DrawPath[]>([]);
  const [current, setCurrent] = useState<string>("");
  const currentRef = useRef<string>("");
  const [strokeColor, setStrokeColor] = useState<string>("#111111");
  const strokeColorRef = useRef<string>("#111111");
  const currentColorRef = useRef<string>("#111111");

  const reset = () => {
    setPaths([]);
    setCurrent("");
    currentRef.current = "";
    currentColorRef.current = strokeColorRef.current;
  };

  const setColor = (c: string) => {
    strokeColorRef.current = c;
    setStrokeColor(c);
  };

  const undo = () => {
    if (current) {
      setCurrent("");
      currentRef.current = "";
      return;
    }
    setPaths((prev) => (prev.length ? prev.slice(0, -1) : prev));
  };

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (e) => {
          const { locationX, locationY } = e.nativeEvent;
          const d = `M ${locationX.toFixed(2)} ${locationY.toFixed(2)}`;
          currentRef.current = d;
          currentColorRef.current = strokeColorRef.current;
          setCurrent(d);
        },
        onPanResponderMove: (e) => {
          const { locationX, locationY } = e.nativeEvent;
          const next = `${currentRef.current} L ${locationX.toFixed(2)} ${locationY.toFixed(2)}`;
          currentRef.current = next;
          setCurrent(next);
        },
        onPanResponderRelease: () => {
          const d = currentRef.current;
          const c = currentColorRef.current || strokeColorRef.current;
          if (d && d.length > 3) setPaths((prev) => [...prev, { d, c }]);
          currentRef.current = "";
          setCurrent("");
        },
        onPanResponderTerminate: () => {
          const d = currentRef.current;
          const c = currentColorRef.current || strokeColorRef.current;
          if (d && d.length > 3) setPaths((prev) => [...prev, { d, c }]);
          currentRef.current = "";
          setCurrent("");
        },
      }),
    []
  );

  const buildSvg = () => {
    const strokeWidth = 4;
    const joined: DrawPath[] = [
      ...paths,
      ...(current ? [{ d: current, c: currentColorRef.current || strokeColorRef.current }] : []),
    ];
    const body = joined
      .filter((p) => p?.d)
      .map(
        (p) =>
          `<path d="${p.d}" fill="none" stroke="${p.c}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" />`
      )
      .join("");
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${body}</svg>`;
  };

  const handleSave = () => {
    const joined = [
      ...paths,
      ...(current ? [{ d: current, c: currentColorRef.current || strokeColorRef.current }] : []),
    ].filter(Boolean);
    if (!joined.length) return;
    onSave(buildSvg());
    reset();
  };

  const handleCancel = () => {
    reset();
    onCancel();
  };

  const canSave = paths.length > 0 || !!current;
  const canUndo = paths.length > 0 || !!current;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={handleCancel}
      statusBarTranslucent
      presentationStyle="overFullScreen"
    >
      <View style={styles.drawWrap}>
        <Pressable style={styles.drawBackdrop} onPress={handleCancel} />
        <View style={styles.drawCard}>
          <View style={styles.drawHead}>
            <View style={styles.drawTitleWrap}>
              <ThemedText style={styles.drawKicker}>Drawing</ThemedText>
              <ThemedText type="title" style={styles.drawTitle}>
                Make a quick sketch
              </ThemedText>
            </View>

            <Pressable style={({ pressed }) => [styles.drawX, pressed && styles.pressed]} onPress={handleCancel}>
              <ThemedText style={styles.drawXText}>✕</ThemedText>
            </Pressable>
          </View>

          <View style={styles.colorRow}>
            {COLORS.map((c) => {
              const selected = strokeColor === c;
              return (
                <Pressable
                  key={c}
                  onPress={() => setColor(c)}
                  style={({ pressed }) => [
                    styles.colorSwatch,
                    { backgroundColor: c },
                    selected && styles.colorSwatchSelected,
                    pressed && styles.pressed,
                  ]}
                />
              );
            })}
          </View>

          <View
            style={styles.canvasBox}
            onLayout={(e) => {
              const nw = Math.max(240, Math.floor(e.nativeEvent.layout.width));
              const nh = Math.max(240, Math.floor(e.nativeEvent.layout.height));
              setW(nw);
              setH(nh);
            }}
            {...pan.panHandlers}
          >
            <Svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`}>
              {paths.map((p, i) => (
                <Path
                  key={String(i)}
                  d={p.d}
                  fill="none"
                  stroke={p.c}
                  strokeWidth={4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
              {!!current && (
                <Path
                  d={current}
                  fill="none"
                  stroke={currentColorRef.current || strokeColor}
                  strokeWidth={4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </Svg>
          </View>

          <View style={styles.drawActions}>
            <Pressable
              style={({ pressed }) => [
                styles.drawBtn,
                styles.drawBtnGhost,
                pressed && styles.pressed,
                !canUndo && styles.drawBtnDisabled,
              ]}
              onPress={undo}
              disabled={!canUndo}
            >
              <ThemedText style={styles.drawBtnGhostText}>Undo</ThemedText>
            </Pressable>

            <Pressable style={({ pressed }) => [styles.drawBtn, styles.drawBtnGhost, pressed && styles.pressed]} onPress={reset}>
              <ThemedText style={styles.drawBtnGhostText}>Clear</ThemedText>
            </Pressable>

            <View style={{ flex: 1 }} />

            <Pressable
              style={({ pressed }) => [styles.drawBtn, pressed && styles.pressed, !canSave && styles.drawBtnDisabled]}
              onPress={handleSave}
              disabled={!canSave}
            >
              <ThemedText style={styles.drawBtnText}>Save</ThemedText>
            </Pressable>
          </View>

          {canSave && (
            <View style={styles.drawHintRow}>
              <View style={styles.drawHintDot} />
              <ThemedText style={styles.drawHintText}>Tip: pick a color, draw, then tap Save.</ThemedText>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

export default function Compose() {
  const insets = useSafeAreaInsets();

  const topInset = useMemo(() => {
    const androidH = Platform.OS === "android" ? Number(RNStatusBar.currentHeight || 0) : 0;
    return Math.max(Number(insets.top || 0), androidH);
  }, [insets.top]);

  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);

  const [mediaType, setMediaType] = useState<MediaType>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [drawingSvg, setDrawingSvg] = useState<string | null>(null);

  const [drawOpen, setDrawOpen] = useState(false);
  const [error, setError] = useState<string>("");

  const TEXT_COLORS = useMemo(
    () => ["#111111", "#EF4444", "#F97316", "#F59E0B", "#10B981", "#06B6D4", "#3B82F6", "#6366F1", "#A855F7", "#EC4899", "#22C55E"],
    []
  );
  const [textColor, setTextColor] = useState<string>("#111111");

  const max = 280;
  const over = text.length > max;

  const progress = useMemo(() => Math.min(1, text.length / max), [text.length]);
  const remaining = max - text.length;

  const hasMedia = useMemo(() => {
    if (mediaType === "image") return !!mediaUrl;
    if (mediaType === "drawing") return !!drawingSvg;
    return false;
  }, [mediaType, mediaUrl, drawingSvg]);

  const empty = useMemo(() => text.trim().length === 0, [text]);

  const clearMedia = () => {
    setMediaType(null);
    setMediaUrl(null);
    setDrawingSvg(null);
  };

  const pickImage = async () => {
    setError("");
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setError("Please allow photo access to upload an image.");
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"] as ImagePicker.MediaType[],
      quality: 0.6,
      base64: true,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (res.canceled) return;

    const asset = res.assets && res.assets.length ? res.assets[0] : null;
    const b64 = asset?.base64 ? String(asset.base64) : "";
    if (!b64) {
      setError("Could not read the image. Try again.");
      return;
    }

    const bytes = approxBytesFromBase64(b64);
    if (bytes > 700_000) {
      setError("That image is too large for this post. Pick a smaller image or crop it more.");
      return;
    }

    const mime = typeof asset?.mimeType === "string" && asset.mimeType.includes("/") ? asset.mimeType : "image/jpeg";
    const uri = `data:${mime};base64,${b64}`;

    setMediaType("image");
    setMediaUrl(uri);
    setDrawingSvg(null);
  };

  const openDrawing = () => {
    setError("");
    setDrawOpen(true);
  };

  const submitPost = async () => {
    if (posting) return;

    const trimmed = text.trim();
    if (over) return;
    if (!trimmed) return;

    const u = auth.currentUser;
    if (!u) {
      router.replace("/login");
      return;
    }

    setPosting(true);
    setError("");

    try {
      let username =
        (typeof u.displayName === "string" && u.displayName.trim()) ||
        (typeof u.email === "string" && u.email.includes("@") ? u.email.split("@")[0] : "") ||
        "Guest";

      let photoUrl = typeof u.photoURL === "string" && u.photoURL.trim() ? u.photoURL.trim() : null;

      const userSnap = await getDoc(doc(db, "users", u.uid));
      if (userSnap.exists()) {
        const d: any = userSnap.data();
        const n = typeof d?.name === "string" ? d.name.trim() : "";
        const p = typeof d?.photoUrl === "string" ? d.photoUrl.trim() : "";
        if (n) username = n;
        if (p) photoUrl = p;
      }

      const payload: any = {
        uid: u.uid,
        text: trimmed,
        textColor,
        username,
        photoUrl: photoUrl || null,
        createdAt: serverTimestamp(),
        createdAtMs: Date.now(),
        mediaType: mediaType || null,
        mediaUrl: mediaType === "image" ? mediaUrl || null : null,
        drawingSvg: mediaType === "drawing" ? drawingSvg || null : null,
      };

      await addDoc(collection(db, "posts"), payload);

      setText("");
      clearMedia();
      setTextColor("#111111");
      router.back();
    } catch {
      setError("Something went wrong while posting. Please try again.");
    } finally {
      setPosting(false);
    }
  };

  const [topNavH, setTopNavH] = useState(0);
  const navAnim = useRef(new Animated.Value(0)).current;
  const navHiddenRef = useRef(false);
  const lastScrollY = useRef(0);

  const setNavHidden = (hidden: boolean) => {
    if (navHiddenRef.current === hidden) return;
    navHiddenRef.current = hidden;
    Animated.timing(navAnim, {
      toValue: hidden ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  };

  const onComposeScroll = (e: any) => {
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

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="light" backgroundColor="#000" translucent />

      <View pointerEvents="none" style={[styles.statusBg, { height: topInset }]} />

      <Animated.View
        style={[styles.topNavWrap, { transform: [{ translateY: navTranslateY }], opacity: navOpacity }]}
        pointerEvents="auto"
        onLayout={(e) => {
          const h = Math.max(0, Math.floor(e.nativeEvent.layout.height));
          if (h && h !== topNavH) setTopNavH(h);
        }}
      >
        <Navigation />
        <View style={[styles.statusBg, { height: topInset }]} />
      </Animated.View>

      <KeyboardAvoidingView
        style={[styles.flex, { paddingTop: topNavH || 0 }]}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onScroll={onComposeScroll}
          scrollEventThrottle={16}
          bounces={false}
          alwaysBounceVertical={false}
          overScrollMode="never"
          contentInsetAdjustmentBehavior="never"
        >
          <View style={styles.header}>
            <View style={styles.headerMid}>
              <ThemedText type="title" style={styles.titleBlack}>
                Compose
              </ThemedText>
              <ThemedText style={styles.subtitle}>Share a thought, a win, or a question.</ThemedText>
            </View>
          </View>

          <View style={styles.contentPad}>
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

              <View style={styles.textColorRow}>
                <ThemedText style={styles.textColorLbl}>Choose Font Color:</ThemedText>

                <View style={styles.textColorSwatchesWrap}>
                  {TEXT_COLORS.map((c) => {
                    const selected = textColor === c;
                    return (
                      <Pressable
                        key={c}
                        onPress={() => setTextColor(c)}
                        style={({ pressed }) => [
                          styles.textColorSwatch,
                          { backgroundColor: c },
                          selected && styles.textColorSwatchSelected,
                          pressed && styles.pressed,
                        ]}
                      />
                    );
                  })}
                </View>
              </View>

              {mediaType === "image" && !!mediaUrl && (
                <View style={styles.previewBox}>
                  <Image source={{ uri: mediaUrl }} style={styles.previewImg} contentFit="cover" />
                </View>
              )}

              {mediaType === "drawing" && !!drawingSvg && (
                <View style={styles.previewBox}>
                  <SvgXml xml={drawingSvg} width="100%" height="100%" />
                </View>
              )}

              <View style={[styles.inputWrap, over && styles.inputWrapOver]}>
                <TextInput
                  value={text}
                  onChangeText={setText}
                  placeholder="Write something inspiring..."
                  placeholderTextColor="#9ca3af"
                  style={[styles.input, { color: textColor }]}
                  multiline
                />
              </View>

              <View style={styles.mediaRow}>
                <Pressable style={({ pressed }) => [styles.mediaBtn, pressed && styles.pressed]} onPress={pickImage}>
                  <ThemedText style={styles.mediaBtnText}>Add image</ThemedText>
                </Pressable>

                <Pressable style={({ pressed }) => [styles.mediaBtn, pressed && styles.pressed]} onPress={openDrawing}>
                  <ThemedText style={styles.mediaBtnText}>Draw</ThemedText>
                </Pressable>

                <View style={{ flex: 1 }} />

                {!!hasMedia && (
                  <Pressable
                    style={({ pressed }) => [styles.mediaBtn, styles.mediaBtnDanger, pressed && styles.pressed]}
                    onPress={clearMedia}
                  >
                    <ThemedText style={styles.mediaBtnDangerText}>Remove</ThemedText>
                  </Pressable>
                )}
              </View>

              {!!error && (
                <View style={styles.errorPill}>
                  <ThemedText style={styles.errorText}>{error}</ThemedText>
                </View>
              )}

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
              <ThemedText style={styles.tipText}>Write a thought first, then you can also add an image or drawing.</ThemedText>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <HomeNavigation />

      <DrawingModal
        visible={drawOpen}
        onCancel={() => setDrawOpen(false)}
        onSave={(svg) => {
          setMediaType("drawing");
          setDrawingSvg(svg);
          setMediaUrl(null);
          setDrawOpen(false);
        }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },

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

  pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },

  scrollContent: { paddingBottom: 210 },

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

  contentPad: { paddingHorizontal: 16, gap: 12, paddingTop: 10 },

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

  previewBox: {
    marginTop: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
    backgroundColor: "#fff",
    height: 210,
  },
  previewImg: { width: "100%", height: "100%" },

  textColorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
    flexWrap: "wrap",
  },
  textColorLbl: { fontSize: 12, color: "#6b7280", marginRight: 2 },
  textColorSwatchesWrap: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  textColorSwatch: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  textColorSwatchSelected: {
    borderWidth: 2,
    borderColor: "#111",
  },

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
    backgroundColor: "transparent",
    borderRadius: 12,
    padding: 0,
    fontSize: 16,
    borderWidth: 0,
    textAlignVertical: "top",
    lineHeight: 22,
  },

  mediaRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 12 },
  mediaBtn: {
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },
  mediaBtnText: { fontSize: 12, color: "#111", letterSpacing: 0.2 },
  mediaBtnDanger: { backgroundColor: "white", borderColor: "#fecaca" },
  mediaBtnDangerText: { fontSize: 12, color: "#b91c1c", letterSpacing: 0.2 },

  errorPill: {
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#fecaca",
    backgroundColor: "#fff7f7",
  },
  errorText: { fontSize: 12, color: "#b91c1c", lineHeight: 18 },

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

  drawWrap: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 14 },
  drawBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.42)" },
  drawCard: {
    width: "100%",
    maxWidth: 460,
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
  drawHead: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
  drawTitleWrap: { flex: 1, minWidth: 0 },
  drawKicker: { fontSize: 11, color: "#6b7280", letterSpacing: 0.3, textTransform: "uppercase" },
  drawTitle: { marginTop: 2, fontSize: 16, color: "#111", letterSpacing: 0.2 },
  drawX: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  drawXText: { fontSize: 14, color: "#111" },

  colorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: 10,
  },
  colorSwatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  colorSwatchSelected: {
    borderWidth: 2,
    borderColor: "#111",
  },

  canvasBox: {
    height: 360,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
    backgroundColor: "#fff",
  },

  drawActions: { marginTop: 12, flexDirection: "row", alignItems: "center", gap: 10 },
  drawBtn: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#111",
    alignItems: "center",
    justifyContent: "center",
  },
  drawBtnDisabled: { opacity: 0.5 },
  drawBtnText: { color: "white", fontSize: 12, letterSpacing: 0.2 },
  drawBtnGhost: { backgroundColor: "white", borderColor: "#e5e7eb" },
  drawBtnGhostText: { color: "#111", fontSize: 12, letterSpacing: 0.2 },

  drawHintRow: { marginTop: 12, flexDirection: "row", alignItems: "flex-start", gap: 10 },
  drawHintDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#111", marginTop: 4 },
  drawHintText: { flex: 1, fontSize: 12, lineHeight: 18, color: "#475569" },
});
