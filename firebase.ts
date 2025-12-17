import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAtRxFtutkVxhU7ngsGU_twwRsnryJqAOI",
  authDomain: "its411-barsana-project.firebaseapp.com",
  projectId: "its411-barsana-project",
  storageBucket: "its411-barsana-project.firebasestorage.app",
  messagingSenderId: "999284187418",
  appId: "1:999284187418:android:e6033845eee1488e024ca3"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = (() => {
  try {
    const { getReactNativePersistence } = require("firebase/auth");
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    return getAuth(app);
  }
})();

export const db = getFirestore(app);
