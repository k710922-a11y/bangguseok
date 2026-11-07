import Link from "next/link";
import { requireAdmin, ui } from "../_lib";

export const dynamic = "force-dynamic";

type Row = {
  id: string; series_slug: string; number: number; tape_code: string; title: string; youtube_id: string | null;
  q1: string | null; status: string; published_at: string | null; source: string; views: number | null;
  episode_bonus: { unlock_count: number } | null;
};

export default async function EpisodesAdmin() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("episodes")
    .select("id,series_slug,number,tape_code,title,youtube_id,q1,status,published_at,source,views,episode_bonus(unlock_count)")
    .order("published_at", { ascending: false, nullsFirst: true });
  const rows = (data ?? []) as unknown as Row[];

  return (
    <div className="flex flex-col gap-5 max-w-[1200px]">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className={ui.h1}>회차 관리</h1>
        <span className="flex-1" />
        <Link href="/admin/sync" className={ui.btn2}>유튜브에서 가져오기</Link>
        <Link href="/admin/episodes/new" className={ui.btn}>+ 새 회차</Link>
      </div>
      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full border-collapse min-w-[860px]">
          <thead className="bg-panel">
            <tr>
              <th className={ui.th}>코드</th><th className={ui.th}>시리즈·회</th><th className={ui.th}>Q1</th>
              <th className={ui.th}>유튜브</th><th className={ui.th}>방송일</th><th className={ui.th}>코드 사용</th><th className={ui.th}>상태</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-panel">
                <td className={ui.td}><Link href={`/admin/episodes/${r.id}`} className="font-vt text-[20px] text-osd">{r.tape_code}</Link></td>
                <td className={ui.td}><Link href={`/admin/episodes/${r.id}`} className="font-bold">{r.series_slug} · {r.number}화</Link><div className="text-[12px] text-muted">{r.source === "youtube-sync" ? "자동 수집" : "직접 등록"}</div></td>
                <td className={`${ui.td} max-w-[280px]`}>{r.q1 ?? <span className="text-muted">—</span>}</td>
                <td className={ui.td}>{r.youtube_id ? <a href={`https://youtube.com/shorts/${r.youtube_id}`} target="_blank" rel="noopener noreferrer" className="underline">{r.youtube_id}</a> : "—"}{r.views !== null && <div className="text-[12px] text-muted">조회 {r.views}</div>}</td>
                <td className={ui.td}>{r.published_at ? new Date(r.published_at).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" }) : "—"}</td>
                <td className={ui.td}>{r.episode_bonus?.unlock_count ?? 0}</td>
                <td className={ui.td}>{r.status === "published" ? <span className="text-osd">공개</span> : <span className="text-accent2">임시</span>}</td>
              </tr>
            ))}
            {!rows.length && (
              <tr><td colSpan={7} className={`${ui.td} text-muted`}>아직 회차가 없습니다. supabase/seed.sql 을 실행했는지 확인하거나 유튜브에서 가져오세요.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
