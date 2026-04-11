"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  onSnapshot, query, collection, orderBy,
  setDoc, deleteDoc, doc, getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { RecordItem, Baby, Milestone, GrowthRecord, Vaccine } from "@/types";
import { calcAgeMonths } from "@/lib/utils";

const MILESTONES_MASTER = [
  "はじめての笑顔","首がすわった","寝返り","お座り",
  "ハイハイ","つかまり立ち","はじめての言葉","一人歩き",
];

export function useAppState(familyId: string | null) {
  const [records,    setRecords]    = useState<RecordItem[]>([]);
  const [babies,     setBabiesState]= useState<Baby[]>([]);
  const [milestones, setMSState]    = useState<Milestone[]>([]);
  const [growths,    setGrowthsState]=useState<GrowthRecord[]>([]);
  const [vaccines,   setVacState]   = useState<Vaccine[]>([]);
  const [selBabyId,  setSelBabyId]  = useState<string>("1");
  const [hydrated,   setHydrated]   = useState(false);

  // records をリアルタイム購読
  useEffect(() => {
    if (!familyId) return;
    const q = query(collection(db, "families", familyId, "records"), orderBy("datetime", "asc"));
    return onSnapshot(q, snap => {
      setRecords(snap.docs.map(d => d.data() as RecordItem));
      setHydrated(true);
    });
  }, [familyId]);

  // babies をリアルタイム購読
  useEffect(() => {
    if (!familyId) return;
    return onSnapshot(collection(db, "families", familyId, "babies"), snap => {
      const bs = snap.docs.map(d => d.data() as Baby);
      setBabiesState(bs.length > 0 ? bs : [
        { id:"1", name:"赤ちゃん", icon:"🍀", color:"#FF8FAB", birthDate:"", familyId }
      ]);
    });
  }, [familyId]);

  // milestones をリアルタイム購読（Firestore）
  useEffect(() => {
    if (!familyId) return;
    return onSnapshot(collection(db, "families", familyId, "milestones"), snap => {
      setMSState(snap.docs.map(d => d.data() as Milestone));
    });
  }, [familyId]);

  // growths をリアルタイム購読（Firestore）
  useEffect(() => {
    if (!familyId) return;
    const q = query(collection(db, "families", familyId, "growths"), orderBy("date", "asc"));
    return onSnapshot(q, snap => {
      setGrowthsState(snap.docs.map(d => d.data() as GrowthRecord));
    });
  }, [familyId]);

  // vaccines をリアルタイム購読（Firestore）
  useEffect(() => {
    if (!familyId) return;
    return onSnapshot(collection(db, "families", familyId, "vaccines"), snap => {
      setVacState(snap.docs.map(d => d.data() as Vaccine));
    });
  }, [familyId]);

  // record CRUD
  const addRec = useCallback(async (
    type: RecordItem["type"],
    childId: string,
    payload: Partial<RecordItem>
  ): Promise<RecordItem> => {
    if (!familyId) return {} as RecordItem;
    const now = new Date().toISOString();
    const record: RecordItem = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
      type, familyId, childId, datetime: now, createdAt: now, ...payload,
    };
    await setDoc(doc(db, "families", familyId, "records", record.id), record);
    return record;
  }, [familyId]);

  const updateRec = useCallback(async (updated: RecordItem) => {
    if (!familyId) return;
    await setDoc(doc(db, "families", familyId, "records", updated.id), updated);
  }, [familyId]);

  const deleteRec = useCallback(async (id: string) => {
    if (!familyId) return;
    await deleteDoc(doc(db, "families", familyId, "records", id));
  }, [familyId]);

  // baby CRUD
  const addBaby = useCallback(async (baby: Baby) => {
    if (!familyId) return;
    const b = { ...baby, familyId };
    await setDoc(doc(db, "families", familyId, "babies", b.id), b);
    setSelBabyId(b.id);
    // マイルストーン初期データをFirestoreに保存
    for (const name of MILESTONES_MASTER) {
      const ms: Milestone = { name, achieved: false, date: null, babyId: b.id };
      await setDoc(
        doc(db, "families", familyId, "milestones", `${b.id}_${name}`),
        ms
      );
    }
  }, [familyId]);

  const updateBaby = useCallback(async (baby: Baby) => {
    if (!familyId) return;
    await setDoc(doc(db, "families", familyId, "babies", baby.id), baby);
  }, [familyId]);

  // milestones
  const setMilestones = useCallback(async (updated: Milestone[]) => {
    if (!familyId) return;
    for (const m of updated) {
      await setDoc(
        doc(db, "families", familyId, "milestones", `${m.babyId}_${m.name}`),
        m
      );
    }
  }, [familyId]);

  // growths
  const addGrowth = useCallback(async (growth: GrowthRecord) => {
    if (!familyId) return;
    await setDoc(doc(db, "families", familyId, "growths", growth.id), growth);
  }, [familyId]);

  const setGrowths = useCallback(async (updated: GrowthRecord[]) => {
    if (!familyId) return;
    for (const g of updated) {
      await setDoc(doc(db, "families", familyId, "growths", g.id), g);
    }
  }, [familyId]);

  // vaccines
  const setVaccines = useCallback(async (updated: Vaccine[]) => {
    if (!familyId) return;
    for (const v of updated) {
      await setDoc(doc(db, "families", familyId, "vaccines", v.id), v);
    }
  }, [familyId]);

  const baby      = babies.find(b => b.id === selBabyId) ?? babies[0];
  const ageMonths = calcAgeMonths(baby?.birthDate ?? "");

  const babyMilestones = useMemo(() => {
    const existing = milestones.filter(m => m.babyId === baby?.id);
    if (existing.length > 0) return existing;
    return MILESTONES_MASTER.map(name => ({
      name, achieved: false, date: null, babyId: baby?.id ?? "1",
    }));
  }, [milestones, baby]);

  return {
    records, babies, milestones: babyMilestones, growths, vaccines,
    selBabyId, baby, ageMonths, hydrated,
    setSelBabyId, addBaby, updateBaby, addRec, updateRec, deleteRec,
    setMilestones, addGrowth, setGrowths, setVaccines,
  };
}
