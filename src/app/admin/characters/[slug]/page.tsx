import Link from "next/link";
import { notFound } from "next/navigation";
import { ImageUpload } from "@/components/ImageUpload";
import { requireAdmin, ui } from "../../_lib";
import { deleteCharacter, saveCharacter } from "../actions";

export const dynamic = "force-dynamic";

export default async function CharacterEdit({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { slug } = await params;
  const { saved, error } = await searchParams;
  const { supabase } = await requireAdmin();
  const isNew = slug === "new";
  const { data } = isNew ? { data: null } : await supabase.from("characters").select("*").eq("slug", slug).maybeSingle();
  if (!isNew && !data) notFound();
  const c = (data ?? {}) as Record<string, string | number | null>;
  const v = (k: string) => (c[k] ?? "") as string | number;

  const field = (name: string, label: string, type = "text") => (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className={ui.label}>{label}</label>
      <input id={name} name={name} type={type} defaultValue={v(name)} className={ui.input} />
    </div>
  );
  const area = (name: string, label: string) => (
    <div className="flex flex-col gap-1.5 sm:col-span-2">
      <label htmlFor={name} className={ui.label}>{label}</label>
      <textarea id={name} name={name} defaultValue={String(v(name))} className={ui.textarea} />
    </div>
  );

  return (
    <div className="flex flex-col gap-5 max-w-[900px]">
      <Link href="/admin/characters" className="text-[13px] text-muted">← 캐릭터 목록</Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className={ui.h1}>{isNew ? "새 캐릭터" : `${v("name")} 편집`}</h1>
        {!isNew && <Link href={`/tv/people/${slug}`} target="_blank" className={ui.ghost}>↗ 공개 페이지</Link>}
      </div>
      {saved && <p role="status" className="m-0 text-[14px] font-bold text-osd">저장했습니다.</p>}
      {error && <p role="alert" className="m-0 text-[14px] font-bold text-accent">{error}</p>}

      <form action={saveCharacter} className="flex flex-col gap-5">
        {!isNew && <input type="hidden" name="original_slug" value={slug} />}
        <section className={`${ui.card} grid sm:grid-cols-2 gap-4`}>
          {field("slug", "slug (영문, 주소에 쓰임)")}
          {field("name", "이름")}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="role" className={ui.label}>구분</label>
            <select id="role" name="role" defaultValue={String(v("role") || "support")} className={ui.input}>
              <option value="main">주연</option>
              <option value="support">조연</option>
            </select>
          </div>
          {field("age", "나이", "number")}
          {field("job", "직업")}
          {field("tagline", "한 줄 별명")}
          {field("spinoff", "스핀오프 제목 (선택)")}
          {field("sort", "정렬 순서", "number")}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="color" className={ui.label}>대표 색</label>
            <input id="color" name="color" type="color" defaultValue={String(v("color") || "#E2231A")} className="h-11 w-24 rounded-md bg-transparent border border-line" />
          </div>
          {area("quote", "시그니처 대사")}
          {area("personality", "성격")}
          {area("comic", "웃음 기능")}
          {area("props", "고정 소품")}
        </section>
        <section className={`${ui.card} grid sm:grid-cols-2 gap-5`}>
          <ImageUpload name="face_url" label="얼굴 (투명 PNG/WebP 권장)" defaultValue={String(v("face_url"))} folder="faces" />
          <ImageUpload name="sheet_url" label="캐릭터시트" defaultValue={String(v("sheet_url"))} folder="sheets" />
        </section>
        <div className="flex gap-3">
          <button type="submit" className={ui.btn}>저장</button>
          <Link href="/admin/characters" className={ui.ghost}>취소</Link>
        </div>
      </form>

      {!isNew && (
        <form action={deleteCharacter} className="border-t border-line pt-5">
          <input type="hidden" name="slug" value={slug} />
          <button type="submit" className={ui.danger}>이 캐릭터 삭제 (출연 기록도 지워짐)</button>
        </form>
      )}
    </div>
  );
}
