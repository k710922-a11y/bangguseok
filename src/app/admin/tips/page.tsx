import Link from "next/link";
import { revalidatePath } from "next/cache";
import { requireAdmin, str, ui } from "../_lib";

export const dynamic = "force-dynamic";

async function setTip(formData: FormData) {
  "use server";
  const { supabase } = await requireAdmin();
  const id = str(formData, "id");
  const status = str(formData, "status");
  if (!id || !status) return;
  if (status === "delete") await supabase.from("tips").delete().eq("id", id);
  else await supabase.from("tips").update({ status }).eq("id", id);
  revalidatePath("/admin/tips");
}

export default async function TipsAdmin({ searchParams }: { searchParams: Promise<{ s?: string }> }) {
  const s = (await searchParams).s ?? "new";
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("tips").select("*").eq("status", s).order("created_at", { ascending: false }).limit(200);
  const rows = (data ?? []) as { id: string; nickname: string | null; headline: string; source_url: string; note: string | null; created_at: string }[];

  return (
    <div className="flex flex-col gap-5 max-w-[1100px]">
      <h1 className={ui.h1}>늬우스 제보함</h1>
      <p className="m-0 text-[14px] text-muted">채택 전 원출처 + 독립 보도 1건을 교차 확인하세요. 사망·중상·재난·범죄 피해·약자 조롱 소재는 반려.</p>
      <nav className="flex flex-wrap gap-2">
        {[["new", "새 제보"], ["picked", "채택"], ["rejected", "반려"]].map(([k, l]) => (
          <Link key={k} href={`/admin/tips?s=${k}`} className={k === s ? ui.btn2 : ui.ghost}>{l}</Link>
        ))}
      </nav>
      <div className="flex flex-col gap-2.5">
        {rows.map((r) => (
          <div key={r.id} className={`${ui.card} flex flex-wrap gap-3 items-center`}>
            <div className="flex-1 min-w-[260px] flex flex-col gap-1">
              <strong className="text-[16px]">{r.headline}</strong>
              <a href={r.source_url} target="_blank" rel="noopener noreferrer nofollow" className="text-[13px] underline break-all">{r.source_url}</a>
              {r.note && <span className="text-[14px] text-muted">{r.note}</span>}
              <span className="text-[12px] text-muted">{r.nickname ?? "익명"} · {new Date(r.created_at).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {(["picked", "rejected", "delete"] as const).filter((x) => x !== s).map((x) => (
                <form key={x} action={setTip}>
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="status" value={x} />
                  <button type="submit" className={x === "picked" ? ui.btn2 : x === "delete" ? ui.danger : ui.ghost}>
                    {x === "picked" ? "채택" : x === "rejected" ? "반려" : "삭제"}
                  </button>
                </form>
              ))}
            </div>
          </div>
        ))}
        {!rows.length && <p className="text-[14px] text-muted">이 칸은 비어 있습니다.</p>}
      </div>
    </div>
  );
}
