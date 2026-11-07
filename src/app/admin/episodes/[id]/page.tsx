import Link from "next/link";
import { notFound } from "next/navigation";
import { ImageUpload } from "@/components/ImageUpload";
import { requireAdmin, ui } from "../../_lib";
import { deleteEpisode, saveEpisode } from "../actions";

export const dynamic = "force-dynamic";

function toLocal(iso: string | null) {
  if (!iso) return "";
  const d = new Date(new Date(iso).getTime() + 9 * 3600_000);
  return d.toISOString().slice(0, 16);
}

function F({ name, label, value, type = "text", ph }: { name: string; label: string; value?: string | number; type?: string; ph?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className={ui.label}>{label}</label>
      <input id={name} name={name} type={type} defaultValue={value} placeholder={ph} className={ui.input} />
    </div>
  );
}

export default async function EpisodeEdit({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { id } = await params;
  const { saved, error } = await searchParams;
  const { supabase } = await requireAdmin();
  const isNew = id === "new";

  const [{ data: series }, { data: chars }, epRes] = await Promise.all([
    supabase.from("series").select("slug,title,code_prefix").order("sort"),
    supabase.from("characters").select("slug,name").order("sort"),
    isNew
      ? Promise.resolve({ data: null })
      : supabase.from("episodes").select("*, episode_cast(character_slug), episode_bonus(*)").eq("id", id).maybeSingle(),
  ]);
  const ep = epRes.data as (Record<string, unknown> & { episode_cast?: { character_slug: string }[]; episode_bonus?: Record<string, unknown> | null }) | null;
  if (!isNew && !ep) notFound();
  const v = (k: string) => (ep?.[k] as string | number | null | undefined) ?? "";
  const b = (k: string) => (ep?.episode_bonus?.[k] as string | number | null | undefined) ?? "";
  const cast = new Set((ep?.episode_cast ?? []).map((c) => c.character_slug));
  if (isNew) { cast.add("chunsik"); cast.add("deokgu"); }

  return (
    <div className="flex flex-col gap-5 max-w-[960px]">
      <Link href="/admin/episodes" className="text-[13px] text-muted">← 회차 목록</Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className={ui.h1}>{isNew ? "새 회차" : `${v("tape_code")} 편집`}</h1>
        {!isNew && (
          <Link href={`/tv/tapes/${v("tape_code")}`} target="_blank" className={ui.ghost}>↗ 공개 페이지</Link>
        )}
      </div>
      {saved && <p role="status" className="m-0 text-[14px] font-bold text-osd">저장했습니다.</p>}
      {error && <p role="alert" className="m-0 text-[14px] font-bold text-accent">{error}</p>}

      <form action={saveEpisode} className="flex flex-col gap-5">
        {!isNew && <input type="hidden" name="id" value={id} />}
        <section className={`${ui.card} grid sm:grid-cols-2 gap-4`}>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="series_slug" className={ui.label}>시리즈</label>
            <select id="series_slug" name="series_slug" defaultValue={String(v("series_slug") || "ajae")} className={ui.input}>
              {(series ?? []).map((s: { slug: string; title: string; code_prefix: string }) => (
                <option key={s.slug} value={s.slug}>{s.title} ({s.code_prefix}xx)</option>
              ))}
            </select>
          </div>
          <F name="number" label="회차 번호" type="number" value={v("number")} />
          <F name="tape_code" label="테이프 코드 (쇼츠 엔딩에 노출)" value={v("tape_code")} ph="VHS-0104" />
          <F name="title" label="제목 (유튜브 제목)" value={v("title")} ph="[방구석] 춘식&덕구 : 아재개그 EP.#04" />
          <F name="youtube_id" label="유튜브 ID 또는 쇼츠 URL" value={v("youtube_id")} ph="https://youtube.com/shorts/…" />
          <F name="duration_sec" label="길이(초)" type="number" value={v("duration_sec")} />
          <F name="tiktok_url" label="TikTok URL" value={v("tiktok_url")} />
          <F name="reels_url" label="Instagram Reels URL" value={v("reels_url")} />
          <F name="published_at" label="방송일시 (KST)" type="datetime-local" value={toLocal((ep?.published_at as string) ?? null)} />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="status" className={ui.label}>상태</label>
            <select id="status" name="status" defaultValue={String(v("status") || "published")} className={ui.input}>
              <option value="published">공개</option>
              <option value="draft">임시 저장</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <ImageUpload name="thumbnail_url" label="썸네일 (비우면 유튜브 썸네일)" defaultValue={(ep?.thumbnail_url as string) ?? ""} folder="thumbs" />
          </div>
        </section>

        <section className={`${ui.card} grid gap-4`}>
          <F name="q1" label="Q1 (공개)" value={v("q1")} />
          <F name="q2" label="Q2 (공개)" value={v("q2")} />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="summary" className={ui.label}>줄거리 (공개)</label>
            <textarea id="summary" name="summary" defaultValue={String(v("summary"))} className={ui.textarea} />
          </div>
          <fieldset className="m-0 p-0 border-0 flex flex-col gap-2">
            <legend className={`${ui.label} mb-1`}>출연</legend>
            <div className="flex flex-wrap gap-2">
              {(chars ?? []).map((c: { slug: string; name: string }) => (
                <label key={c.slug} className="inline-flex items-center gap-2 min-h-10 px-3 rounded-md border border-line text-[14px] cursor-pointer has-[:checked]:border-accent2 has-[:checked]:text-accent2">
                  <input type="checkbox" name="cast" value={c.slug} defaultChecked={cast.has(c.slug)} />
                  {c.name}
                </label>
              ))}
            </div>
          </fieldset>
        </section>

        <section className={`${ui.card} grid sm:grid-cols-2 gap-4`}>
          <h2 className="sm:col-span-2 m-0 text-[16px] font-bold">테이프 코드 보너스 <span className="text-muted font-normal text-[13px]">— 코드를 입력한 방문자에게만 공개</span></h2>
          <F name="q1_answer" label="Q1 정답" value={b("q1_answer")} />
          <F name="q2_answer" label="Q2 정답" value={b("q2_answer")} />
          <F name="fly_count" label="숨은 파리 수" type="number" value={b("fly_count")} />
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label htmlFor="q2_explain" className={ui.label}>Q2 해설</label>
            <textarea id="q2_explain" name="q2_explain" defaultValue={String(b("q2_explain"))} className={ui.textarea} />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label htmlFor="note" className={ui.label}>비하인드 메모</label>
            <textarea id="note" name="note" defaultValue={String(b("note"))} className={ui.textarea} />
          </div>
          {!isNew && <p className="sm:col-span-2 m-0 text-[13px] text-muted">지금까지 코드 사용 {String(b("unlock_count") || 0)}회</p>}
        </section>

        <div className="flex gap-3">
          <button type="submit" className={ui.btn}>저장</button>
          <Link href="/admin/episodes" className={ui.ghost}>취소</Link>
        </div>
      </form>

      {!isNew && (
        <form action={deleteEpisode} className="border-t border-line pt-5">
          <input type="hidden" name="id" value={id} />
          <button type="submit" className={ui.danger}>이 회차 삭제</button>
        </form>
      )}
    </div>
  );
}
