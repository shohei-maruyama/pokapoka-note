"use client";
import { useState, useEffect } from "react";
import {
  doc, getDoc, setDoc, updateDoc, arrayUnion,
  collection, addDoc, serverTimestamp, Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { User } from "firebase/auth";

const STORAGE_KEY = "pokapoka_familyId";
const INVITE_EXPIRE_HOURS = 24;

export function useFamily(user: User | null) {
  const [familyId, setFamilyIdState] = useState<string | null>(null);
  const [loading,  setLoading]       = useState(true);

  useEffect(() => {
    if (!user) { setFamilyIdState(null); setLoading(false); return; }

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) { setFamilyIdState(saved); setLoading(false); return; }

    getDoc(doc(db, "users", user.uid)).then(snap => {
      if (snap.exists() && snap.data().familyId) {
        const fid = snap.data().familyId;
        localStorage.setItem(STORAGE_KEY, fid);
        setFamilyIdState(fid);
      }
      setLoading(false);
    });
  }, [user]);

  // 家族を新規作成
  async function createFamily(): Promise<string | undefined> {
    if (!user) return;
    const fid = `family_${Date.now()}`;
    await setDoc(doc(db, "families", fid), {
      id: fid,
      members: [user.uid],
      createdAt: new Date().toISOString(),
    });
    await setDoc(doc(db, "users", user.uid), { familyId: fid }, { merge: true });
    localStorage.setItem(STORAGE_KEY, fid);
    setFamilyIdState(fid);
    return fid;
  }

  // familyId直接入力で参加（管理者向け予備手段）
  async function joinFamily(fid: string) {
    if (!user) return;
    const ref = doc(db, "families", fid);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error("その家族IDは見つかりませんでした");
    await updateDoc(ref, { members: arrayUnion(user.uid) });
    await setDoc(doc(db, "users", user.uid), { familyId: fid }, { merge: true });
    localStorage.setItem(STORAGE_KEY, fid);
    setFamilyIdState(fid);
  }

  // 招待リンクを生成（24時間有効・1回限り）
  async function createInviteLink(): Promise<string> {
    if (!user || !familyId) throw new Error("ログインが必要です");
    const expiresAt = new Date(Date.now() + INVITE_EXPIRE_HOURS * 3600 * 1000).toISOString();
    const inviteRef = await addDoc(
      collection(db, "families", familyId, "invites"),
      {
        familyId,
        createdBy: user.uid,
        createdAt: new Date().toISOString(),
        expiresAt,
        used: false,
      }
    );
    const base = typeof window !== "undefined"
      ? window.location.origin
      : "";
    return `${base}/invite/${inviteRef.id}?fid=${familyId}`;
  }

  // 招待リンクで参加
  async function joinByInvite(inviteId: string, fid: string) {
    if (!user) throw new Error("ログインが必要です");

    const inviteRef = doc(db, "families", fid, "invites", inviteId);
    const inviteSnap = await getDoc(inviteRef);
    if (!inviteSnap.exists()) throw new Error("招待リンクが見つかりません");

    const invite = inviteSnap.data();
    if (invite.used) throw new Error("この招待リンクはすでに使用済みです");
    if (new Date(invite.expiresAt) < new Date()) throw new Error("招待リンクの有効期限が切れています");

    // メンバーに追加
    await updateDoc(doc(db, "families", fid), { members: arrayUnion(user.uid) });
    await setDoc(doc(db, "users", user.uid), { familyId: fid }, { merge: true });

    // 招待リンクを使用済みに
    await updateDoc(inviteRef, { used: true, usedBy: user.uid, usedAt: new Date().toISOString() });

    localStorage.setItem(STORAGE_KEY, fid);
    setFamilyIdState(fid);
  }

  return { familyId, loading, createFamily, joinFamily, joinByInvite, createInviteLink };
}
