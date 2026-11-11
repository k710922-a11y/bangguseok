import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { syncYouTube } from "@/lib/youtube-sync";
import { requireAdmin, ui } from "../_lib";

export const dynamic = "force-dynamic";

async function runSync() {
  "use server";
  const { supabase } = await requireAdmin();
  let q: string;
  try {
    const r = await syncYouTube(createSupabaseAdminClient() ?? supabase);
    q = `ok=1&found=${r.found}&ins=${r.inserted}&upd=${r.updated}&hid=${r.hidden}&src=${r.source}&skip=${encodeURIComponent(r.skipped.join(" | ").slice(0, 600))}`;
  } catch (e) {
    q = `error=${encodeURIComponent((e as Error).message)}`;
  }
  redirect(`/admin/sync?${q}`);
}

export default async function SyncAdmin({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireAdmin();
  const p = await searchParams;
  const hasKey = Boolean(process.env.YOUTUBE_API_KEY);
  const hasCron = Boolean(process.env.CRON_SECRET);
  return (
    <div className="flex flex-col gap-5 max-w-[860px]">
      <h1 className={ui.h1}>유튜브 동기화</h1>
      <div className={`${ui.card} flex flex-col gap-3 text-[14px] leading-relaxed`}>
        <p className="m-0">채널 <code>{process.env.YOUTUBE_CHANNEL_ID || "UCpzm3QjqrZ8huyHCHehuAvg"}</code> 의 새 영상을 회차로 가져옵니다. 이미 있는 회차는 비어 있는 칸(Q1·Q2·썸네일)과 조회수만 채웁니다. 유튜브에서 삭제된 영상의 회차는 자동으로 「임시」(비공개)로 내리고, 같은 회차를 다시 올렸으면 새 영상으로 바꿉니다.</p>
        <p className="m-0 text-muted">수집 방식: {hasKey ? "YouTube Data API (설명란·길이·조회수 포함)" : "RSS (최근 15개, 설명란 포함) — YOUTUBE_API_KEY 를 넣으면 길이·전체 목록까지"}</p>
        <p className="m-0 text-muted">자동 실행: {hasCron ? "CRON_SECRET 설정됨 — Coolify Scheduled Task 로 30분마다 실행" : "CRON_SECRET 미설정 — docs/DEPLOY.md 6단계 참고"}</p>
        <form action={runSync}>
          <button type="submit" className={ui.btn2}>지금 가져오기</button>
        </form>
      </div>
      {p.ok && (
        <div role="status" className={`${ui.card} border-osd text-[14px] flex flex-col gap-1`}>
          <strong className="text-osd">완료 ({p.src})</strong>
          <span>발견 {p.found} · 신규 {p.ins} · 갱신 {p.upd} · 삭제 영상 비공개 {p.hid ?? 0}</span>
          {p.skip && <span className="text-muted">건너뜀(제목 형식 불일치): {p.skip}</span>}
        </div>
      )}
      {p.error && <p role="alert" className="m-0 text-[14px] font-bold text-accent">실패: {p.error}</p>}
    </div>
  );
}
