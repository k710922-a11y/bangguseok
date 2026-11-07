import { NextResponse } from "next/server";
import { getAdminContext } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/** 어드민 이미지 업로드 → media 버킷 → 공개 URL */
export async function POST(req: Request) {
  const ctx = await getAdminContext();
  if (!ctx) return NextResponse.json({ ok: false, message: "권한 없음" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file");
  const folder = String(form.get("folder") ?? "misc").replace(/[^a-z0-9_-]/gi, "");
  if (!(file instanceof File) || !file.type.startsWith("image/")) {
    return NextResponse.json({ ok: false, message: "이미지 파일만 올릴 수 있습니다." }, { status: 400 });
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ ok: false, message: "10MB 이하로 올려 주세요." }, { status: 400 });
  }
  const ext = (file.name.split(".").pop() ?? "png").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const client = createSupabaseAdminClient() ?? ctx.supabase;
  const { error } = await client.storage.from("media").upload(path, file, { contentType: file.type, upsert: false });
  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  const { data } = client.storage.from("media").getPublicUrl(path);
  return NextResponse.json({ ok: true, url: data.publicUrl });
}
