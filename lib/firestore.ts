// ══════════════════════════════════════════════════════
// lib/firestore.ts  — Firestoreへの読み書き
// lib/storage.ts (localStorage) をこちらに置き換える
// ══════════════════════════════════════════════════════
import {
  collection, doc, setDoc, getDocs, deleteDoc,
  onSnapshot, query, orderBy, Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { RecordItem, Baby, Milestone, GrowthRecord, Vaccine } from "@/types";

// ── records ──────────────────────────────────────────
export function subscribeRecords(
  familyId: string,
  onChange: (records: RecordItem[]) => void
): Unsubscribe {
  const q = query(
    collection(db, "families", familyId, "records"),
    orderBy("datetime", "asc")
  );
  return onSnapshot(q, snap => {
    onChange(snap.docs.map(d => d.data() as RecordItem));
  });
}

export async function saveRecord(familyId: string, record: RecordItem) {
  await setDoc(
    doc(db, "families", familyId, "records", record.id),
    record
  );
}

export async function deleteRecord(familyId: string, id: string) {
  await deleteDoc(doc(db, "families", familyId, "records", id));
}

// ── babies ───────────────────────────────────────────
export async function saveBaby(familyId: string, baby: Baby) {
  await setDoc(doc(db, "families", familyId, "babies", baby.id), baby);
}

export async function loadBabies(familyId: string): Promise<Baby[]> {
  const snap = await getDocs(collection(db, "families", familyId, "babies"));
  return snap.docs.map(d => d.data() as Baby);
}

// ── family ───────────────────────────────────────────
export async function createFamily(familyId: string, uid: string) {
  await setDoc(doc(db, "families", familyId), {
    id: familyId,
    members: [uid],
    createdAt: new Date().toISOString(),
  });
}

export async function joinFamily(familyId: string, uid: string) {
  const ref = doc(db, "families", familyId);
  const snap = await getDocs(collection(db, "families"));
  const family = snap.docs.find(d => d.id === familyId);
  if (!family) throw new Error("Family not found");
  const members: string[] = family.data().members ?? [];
  if (!members.includes(uid)) {
    await setDoc(ref, { members: [...members, uid] }, { merge: true });
  }
}
