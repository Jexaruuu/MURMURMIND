import ProfileMenuSheet from "@/components/profile-menu-sheet";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useUserProfile } from "@/context/user-profile-context";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Navigation() {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);

  const { profile, avatarSource, avatarCanError, markPhotoBroken } = useUserProfile();

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
        <ThemedText style={styles.userName}>{profile.username}</ThemedText>
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
  userWrap: { flexDirection: "row", alignItems: "center", gap: 8 },
  userAvatar: { width: 25, height: 25, borderRadius: 8, backgroundColor: "#e5e7eb" },
  userName: { fontSize: 16, color: "#ffffff" },
  menuBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center", alignSelf: "flex-end" },
  menuIcon: { fontSize: 25, color: "#ffffff" },
});
