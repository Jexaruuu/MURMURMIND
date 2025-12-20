import { auth } from "@/firebase";
import { Redirect } from "expo-router";
import { onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";

export default function Index() {
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

  return (
    <Redirect
      href={
        user
          ? { pathname: "/menu", params: { anim: "fromRight" } }
          : "/welcome"
      }
    />
  );
}
