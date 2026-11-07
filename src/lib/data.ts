import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Character, Episode, Joke, Series, SiteSettings, WrongAnswer } from "./types";
import {
  SEED_CHARACTERS,
  SEED_EPISODES,
  SEED_JOKES,
  SEED_SERIES,
  SEED_SETTINGS,
} from "./seed-data";

/**
 * 공개 페이지용 읽기 계층.
 * - Supabase 가 연결돼 있으면 DB(anon, RLS 적용)에서 읽는다.
 * - 연결 전이거나 조회가 실패하면 seed-data 로 폴백해서 사이트가 항상 렌더되게 한다.
 */
let anon: SupabaseClient | null | undefined;
export function db(): SupabaseClient | null {
  if (anon !== undefined) return anon;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  anon = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
  return anon;
}

type EpisodeRow = Omit<Episode, "cast"> & { episode_cast?: { character_slug: string }[] };
const EPISODE_SELECT =
  "id,series_slug,number,tape_code,title,youtube_id,tiktok_url,reels_url,thumbnail_url,q1,q2,summary,duration_sec,views,published_at,status,episode_cast(character_slug)";

function toEpisode(r: EpisodeRow): Episode {
  const { episode_cast, ...rest } = r;
  return { ...rest, cast: (episode_cast ?? []).map((c) => c.character_slug) };
}

export async function getSettings(): Promise<SiteSettings> {
  const c = db();
  if (!c) return SEED_SETTINGS;
  const { data, error } = await c.from("site_settings").select("key,value");
  if (error || !data) return SEED_SETTINGS;
  const map = Object.fromEntries(data.map((r: { key: string; value: string }) => [r.key, r.value]));
  return { ...SEED_SETTINGS, ...map };
}

export async function listSeries(): Promise<Series[]> {
  const c = db();
  if (!c) return SEED_SERIES;
  const { data, error } = await c.from("series").select("*").order("sort");
  return error || !data?.length ? SEED_SERIES : (data as Series[]);
}

export async function listEpisodes(opts: { series?: string; character?: string; limit?: number } = {}): Promise<Episode[]> {
  const c = db();
  let list: Episode[];
  if (!c) {
    list = SEED_EPISODES;
  } else {
    let q = c
      .from("episodes")
      .select(EPISODE_SELECT)
      .eq("status", "published")
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("number", { ascending: false });
    if (opts.series) q = q.eq("series_slug", opts.series);
    const { data, error } = await q;
    list = error || !data ? SEED_EPISODES : (data as unknown as EpisodeRow[]).map(toEpisode);
  }
  if (opts.series) list = list.filter((e) => e.series_slug === opts.series);
  if (opts.character) list = list.filter((e) => e.cast.includes(opts.character!));
  return opts.limit ? list.slice(0, opts.limit) : list;
}

export async function getEpisodeByCode(code: string): Promise<Episode | null> {
  const norm = normalizeTapeCode(code);
  const all = await listEpisodes();
  return all.find((e) => e.tape_code === norm) ?? null;
}

export async function listCharacters(): Promise<Character[]> {
  const c = db();
  if (!c) return SEED_CHARACTERS;
  const { data, error } = await c.from("characters").select("*").order("sort");
  return error || !data?.length ? SEED_CHARACTERS : (data as Character[]);
}

export async function getCharacter(slug: string): Promise<Character | null> {
  return (await listCharacters()).find((c) => c.slug === slug) ?? null;
}

export async function listJokes(): Promise<Joke[]> {
  const c = db();
  if (!c) return SEED_JOKES;
  const { data, error } = await c.from("jokes").select("id,question,answer,wrong_answer,asker").eq("active", true);
  return error || !data?.length ? SEED_JOKES : (data as Joke[]);
}

/** 오늘의 자판기 문제 — 날짜 기준으로 하루 동안 같은 문제 */
export async function jokeOfTheDay(): Promise<Joke> {
  const jokes = await listJokes();
  const kst = new Date(Date.now() + 9 * 3600_000);
  const day = Math.floor(kst.getTime() / 86_400_000);
  return jokes[day % jokes.length];
}

export async function listHallOfFame(limit = 5): Promise<WrongAnswer[]> {
  const c = db();
  if (!c) return [];
  const { data, error } = await c
    .from("wrong_answers")
    .select("id,episode_code,nickname,body,votes,status,created_at")
    .in("status", ["approved", "featured"])
    .order("status", { ascending: true }) // featured 가 앞으로 (알파벳순 a<f 이므로 아래서 재정렬)
    .order("votes", { ascending: false })
    .limit(limit * 2);
  if (error || !data) return [];
  const rows = data as WrongAnswer[];
  rows.sort((a, b) => (a.status === "featured" ? -1 : 0) - (b.status === "featured" ? -1 : 0) || b.votes - a.votes);
  return rows.slice(0, limit);
}

export function normalizeTapeCode(raw: string): string {
  const s = raw.trim().toUpperCase().replace(/\s+/g, "");
  const m = s.match(/^(?:VHS)?-?(\d{2})(\d{2})$/);
  if (m) return `VHS-${m[1]}${m[2]}`;
  return s;
}

export function seriesTitle(series: Series[], slug: string): string {
  return series.find((s) => s.slug === slug)?.title ?? slug;
}
