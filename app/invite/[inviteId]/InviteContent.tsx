"use client";
import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useFamily } from "@/hooks/useFamily";
import { LoginScreen } from "@/components/LoginScreen";

export default function InviteContent() {
  const params       = useParams();
  const sp           = useSearchParams();
  const router       = useRouter();
  const inviteId     = params.inviteId as string;
  const fid          = sp.get("fid") ?? "";

  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const { joinByInvite } = useFamily(user);

  const [status,  setStatus]  = useState<"loading"|"ready"|"joining"|"done"|"error">("loading");
  const [errorMsg,setErrorMsg]= useState("");

  useEffect(() => {
    if (!authLoading) setStatus(user ? "ready" : "loading");
  }, [user, authLoading]);

  async function handleJoin() {
    setStatus("joining");
    try {
      await joinByInvite(inviteId, fid);
      setStatus("done");
      setTimeout(() => router.push("/"), 2000);
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : "参加に失敗しました");
      setStatus("error");
    }
  }

  if (authLoading) {
    return <div className="flex items-center justify-center min-h-screen text-muted text-sm">読み込み中...</div>;
  }
  if (!user) return <LoginScreen onSignIn={signInWithGoogle} />;

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6">
      <div className="text-5xl mb-4">🍀</div>
      <h1 className="text-xl font-bold mb-2 text-[#4A3F3F]">招待リンク</h1>
      <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-sm flex flex-col gap-4 text-center">
        {status === "ready" && (
          <>
            <p className="text-sm text-muted leading-relaxed">
              ぽかぽかノートの家族に招待されています。<br/>
              参加して一緒に育児記録を始めましょう！
            </p>
            <button onClick={handleJoin}
              className="w-full py-4 rounded-2xl text-white font-bold text-sm cursor-pointer border-none font-sans"
              style={{ background: "linear-gradient(135deg,#FF8FAB,#FFCB77)" }}>
              家族に参加する
            </button>
          </>
        )}
        {status === "joining" && <p className="text-sm text-muted">参加処理中...</p>}
        {status === "done" && (
          <>
            <div className="text-4xl">🎉</div>
            <p className="text-sm font-bold text-[#4A3F3F]">参加しました！</p>
            <p className="text-xs text-muted">アプリに移動します...</p>
          </>
        )}
        {status === "error" && (
          <>
            <p className="text-sm text-[#FF6B6B]">{errorMsg}</p>
            <button onClick={() => router.push("/")}
              className="text-sm text-muted cursor-pointer bg-transparent border-none font-sans">
              トップへ戻る
            </button>
          </>
        )}
      </div>
    </div>
  );
}
