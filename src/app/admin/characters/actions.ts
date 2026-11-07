"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { num, requireAdmin, str } from "../_lib";

export async function saveCharacter(formData: FormData) {
  const { supabase } = await requireAdmin();
  const original = str(formData, "original_slug");
  const slug = (str(formData, "slug") ?? "").toLowerCase().replace(/[^a-z0-9-]/g, "");
  if (!slug) redirect(`/admin/characters/${original ?? "new"}?error=${encodeURIComponent("영문 slug 가 필요합니다.")}`);
  const row = {
    slug,
    name: str(formData, "name") ?? slug,
    role: str(formData, "role") === "main" ? "main" : "support",
    age: num(formData, "age"),
    job: str(formData, "job") ?? "",
    tagline: str(formData, "tagline") ?? "",
    personality: str(formData, "personality") ?? "",
    quote: str(formData, "quote") ?? "",
    comic: str(formData, "comic") ?? "",
    props: str(formData, "props") ?? "",
    spinoff: str(formData, "spinoff"),
    face_url: str(formData, "face_url") ?? "",
    sheet_url: str(formData, "sheet_url"),
    color: str(formData, "color") ?? "#E2231A",
    sort: num(formData, "sort") ?? 99,
    updated_at: new Date().toISOString(),
  };
  const { error } = original
    ? await supabase.from("characters").update(row).eq("slug", original)
    : await supabase.from("characters").insert(row);
  if (error) redirect(`/admin/characters/${original ?? "new"}?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/admin/characters");
  redirect(`/admin/characters/${slug}?saved=1`);
}

export async function deleteCharacter(formData: FormData) {
  const { supabase } = await requireAdmin();
  const slug = str(formData, "slug");
  if (slug) await supabase.from("characters").delete().eq("slug", slug);
  revalidatePath("/admin/characters");
  redirect("/admin/characters");
}
