import { auth } from "@/firebase";
import { Redirect, useLocalSearchParams } from "expo-router";
import { onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";

export default function Index() {
  const params = useLocalSearchParams<{ anim?: "fromLeft" | "fromRight" }>();
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setReady(true);
    });
    return () => unsub();
  }, []);

  if (!ready) return null;

  if (!user) return <Redirect href="/welcome" />;

  return (
    <Redirect
      href={{
        pathname: "/menu",
        params: { anim: params?.anim === "fromLeft" ? "fromLeft" : "fromRight" },
      }}
    />
  );
}
