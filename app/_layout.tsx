import { UserProfileProvider } from "@/context/user-profile-context";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <UserProfileProvider>
      <Stack initialRouteName="welcome" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="welcome" options={{ animation: "slide_from_right", gestureEnabled: true, gestureDirection: "horizontal" }} />
        <Stack.Screen name="login" options={{ animation: "slide_from_right", gestureEnabled: true, gestureDirection: "horizontal" }} />
        <Stack.Screen name="signup" options={{ animation: "slide_from_right", gestureEnabled: true, gestureDirection: "horizontal" }} />
        <Stack.Screen name="menu" options={{ animation: "slide_from_right", gestureEnabled: true, gestureDirection: "horizontal" }} />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      </Stack>
    </UserProfileProvider>
  );
}
