import { revalidatePath } from "next/cache";
import { num, requireAdmin, str, ui } from "../_lib";

export const dynamic = "force-dynamic";

async function saveSeries(formData: FormData) {
  "use server";
  const { supabase } = await requireAdmin();
  const original = str(formData, "original");
  const row = {
    slug: (str(formData, "slug") ?? "").toLowerCase().replace(/[^a-z0-9-]/g, ""),
    title: str(formData, "title") ?? "",
    channel: str(formData, "channel") ?? "00",
    code_prefix: (str(formData, "code_prefix") ?? "").toUpperCase(),
    summary: str(formData, "summary") ?? "",
    format: str(formData, "format") ?? "",
    status: str(formData, "status") ?? "planned",
    sort: num(formData, "sort") ?? 9,
  };
  if (!row.slug || !row.title || !row.code_prefix) return;
  if (original) await supabase.from("series").update(row).eq("slug", original);
  else await supabase.from("series").insert(row);
  revalidatePath("/admin/series");
}

type S = { slug: string; title: string; channel: string; code_prefix: string; summary: string; format: string; status: string; sort: number };

function SeriesForm({ s }: { s?: S }) {
  const id = s?.slug ?? "new";
  const f = (name: keyof S, label: string, cls = "") => (
    <div className={`flex flex-col gap-1 ${cls}`}>
      <label htmlFor={`${name}-${id}`} className={ui.label}>{label}</label>
      <input id={`${name}-${id}`} name={name} defaultValue={s?.[name] as string | undefined} className={ui.input} />
    </div>
  );
  return (
    <form action={saveSeries} className={`${ui.card} grid gap-3 sm:grid-cols-4`}>
      {s && <input type="hidden" name="original" value={s.slug} />}
      {f("slug", "slug")}
      {f("title", "제목")}
      {f("channel", "채널 번호")}
      {f("code_prefix", "테이프 코드 접두어")}
      {f("summary", "소개", "sm:col-span-2")}
      {f("format", "포맷")}
      <div className="flex flex-col gap-1">
        <label htmlFor={`status-${id}`} className={ui.label}>상태</label>
        <select id={`status-${id}`} name="status" defaultValue={s?.status ?? "planned"} className={ui.input}>
          <option value="live">방송 중</option>
          <option value="coming">곧 방송</option>
          <option value="planned">준비 중</option>
        </select>
      </div>
      {f("sort", "순서")}
      <div className="sm:col-span-3 flex items-end">
        <button type="submit" className={s ? ui.ghost : ui.btn}>{s ? "저장" : "+ 시리즈 추가"}</button>
      </div>
    </form>
  );
}

export default async function SeriesAdmin() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("series").select("*").order("sort");
  return (
    <div className="flex flex-col gap-4 max-w-[1100px]">
      <h1 className={ui.h1}>시리즈 · 편성표</h1>
      <p className="m-0 text-[14px] text-muted">테이프 코드 접두어 + 두 자리 회차 번호가 자동 코드가 됩니다 (VHS-01 + 04 → VHS-0104).</p>
      {((data ?? []) as S[]).map((s) => <SeriesForm key={s.slug} s={s} />)}
      <SeriesForm />
    </div>
  );
}
