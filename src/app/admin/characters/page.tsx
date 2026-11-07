import Link from "next/link";
import { requireAdmin, ui } from "../_lib";

export const dynamic = "force-dynamic";

export default async function CharactersAdmin() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("characters").select("slug,name,role,tagline,face_url,sort").order("sort");
  const rows = (data ?? []) as { slug: string; name: string; role: string; tagline: string; face_url: string; sort: number }[];
  return (
    <div className="flex flex-col gap-5 max-w-[1100px]">
      <div className="flex items-center gap-3">
        <h1 className={ui.h1}>캐릭터 관리</h1>
        <span className="flex-1" />
        <Link href="/admin/characters/new" className={ui.btn}>+ 새 캐릭터</Link>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
        {rows.map((c) => (
          <Link key={c.slug} href={`/admin/characters/${c.slug}`} className={`${ui.card} p-3 text-center flex flex-col items-center gap-1 hover:border-accent2`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={c.face_url} alt="" className="w-20 h-20 object-contain" />
            <strong className="text-[15px]">{c.name}</strong>
            <span className="text-[12px] text-muted">{c.role === "main" ? "주연" : "조연"} · {c.tagline}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
