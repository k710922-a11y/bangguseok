"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { num, requireAdmin, str } from "../_lib";

function youtubeId(raw: string | null): string | null {
  if (!raw) return null;
  const m = raw.match(/(?:shorts\/|v=|youtu\.be\/|embed\/)([\w-]{11})/);
  return m ? m[1] : /^[\w-]{11}$/.test(raw) ? raw : null;
}

export async function saveEpisode(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = str(formData, "id");
  const publishedLocal = str(formData, "published_at");
  const row = {
    series_slug: str(formData, "series_slug") ?? "ajae",
    number: num(formData, "number") ?? 1,
    tape_code: (str(formData, "tape_code") ?? "").toUpperCase(),
    title: str(formData, "title") ?? "",
    youtube_id: youtubeId(str(formData, "youtube_id")),
    tiktok_url: str(formData, "tiktok_url"),
    reels_url: str(formData, "reels_url"),
    thumbnail_url: str(formData, "thumbnail_url"),
    q1: str(formData, "q1"),
    q2: str(formData, "q2"),
    summary: str(formData, "summary"),
    duration_sec: num(formData, "duration_sec"),
    // datetime-local 은 KST 로 입력받는다
    published_at: publishedLocal ? new Date(`${publishedLocal}:00+09:00`).toISOString() : null,
    status: str(formData, "status") === "draft" ? "draft" : "published",
    updated_at: new Date().toISOString(),
  };
  if (!row.tape_code || !row.title) redirect(`/admin/episodes/${id ?? "new"}?error=${encodeURIComponent("테이프 코드와 제목은 필수입니다.")}`);

  let episodeId = id;
  if (id) {
    const { error } = await supabase.from("episodes").update(row).eq("id", id);
    if (error) redirect(`/admin/episodes/${id}?error=${encodeURIComponent(error.message)}`);
  } else {
    const { data, error } = await supabase.from("episodes").insert(row).select("id").single();
    if (error || !data) redirect(`/admin/episodes/new?error=${encodeURIComponent(error?.message ?? "저장 실패")}`);
    episodeId = data.id;
  }

  // 출연진
  const cast = formData.getAll("cast").map(String);
  await supabase.from("episode_cast").delete().eq("episode_id", episodeId!);
  if (cast.length) await supabase.from("episode_cast").insert(cast.map((c) => ({ episode_id: episodeId, character_slug: c })));

  // 테이프 코드 보너스
  await supabase.from("episode_bonus").upsert({
    episode_id: episodeId,
    q1_answer: str(formData, "q1_answer"),
    q2_answer: str(formData, "q2_answer"),
    q2_explain: str(formData, "q2_explain"),
    fly_count: num(formData, "fly_count"),
    note: str(formData, "note"),
  });

  revalidatePath("/admin/episodes");
  redirect(`/admin/episodes/${episodeId}?saved=1`);
}

export async function deleteEpisode(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = str(formData, "id");
  if (id) await supabase.from("episodes").delete().eq("id", id);
  revalidatePath("/admin/episodes");
  redirect("/admin/episodes");
}
