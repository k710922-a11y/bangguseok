import Link from "next/link";
import { revalidatePath } from "next/cache";
import { requireAdmin, str, ui } from "../_lib";

export const dynamic = "force-dynamic";

async function setStatus(formData: FormData) {
  "use server";
  const { supabase } = await requireAdmin();
  const id = str(formData, "id");
  const status = str(formData, "status");
  if (!id || !status) return;
  if (status === "delete") await supabase.from("wrong_answers").delete().eq("id", id);
  else {
    // 이번 주 1위(featured)는 하나만 — 새로 지정하면 기존 1위는 approved 로 내린다
    if (status === "featured") await supabase.from("wrong_answers").update({ status: "approved" }).eq("status", "featured");
    await supabase.from("wrong_answers").update({ status }).eq("id", id);
  }
  revalidatePath("/admin/wrong-answers");
}

const TABS = [
  { key: "pending", label: "심사 대기" },
  { key: "approved", label: "공개 중" },
  { key: "featured", label: "이번 주 1위" },
  { key: "rejected", label: "반려" },
];

function Btn({ id, status, label, cls }: { id: string; status: string; label: string; cls: string }) {
  return (
    <form action={setStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button type="submit" className={cls}>{label}</button>
    </form>
  );
}

export default async function WrongAnswersAdmin({ searchParams }: { searchParams: Promise<{ s?: string }> }) {
  const s = (await searchParams).s ?? "pending";
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("wrong_answers").select("*").eq("status", s).order("votes", { ascending: false }).order("created_at", { ascending: false }).limit(200);
  const rows = (data ?? []) as { id: string; nickname: string; body: string; votes: number; episode_code: string | null; created_at: string }[];

  return (
    <div className="flex flex-col gap-5 max-w-[1100px]">
      <h1 className={ui.h1}>오답 심사</h1>
      <p className="m-0 text-[14px] text-muted">승인하면 사이트 「오답 명예의 전당」에 공개됩니다. 1위로 지정한 오답의 닉네임을 다음 화 엔딩에 넣어 주세요.</p>
      <nav className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link key={t.key} href={`/admin/wrong-answers?s=${t.key}`} className={t.key === s ? ui.btn2 : ui.ghost}>{t.label}</Link>
        ))}
      </nav>
      <div className="flex flex-col gap-2.5">
        {rows.map((r) => (
          <div key={r.id} className={`${ui.card} flex flex-wrap gap-3 items-center`}>
            <div className="flex-1 min-w-[240px]">
              <div className="text-[16px]">&ldquo;{r.body}&rdquo;</div>
              <div className="text-[12px] text-muted">{r.nickname} · {r.episode_code ?? "회차 미지정"} · 👍 {r.votes} · {new Date(r.created_at).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}</div>
            </div>
            <div className="flex flex-wrap gap-2">
              {s !== "approved" && <Btn id={r.id} status="approved" label="승인" cls={ui.ghost} />}
              {s !== "featured" && <Btn id={r.id} status="featured" label="이번 주 1위" cls={ui.btn2} />}
              {s !== "rejected" && <Btn id={r.id} status="rejected" label="반려" cls={ui.ghost} />}
              <Btn id={r.id} status="delete" label="삭제" cls={ui.danger} />
            </div>
          </div>
        ))}
        {!rows.length && <p className="text-[14px] text-muted">이 칸은 비어 있습니다.</p>}
      </div>
    </div>
  );
}
