import Link from "next/link";
import { requireAdmin, ui } from "./_lib";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const { supabase } = await requireAdmin();
  const count = async (table: string, filter?: [string, string]) => {
    let q = supabase.from(table).select("*", { count: "exact", head: true });
    if (filter) q = q.eq(filter[0], filter[1]);
    const { count } = await q;
    return count ?? 0;
  };
  const [episodes, characters, jokes, pending, tipsNew, unlocks, logs] = await Promise.all([
    count("episodes"),
    count("characters"),
    count("jokes"),
    count("wrong_answers", ["status", "pending"]),
    count("tips", ["status", "new"]),
    supabase.from("episode_bonus").select("unlock_count").then(({ data }) => (data ?? []).reduce((s, r: { unlock_count: number }) => s + (r.unlock_count ?? 0), 0)),
    supabase.from("sync_log").select("*").order("ran_at", { ascending: false }).limit(5).then(({ data }) => data ?? []),
  ]);

  const kpis = [
    { label: "회차", value: episodes, href: "/admin/episodes" },
    { label: "캐릭터", value: characters, href: "/admin/characters" },
    { label: "자판기 문제", value: jokes, href: "/admin/jokes" },
    { label: "테이프 코드 사용", value: unlocks, href: "/admin/episodes" },
    { label: "오답 심사 대기", value: pending, href: "/admin/wrong-answers", hot: pending > 0 },
    { label: "새 제보", value: tipsNew, href: "/admin/tips", hot: tipsNew > 0 },
  ];

  return (
    <div className="flex flex-col gap-7 max-w-[1100px]">
      <h1 className={ui.h1}>대시보드</h1>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3">
        {kpis.map((k) => (
          <Link key={k.label} href={k.href} className={`${ui.card} flex flex-col gap-1 ${k.hot ? "border-accent2" : ""}`}>
            <span className="text-[12px] font-bold text-muted">{k.label}</span>
            <span className={`font-vt text-[44px] leading-none ${k.hot ? "text-accent2" : "text-osd"}`}>{k.value}</span>
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/admin/episodes/new" className={ui.btn}>+ 회차 직접 등록</Link>
        <Link href="/admin/sync" className={ui.btn2}>유튜브에서 가져오기</Link>
        <Link href="/admin/wrong-answers" className={ui.ghost}>오답 심사하기</Link>
      </div>

      <section className={ui.card}>
        <h2 className="m-0 mb-3 text-[16px] font-bold">최근 유튜브 동기화</h2>
        {logs.length ? (
          <table className="w-full border-collapse">
            <thead>
              <tr><th className={ui.th}>시각</th><th className={ui.th}>방식</th><th className={ui.th}>발견</th><th className={ui.th}>신규</th><th className={ui.th}>갱신</th><th className={ui.th}>메모</th></tr>
            </thead>
            <tbody>
              {logs.map((l: { id: number; ran_at: string; source: string; found: number; inserted: number; updated: number; message: string | null }) => (
                <tr key={l.id}>
                  <td className={ui.td}>{new Date(l.ran_at).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}</td>
                  <td className={ui.td}>{l.source}</td>
                  <td className={ui.td}>{l.found}</td>
                  <td className={ui.td}>{l.inserted}</td>
                  <td className={ui.td}>{l.updated}</td>
                  <td className={`${ui.td} text-muted text-[12px]`}>{l.message ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="m-0 text-[14px] text-muted">아직 동기화 기록이 없습니다. 「유튜브에서 가져오기」를 눌러 보세요.</p>
        )}
      </section>

      <section className={`${ui.card} text-[14px] leading-relaxed text-muted`}>
        <h2 className="m-0 mb-2 text-[16px] font-bold text-fg">업로드 규칙 (자동 수집이 읽는 형식)</h2>
        <p className="m-0">제목: <code className="text-fg">[방구석] 춘식&amp;덕구 : 아재개그 EP.#04</code> · 늬우스는 제목에 「늬우스」 포함</p>
        <p className="m-0">설명란 마지막 줄(선택): <code className="text-fg">#TAPE VHS-0104 #출연 봉구 #Q1 문제 #Q2 문제</code></p>
        <p className="m-0">테이프 코드를 안 적으면 시리즈 접두어 + 회차 번호로 자동 생성됩니다 (아재개그 4화 → VHS-0104).</p>
      </section>
    </div>
  );
}
