"use client";
import { Suspense } from "react";
import InviteContent from "./InviteContent";

export default function InvitePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-muted text-sm">読み込み中...</div>}>
      <InviteContent />
    </Suspense>
  );
}
