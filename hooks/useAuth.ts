"use client";
import { useState, useEffect, useRef } from "react";
import {
  signInWithPopup,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

export type SignInError = "popup-blocked" | "unknown" | null;

export function useAuth() {
  const [user,        setUser]       = useState<User | null>(null);
  const [authReady,   setAuthReady]  = useState(false);
  const [signInError, setSignInError]= useState<SignInError>(null);
  const redirectChecked = useRef(false);

  useEffect(() => {
    // 以前にsignInWithRedirectを使っていた場合の残セッションを拾う（保険）
    if (!redirectChecked.current) {
      redirectChecked.current = true;
      getRedirectResult(auth)
        .then(result => {
          if (result?.user) {
            console.log("[Auth] getRedirectResult: user found", result.user.uid);
          }
        })
        .catch(e => {
          // リダイレクト結果がない場合は正常。エラーログだけ残す
          console.warn("[Auth] getRedirectResult:", e.code);
        });
    }

    const unsub = onAuthStateChanged(auth, u => {
      console.log("[Auth] onAuthStateChanged:", u ? u.uid : "null");
      setUser(u);
      setAuthReady(true);
    });
    return unsub;
  }, []);

  async function signInWithGoogle() {
    setSignInError(null);
    try {
      // iOS含め全環境でPopupに統一。
      // ⚠️ 必ずユーザーの直接タップ（onClick）から同期的に呼ぶこと。
      // setTimeout や await を挟むとiOSでポップアップがブロックされる。
      await signInWithPopup(auth, googleProvider);
    } catch (error: unknown) {
      const code = (error as { code?: string }).code ?? "";
      console.warn("[Auth] signInWithPopup error:", code);

      if (code === "auth/popup-blocked") {
        // ポップアップブロック → UIで案内を出す
        setSignInError("popup-blocked");
      } else if (
        code === "auth/popup-closed-by-user" ||
        code === "auth/cancelled-popup-request"
      ) {
        // ユーザー操作による中断 → エラー扱いしない
      } else {
        setSignInError("unknown");
        console.error("[Auth] unexpected error:", code, error);
      }
    }
  }

  async function logout() {
    await signOut(auth);
    setUser(null);
  }

  const loading = !authReady;
  return { user, loading, signInWithGoogle, signInError, logout };
}
