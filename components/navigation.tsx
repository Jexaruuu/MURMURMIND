import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Navigation({
  username,
  avatarSource,
  onMenuPress,
  onAvatarError,
}: {
  username: string;
  avatarSource: any;
  onMenuPress: () => void;
  onAvatarError?: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <ThemedView style={[styles.topBar, { paddingTop: Math.max(insets.top, 12) + 10 }]}>
      <StatusBar style="light" />

      <View style={styles.userWrap}>
        <Image source={avatarSource} style={styles.userAvatar} contentFit="cover" onError={onAvatarError} />
        <ThemedText style={styles.userName}>{username}</ThemedText>
      </View>

      <Pressable onPress={onMenuPress} style={styles.menuBtn}>
        <ThemedText style={styles.menuIcon}>☰</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  userWrap: { flexDirection: "row", alignItems: "center", gap: 8 },
  userAvatar: { width: 25, height: 25, borderRadius: 8, backgroundColor: "#e5e7eb" },
  userName: { fontSize: 16, color: "#ffffff" },
  menuBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center", alignSelf: "flex-end" },
  menuIcon: { fontSize: 25, color: "#ffffff" },
});
