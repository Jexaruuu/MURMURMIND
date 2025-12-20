import { UserProfileProvider } from "@/context/user-profile-context";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <UserProfileProvider>
      <Stack initialRouteName="welcome" screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="welcome"
          options={{ animation: "slide_from_right", gestureEnabled: true, gestureDirection: "horizontal" }}
        />
        <Stack.Screen
          name="login"
          options={{ animation: "slide_from_left", gestureEnabled: true, gestureDirection: "horizontal" }}
        />
        <Stack.Screen
          name="signup"
          options={{ animation: "slide_from_right", gestureEnabled: true, gestureDirection: "horizontal" }}
        />
 <Stack.Screen
          name="menu"
          options={({ route }) => {
            const anim = (route.params as { anim?: "fromRight" | "fromLeft" } | undefined)?.anim;

            return {
              animation: anim === "fromLeft" ? "slide_from_left" : "slide_from_right",
              gestureEnabled: true,
              gestureDirection: "horizontal",
            };
          }}
        />
  <Stack.Screen
    name="compose"
    options={({ route }) => {
      const anim = (route.params as { anim?: "fromRight" | "fromLeft" } | undefined)?.anim;

      return {
        animation: anim === "fromRight" ? "slide_from_right" : "slide_from_left",
        gestureEnabled: true,
        gestureDirection: "horizontal",
      };
    }}
  />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      </Stack>
    </UserProfileProvider>
  );
}
