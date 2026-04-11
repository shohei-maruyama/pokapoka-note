"use client";
import { useState } from "react";
import type { RecordItem } from "@/types";
import { Btn, Input, Label } from "@/components/ui";
import { formatTime, formatDate } from "@/lib/utils";

// datetime-local input用: ローカル時間の "YYYY-MM-DDTHH:mm" を返す
function toLocalDatetimeString(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface Props {
  record: RecordItem;
  onSave: (updated: RecordItem) => void;
  onDelete: (id: string) => void;
  onCancel: () => void;
}

export function EditModal({ record, onSave, onDelete, onCancel }: Props) {
  const [memo,    setMemo]    = useState(record.memo    ?? "");
  const [amount,  setAmount]  = useState(record.amount  ? String(record.amount)  : "");
  const [value,   setValue]   = useState(record.value   ? String(record.value)   : "");
  const [name,    setName]    = useState(record.name    ?? "");
  const [hospital,setHospital]= useState(record.hospital ?? "");
  const [food,    setFood]    = useState(record.food    ?? "");
  const [datetime,setDatetime]= useState(
    record.datetime ? toLocalDatetimeString(new Date(record.datetime)) : ""
  );
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleSave() {
    onSave({
      ...record,
      memo:     memo || undefined,
      amount:   amount ? Number(amount) : undefined,
      value:    value  ? Number(value)  : undefined,
      name:     name   || undefined,
      hospital: hospital || undefined,
      food:     food   || undefined,
      datetime: datetime ? new Date(datetime).toISOString() : record.datetime,
    });
  }

  const typeLabel: Record<string, string> = {
    feeding:     "授乳・ミルク",
    diaper:      "おむつ",
    sleep:       "睡眠",
    temperature: "体温",
    medicine:    "薬",
    hospital:    "通院",
    meal:        "離乳食",
  };

  const typeIcon: Record<string, string> = {
    feeding:     "🍼",
    diaper:      "👶",
    sleep:       "🌙",
    temperature: "🌡️",
    medicine:    "💊",
    hospital:    "🏥",
    meal:        "🥣",
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[200] flex items-end justify-center">
      <div className="bg-white rounded-t-3xl px-4 pt-5 pb-9 w-full max-w-xl animate-slide-up">

        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{typeIcon[record.type] ?? "📝"}</span>
            <div>
              <div className="font-bold text-base">{typeLabel[record.type] ?? record.type}</div>
              <div className="text-[11px] text-muted">{formatDate(record.datetime)} {formatTime(record.datetime)}</div>
            </div>
          </div>
          <button onClick={onCancel}
            className="text-muted text-xl cursor-pointer bg-transparent border-none font-sans px-2">✕</button>
        </div>

        {/* 日時 */}
        <div className="mb-3">
          <Label>日時</Label>
          <Input type="datetime-local" value={datetime} onChange={e => setDatetime(e.target.value)} />
        </div>

        {/* タイプ別フィールド */}
        {(record.type === "feeding") && (
          <div className="mb-3">
            <Label>量 (ml)</Label>
            <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="例: 120" />
          </div>
        )}
        {record.type === "temperature" && (
          <div className="mb-3">
            <Label>体温 (℃)</Label>
            <Input type="number" step="0.1" value={value} onChange={e => setValue(e.target.value)} placeholder="例: 37.2" />
          </div>
        )}
        {record.type === "medicine" && (
          <div className="mb-3">
            <Label>薬の名前</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="例: カロナール" />
          </div>
        )}
        {record.type === "hospital" && (
          <div className="mb-3">
            <Label>病院名</Label>
            <Input value={hospital} onChange={e => setHospital(e.target.value)} placeholder="例: 〇〇小児科" />
          </div>
        )}
        {record.type === "meal" && (
          <div className="mb-3">
            <Label>食材・メモ</Label>
            <Input value={food} onChange={e => setFood(e.target.value)} placeholder="例: おかゆ小さじ3" />
          </div>
        )}

        {/* メモ */}
        <div className="mb-4">
          <Label>メモ</Label>
          <Input value={memo} onChange={e => setMemo(e.target.value)} placeholder="メモを追加..." />
        </div>

        {/* ボタン */}
        <div className="flex gap-2 mb-3">
          <Btn label="保存する" onClick={handleSave} color="#84C9A0" className="flex-1 py-3" />
          <Btn label="キャンセル" variant="ghost" onClick={onCancel} className="py-3 px-4" />
        </div>

        {/* 削除 */}
        {!confirmDelete
          ? <button onClick={() => setConfirmDelete(true)}
              className="w-full text-center text-xs text-[#FF6B6B] cursor-pointer bg-transparent border-none font-sans py-2">
              この記録を削除する
            </button>
          : <div className="flex gap-2">
              <Btn label="削除する" onClick={() => onDelete(record.id)}
                color="#FF6B6B" className="flex-1 py-2.5" />
              <Btn label="やめる" variant="ghost" onClick={() => setConfirmDelete(false)} className="py-2.5 px-4" />
            </div>
        }
      </div>
    </div>
  );
}
