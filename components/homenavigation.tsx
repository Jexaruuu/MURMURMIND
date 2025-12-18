import { ThemedView } from "@/components/themed-view";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, usePathname } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeNavigation() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  const isHome = pathname === "/menu";
  const isPost = pathname === "/compose";

  const goHome = () => {
    if (isHome) return;
    router.push({ pathname: "/menu", params: { anim: isPost ? "fromLeft" : "fromRight" } });
  };

  const goPost = () => {
    if (isPost) return;

    if (isHome) {
      router.push({ pathname: "/compose", params: { anim: "fromRight" } });
      return;
    }

    router.push("/compose");
  };

  return (
    <ThemedView style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={styles.bar}>
        <Pressable
          style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed, isHome && styles.iconBtnActive]}
          onPress={goHome}
          disabled={isHome}
        >
          <Ionicons name="home" size={22} color={isHome ? "#0a0a0a" : "rgba(255,255,255,0.90)"} />
        </Pressable>

        <View style={styles.centerCurve}>
          <Image source={require("@/assets/images/murmurlogowhite.png")} style={styles.centerLogo} contentFit="contain" />
        </View>

        <Pressable
          style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed, isPost && styles.iconBtnActive]}
          onPress={goPost}
          disabled={isPost}
        >
          <Ionicons name="add" size={24} color={isPost ? "#0a0a0a" : "rgba(255,255,255,0.90)"} />
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 14,
    paddingTop: 10,
    backgroundColor: "black",
  },

  bar: {
    height: 66,
    borderRadius: 24,
    backgroundColor: "#000",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    justifyContent: "space-between",
  },

  pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },

  iconBtn: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },

  iconBtnActive: {
    backgroundColor: "white",
    borderColor: "white",
  },

  centerCurve: {
    flex: 1,
    marginHorizontal: 14,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  centerLogo: {
    marginTop: 7,
    width: 120,
    height: 120,
  },
});
