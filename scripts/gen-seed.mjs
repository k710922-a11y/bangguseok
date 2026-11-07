// src/lib/seed-data.ts → supabase/seed.sql 생성
// 실행: node --experimental-strip-types scripts/gen-seed.mjs
import { writeFileSync } from "node:fs";
import {
  SEED_BONUS, SEED_CHARACTERS, SEED_EPISODES, SEED_JOKES, SEED_SERIES, SEED_SETTINGS,
} from "../src/lib/seed-data.ts";

const q = (v) => (v === null || v === undefined ? "null" : typeof v === "number" ? String(v) : `'${String(v).replace(/'/g, "''")}'`);
const out = [];
out.push("-- 방구석 시드 — scripts/gen-seed.mjs 로 생성. 재실행 안전(upsert).", "begin;", "");

out.push("-- 사이트 설정");
for (const [k, v] of Object.entries(SEED_SETTINGS)) {
  out.push(`insert into public.site_settings (key, value) values (${q(k)}, ${q(v)}) on conflict (key) do nothing;`);
}

out.push("", "-- 시리즈");
for (const s of SEED_SERIES) {
  out.push(`insert into public.series (slug,title,channel,code_prefix,summary,format,status,sort) values (${[s.slug, s.title, s.channel, s.code_prefix, s.summary, s.format, s.status, s.sort].map(q).join(",")}) on conflict (slug) do update set title=excluded.title, channel=excluded.channel, code_prefix=excluded.code_prefix, summary=excluded.summary, format=excluded.format, status=excluded.status, sort=excluded.sort;`);
}

out.push("", "-- 캐릭터 12종");
for (const c of SEED_CHARACTERS) {
  const cols = ["slug", "name", "role", "age", "job", "tagline", "personality", "quote", "comic", "props", "spinoff", "face_url", "sheet_url", "color", "sort"];
  out.push(`insert into public.characters (${cols.join(",")}) values (${cols.map((k) => q(c[k])).join(",")}) on conflict (slug) do update set ${cols.filter((k) => k !== "slug").map((k) => `${k}=excluded.${k}`).join(", ")};`);
}

out.push("", "-- 회차");
for (const e of SEED_EPISODES) {
  const cols = ["series_slug", "number", "tape_code", "title", "youtube_id", "tiktok_url", "reels_url", "thumbnail_url", "q1", "q2", "summary", "duration_sec", "published_at", "status"];
  out.push(`insert into public.episodes (${cols.join(",")}) values (${cols.map((k) => q(e[k])).join(",")}) on conflict (tape_code) do update set ${cols.filter((k) => k !== "tape_code").map((k) => `${k}=coalesce(public.episodes.${k}, excluded.${k})`).join(", ")};`);
  for (const slug of e.cast) {
    out.push(`insert into public.episode_cast (episode_id, character_slug) select id, ${q(slug)} from public.episodes where tape_code=${q(e.tape_code)} on conflict do nothing;`);
  }
}

out.push("", "-- 보너스");
for (const [code, b] of Object.entries(SEED_BONUS)) {
  out.push(`insert into public.episode_bonus (episode_id,q1_answer,q2_answer,q2_explain,fly_count,note) select id, ${[b.q1_answer, b.q2_answer, b.q2_explain, b.fly_count, b.note].map(q).join(",")} from public.episodes where tape_code=${q(code)} on conflict (episode_id) do nothing;`);
}

out.push("", "-- 아재개그 자판기 (비어 있을 때만)");
out.push("do $$ begin if not exists (select 1 from public.jokes) then");
for (const j of SEED_JOKES) {
  out.push(`  insert into public.jokes (question,answer,wrong_answer,asker) values (${[j.question, j.answer, j.wrong_answer, j.asker].map(q).join(",")});`);
}
out.push("end if; end $$;", "", "commit;", "");

writeFileSync(new URL("../supabase/seed.sql", import.meta.url), out.join("\n"));
console.log("supabase/seed.sql written");
