import { assetFor, fallbackAvatar } from "@/components/avatar-assets";
import { auth, db } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type UserProfileState = {
  uid: string | null;
  username: string;
  email: string;
  photoUrl: string | null;
  photoBroken: boolean;
};

type UserProfileValue = {
  profile: UserProfileState;
  avatarSource: any;
  avatarCanError: boolean;
  markPhotoBroken: () => void;
  setLocalProfile: (p: Partial<Pick<UserProfileState, "username" | "email" | "photoUrl">>) => void;
};

const Ctx = createContext<UserProfileValue | null>(null);

export function UserProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfileState>({
    uid: null,
    username: "Guest",
    email: "",
    photoUrl: null,
    photoBroken: false,
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        setProfile({ uid: null, username: "Guest", email: "", photoUrl: null, photoBroken: false });
        return;
      }

      const quick = (u.displayName || "").trim() || (u.email ? u.email.split("@")[0] : "").trim() || "Guest";
      const e = typeof u.email === "string" ? u.email.trim() : "";
      const authPhoto = typeof u.photoURL === "string" && u.photoURL.trim() ? u.photoURL.trim() : null;

      setProfile((p) => ({
        ...p,
        uid: u.uid,
        username: quick,
        email: e,
        photoUrl: authPhoto,
        photoBroken: false,
      }));
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!profile.uid) return;

    const ref = doc(db, "users", profile.uid);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) return;
        const data: any = snap.data();

        const n = typeof data?.name === "string" ? data.name.trim() : "";
        const mail = typeof data?.email === "string" ? data.email.trim() : "";
        const pUrl = typeof data?.photoUrl === "string" && data.photoUrl.trim() ? data.photoUrl.trim() : null;

        setProfile((p) => ({
          ...p,
          username: n || p.username,
          email: mail || p.email,
          photoUrl: pUrl ?? p.photoUrl,
        }));
      },
      () => {}
    );

    return () => unsub();
  }, [profile.uid]);

  const avatarAsset = assetFor(profile.photoUrl);
  const avatarSource = useMemo(() => {
    if (avatarAsset) return avatarAsset;
    if (profile.photoUrl && !profile.photoBroken) return { uri: profile.photoUrl };
    return fallbackAvatar;
  }, [avatarAsset, profile.photoUrl, profile.photoBroken]);

  const avatarCanError = !avatarAsset && !!profile.photoUrl;

  const value: UserProfileValue = {
    profile,
    avatarSource,
    avatarCanError,
    markPhotoBroken: () => setProfile((p) => ({ ...p, photoBroken: true })),
    setLocalProfile: (patch) =>
      setProfile((p) => ({
        ...p,
        ...patch,
      })),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useUserProfile() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useUserProfile must be used inside UserProfileProvider");
  return v;
}
