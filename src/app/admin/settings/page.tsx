import { revalidatePath } from "next/cache";
import { getSettings } from "@/lib/data";
import { requireAdmin, ui } from "../_lib";

export const dynamic = "force-dynamic";

const FIELDS: { key: string; label: string; area?: boolean }[] = [
  { key: "hero_headline", label: "히어로 헤드라인 (TV 큰 문구 · 일보 1면 인용)" },
  { key: "hero_sub", label: "히어로 소개문", area: true },
  { key: "notice", label: "공지 띠 (비우면 숨김)" },
  { key: "youtube_url", label: "YouTube 채널 URL" },
  { key: "tiktok_url", label: "TikTok URL" },
  { key: "instagram_url", label: "Instagram URL" },
];

async function saveSettings(formData: FormData) {
  "use server";
  const { supabase } = await requireAdmin();
  const rows = FIELDS.map((f) => ({ key: f.key, value: String(formData.get(f.key) ?? "").trim(), updated_at: new Date().toISOString() }));
  await supabase.from("site_settings").upsert(rows);
  revalidatePath("/admin/settings");
}

export default async function SettingsAdmin() {
  await requireAdmin();
  const s = (await getSettings()) as unknown as Record<string, string>;
  return (
    <div className="flex flex-col gap-5 max-w-[800px]">
      <h1 className={ui.h1}>사이트 설정</h1>
      <form action={saveSettings} className={`${ui.card} flex flex-col gap-4`}>
        {FIELDS.map((f) => (
          <div key={f.key} className="flex flex-col gap-1.5">
            <label htmlFor={f.key} className={ui.label}>{f.label}</label>
            {f.area ? (
              <textarea id={f.key} name={f.key} defaultValue={s[f.key] ?? ""} className={ui.textarea} />
            ) : (
              <input id={f.key} name={f.key} defaultValue={s[f.key] ?? ""} className={ui.input} />
            )}
          </div>
        ))}
        <button type="submit" className={`${ui.btn} self-start`}>저장</button>
      </form>
    </div>
  );
}
