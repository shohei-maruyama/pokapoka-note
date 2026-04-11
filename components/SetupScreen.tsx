"use client";
import { useState } from "react";
import { Btn, Input, Label } from "@/components/ui";

const BABY_COLORS = ["#FF8FAB","#A8D8EA","#84C9A0","#C9A8E8","#FFCB77"];
const BABY_ICONS  = ["🍀","🌸","⭐","🌙","🎀"];

type Step = "select" | "join" | "baby";

interface Props {
  onCreateFamily: () => Promise<string | undefined>;
  onJoinFamily:   (fid: string) => Promise<void>;
  onSetupBaby:    (baby: { name: string; birthDate: string; icon: string; color: string }) => Promise<void>;
}

export function SetupScreen({ onCreateFamily, onJoinFamily, onSetupBaby }: Props) {
  const [step,    setStep]    = useState<Step>("select");
  const [joinId,  setJoinId]  = useState("");
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  // 赤ちゃん情報
  const [babyName,      setBabyName]      = useState("");
  const [babyBirthDate, setBabyBirthDate] = useState("");
  const [babyIcon,      setBabyIcon]      = useState("🍀");
  const [babyColor,     setBabyColor]     = useState("#FF8FAB");

  async function handleCreate() {
    setLoading(true); setError("");
    try {
      await onCreateFamily();
      setStep("baby");
    } catch {
      setError("作成に失敗しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin() {
    if (!joinId.trim()) return;
    setLoading(true); setError("");
    try {
      await onJoinFamily(joinId.trim());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "参加に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  async function handleBabySetup() {
    if (!babyName.trim()) { setError("名前を入力してください"); return; }
    setLoading(true); setError("");
    try {
      await onSetupBaby({ name: babyName.trim(), birthDate: babyBirthDate, icon: babyIcon, color: babyColor });
    } catch {
      setError("登録に失敗しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  }

  // ── ステップインジケーター ──────────────────────────
  const steps = step === "baby"
    ? ["家族設定 ✓", "赤ちゃん登録"]
    : ["家族設定", "赤ちゃん登録"];

  // ── STEP: 赤ちゃん登録 ────────────────────────────
  if (step === "baby") {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6 py-10">
        <StepIndicator steps={steps} current={1} />
        <div className="text-4xl mb-3 mt-4">👶</div>
        <h1 className="text-xl font-bold mb-1 text-[#4A3F3F]">赤ちゃんの情報を登録</h1>
        <p className="text-muted text-sm mb-6 text-center">後から変更できます</p>

        <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          {/* アイコン */}
          <div>
            <Label>アイコン</Label>
            <div className="flex gap-2 mt-1">
              {BABY_ICONS.map(ic => (
                <button key={ic} onClick={() => setBabyIcon(ic)}
                  className="text-2xl p-2 rounded-xl cursor-pointer transition-all"
                  style={{ border: `2px solid ${babyIcon === ic ? babyColor : "#F0E6E6"}`, background: babyIcon === ic ? babyColor + "22" : "white" }}>
                  {ic}
                </button>
              ))}
            </div>
          </div>

          {/* カラー */}
          <div>
            <Label>テーマカラー</Label>
            <div className="flex gap-2 mt-1">
              {BABY_COLORS.map(c => (
                <button key={c} onClick={() => setBabyColor(c)}
                  className="w-9 h-9 rounded-full cursor-pointer transition-all"
                  style={{ background: c, border: `3px solid ${babyColor === c ? "#4A3F3F" : "transparent"}`, transform: babyColor === c ? "scale(1.1)" : "scale(1)" }} />
              ))}
            </div>
          </div>

          {/* 名前 */}
          <div>
            <Label>名前 *</Label>
            <Input value={babyName} onChange={e => setBabyName(e.target.value)} placeholder="例: はなちゃん" />
          </div>

          {/* 生年月日 */}
          <div>
            <Label>生年月日（月齢別UIに使います）</Label>
            <Input type="date" value={babyBirthDate} onChange={e => setBabyBirthDate(e.target.value)} />
          </div>

          {/* プレビュー */}
          {babyName && (
            <div className="rounded-xl px-4 py-3 text-center transition-all"
              style={{ background: babyColor + "22", border: `1.5px solid ${babyColor}44` }}>
              <span className="text-2xl">{babyIcon}</span>
              <span className="ml-2 font-bold text-sm" style={{ color: babyColor }}>{babyName}ちゃん</span>
            </div>
          )}

          {error && <p className="text-xs text-[#FF6B6B]">{error}</p>}

          <Btn
            label={loading ? "登録中..." : "登録してはじめる 🎉"}
            onClick={handleBabySetup}
            color={babyColor}
            className="w-full py-3 text-sm"
          />
        </div>
      </div>
    );
  }

  // ── STEP: 家族設定 ────────────────────────────────
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6 py-10">
      <StepIndicator steps={steps} current={0} />
      <div className="text-4xl mb-3 mt-4">🍀</div>
      <h1 className="text-xl font-bold mb-1 text-[#4A3F3F]">ぽかぽかノート</h1>
      <p className="text-muted text-sm mb-6 text-center">はじめに家族の設定をしましょう</p>

      <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-sm flex flex-col gap-3">
        {step === "select" && (
          <>
            <button onClick={handleCreate} disabled={loading}
              className="w-full py-4 rounded-2xl text-white font-bold text-sm cursor-pointer border-none font-sans transition-all"
              style={{ background: "linear-gradient(135deg,#FF8FAB,#FFCB77)", opacity: loading ? 0.7 : 1 }}>
              {loading ? "作成中..." : "✨ 新しく家族を作る"}
            </button>

            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted">または</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <button onClick={() => { setStep("join"); setError(""); }}
              className="w-full py-4 rounded-2xl font-bold text-sm cursor-pointer font-sans transition-all"
              style={{ border: "2px solid #F0E6E6", background: "white", color: "#4A3F3F" }}>
              パートナーの招待リンクで参加する
            </button>

            {error && <p className="text-xs text-[#FF6B6B]">{error}</p>}
          </>
        )}

        {step === "join" && (
          <>
            <button onClick={() => { setStep("select"); setError(""); }}
              className="text-sm text-muted cursor-pointer bg-transparent border-none text-left font-sans mb-1">
              ← 戻る
            </button>
            <div className="bg-[#FFF0C4] rounded-xl px-3.5 py-3 text-xs leading-relaxed text-[#4A3F3F] mb-1">
              パートナーのアプリで「📡 NFC」タブを開き、<br/>
              「招待リンクを発行」して共有してもらってください。<br/>
              <br/>
              URLではなく家族IDをお持ちの場合は下に入力してください。
            </div>
            <Label>家族ID（予備手段）</Label>
            <Input
              value={joinId}
              onChange={e => setJoinId(e.target.value)}
              placeholder="family_xxxxxxxxxx"
            />
            {error && <p className="text-xs text-[#FF6B6B]">{error}</p>}
            <Btn label={loading ? "参加中..." : "参加する"} onClick={handleJoin} color="#FF8FAB" className="w-full py-3" />
          </>
        )}
      </div>

      <p className="text-[11px] text-muted mt-5 text-center leading-relaxed max-w-xs">
        「新しく家族を作る」を選ぶと家族IDが発行されます。<br/>
        パートナーに招待リンクを共有して一緒に使えます。
      </p>
    </div>
  );
}

function StepIndicator({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((s, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{ background: i <= current ? "#FF8FAB" : "#F0E6E6", color: i <= current ? "white" : "#9E8E8E" }}>
              {i < current ? "✓" : i + 1}
            </div>
            <span className="text-xs" style={{ color: i <= current ? "#4A3F3F" : "#9E8E8E", fontWeight: i === current ? 700 : 400 }}>
              {s}
            </span>
          </div>
          {i < steps.length - 1 && <div className="w-6 h-px bg-border" />}
        </div>
      ))}
    </div>
  );
}
