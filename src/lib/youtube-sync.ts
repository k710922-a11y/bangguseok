import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * 유튜브 채널 → episodes 자동 수집.
 *
 * 제목 규칙:   [방구석] 춘식&덕구 : 아재개그 EP.#03
 * 설명란 태그(선택, 마지막 줄 권장):
 *   #TAPE VHS-0103   #출연 봉구,옥분   #Q1 세상에서 제일 가난한 왕은?   #Q2 …
 *
 * - YOUTUBE_API_KEY 가 있으면 Data API(설명란 전체·길이·조회수), 없으면 RSS(최근 15개)로 수집.
 * - 이미 있는 회차는 덮어쓰지 않고 비어 있는 칸만 채운다 (어드민에서 고친 값 보호).
 */

export type FeedItem = {
  youtubeId: string;
  title: string;
  description: string;
  publishedAt: string;
  views: number | null;
  durationSec: number | null;
};

const SERIES_KEYWORDS: { slug: string; re: RegExp }[] = [
  { slug: "news", re: /늬우스|뉴스/ },
  { slug: "ajae", re: /아재개그|아재/ },
];

export function parseTitle(title: string): { series: string | null; number: number | null } {
  const series = SERIES_KEYWORDS.find((k) => k.re.test(title))?.slug ?? null;
  const m = title.match(/EP\.?\s*#?\s*(\d{1,3})/i) ?? title.match(/(\d{1,3})\s*(?:화|호)/);
  return { series, number: m ? Number(m[1]) : null };
}

/** "[방구석] 춘식&덕구_아재개그_EP.08_개시리즈1탄   + + + #아재 #쇼츠" → "[방구석] 춘식&덕구 : 아재개그 EP.08 개시리즈1탄" */
export function cleanTitle(raw: string): string {
  let t = raw.split(/\s\+\s|\s#(?!\d)/)[0];
  t = t.replace(/#(?!\d)\S+/g, "").replace(/_/g, " ").replace(/\s+/g, " ").trim();
  t = t.replace(/^(\[방구석\]\s*춘식&덕구)\s*:?\s*/, "$1 : ");
  return t || raw.trim();
}

export function parseTags(description: string, nameToSlug: Map<string, string>) {
  const tape = description.match(/#TAPE\s+([A-Z]{2,5}-\d{4})/i)?.[1]?.toUpperCase() ?? null;
  const q1 = description.match(/#Q1\s+([^\n#]+)/)?.[1]?.trim() ?? null;
  const q2 = description.match(/#Q2\s+([^\n#]+)/)?.[1]?.trim() ?? null;
  const castRaw = description.match(/#출연\s+([^\n#]+)/)?.[1] ?? "";
  const cast = castRaw
    .split(/[,\s·]+/)
    .map((n) => nameToSlug.get(n.trim()))
    .filter((s): s is string => Boolean(s));
  return { tape, q1, q2, cast };
}

function decode(s: string) {
  return s
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

async function fetchRss(channelId: string): Promise<FeedItem[]> {
  const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`RSS ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(([, e]) => ({
    youtubeId: e.match(/<yt:videoId>([^<]+)/)?.[1] ?? "",
    title: decode(e.match(/<title>([^<]*)/)?.[1] ?? ""),
    description: decode(e.match(/<media:description>([\s\S]*?)<\/media:description>/)?.[1] ?? ""),
    publishedAt: e.match(/<published>([^<]+)/)?.[1] ?? new Date().toISOString(),
    views: Number(e.match(/<media:statistics views="(\d+)"/)?.[1] ?? NaN) || null,
    durationSec: null,
  })).filter((i) => i.youtubeId);
}

function isoDuration(d: string): number | null {
  const m = d.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return null;
  return Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0);
}

async function fetchApi(channelId: string, key: string): Promise<FeedItem[]> {
  const uploads = "UU" + channelId.slice(2);
  const pl = await fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=50&playlistId=${uploads}&key=${key}`,
    { cache: "no-store" }
  ).then((r) => r.json());
  const ids: string[] = (pl.items ?? []).map((i: { contentDetails: { videoId: string } }) => i.contentDetails.videoId);
  if (!ids.length) return [];
  const v = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${ids.join(",")}&key=${key}`,
    { cache: "no-store" }
  ).then((r) => r.json());
  type V = { id: string; snippet: { title: string; description: string; publishedAt: string }; contentDetails: { duration: string }; statistics?: { viewCount?: string } };
  return (v.items ?? []).map((i: V) => ({
    youtubeId: i.id,
    title: i.snippet.title,
    description: i.snippet.description,
    publishedAt: i.snippet.publishedAt,
    views: i.statistics?.viewCount ? Number(i.statistics.viewCount) : null,
    durationSec: isoDuration(i.contentDetails.duration),
  }));
}

/**
 * RSS 가 막혔을 때(유튜브 쪽 feeds/videos.xml 이 간헐적으로 404·500 을 낸다) 쓰는 대체 경로:
 * 채널의 /shorts·/videos 페이지에서 videoId 를 모으고 oEmbed 로 제목만 가져온다.
 * 설명란 태그·게시일·조회수는 알 수 없으므로 비워 둔다 (기존 값은 덮어쓰지 않음).
 */
async function fetchPage(channelId: string): Promise<FeedItem[]> {
  const headers = { "user-agent": "Mozilla/5.0 (bangguseok-sync)", "accept-language": "ko-KR,ko;q=0.9" };
  const ids: string[] = [];
  for (const tab of ["shorts", "videos"]) {
    const res = await fetch(`https://www.youtube.com/channel/${channelId}/${tab}`, { headers, cache: "no-store" });
    if (!res.ok) continue;
    const html = await res.text();
    for (const [, id] of html.matchAll(/"videoId":"([\w-]{11})"/g)) if (!ids.includes(id)) ids.push(id);
  }
  if (!ids.length) throw new Error("채널 페이지에서 영상을 찾지 못함");
  const items = await Promise.all(
    ids.slice(0, 30).map(async (id): Promise<FeedItem | null> => {
      const o = await fetch(`https://www.youtube.com/oembed?format=json&url=https://www.youtube.com/watch?v=${id}`, { headers, cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null);
      return o?.title
        ? { youtubeId: id, title: String(o.title), description: "", publishedAt: new Date().toISOString(), views: null, durationSec: null }
        : null;
    })
  );
  return items.filter((i): i is FeedItem => i !== null);
}

export async function fetchChannel(): Promise<{ items: FeedItem[]; source: string }> {
  const channelId = process.env.YOUTUBE_CHANNEL_ID || "UCpzm3QjqrZ8huyHCHehuAvg";
  const key = process.env.YOUTUBE_API_KEY;
  if (key) return { items: await fetchApi(channelId, key), source: "youtube-api" };
  try {
    return { items: await fetchRss(channelId), source: "rss" };
  } catch {
    return { items: await fetchPage(channelId), source: "page" };
  }
}

export type SyncResult = { source: string; found: number; inserted: number; updated: number; skipped: string[] };

/** admin: service role 클라이언트(RLS 우회) */
export async function syncYouTube(admin: SupabaseClient): Promise<SyncResult> {
  const { items, source } = await fetchChannel();
  const [{ data: series }, { data: chars }] = await Promise.all([
    admin.from("series").select("slug,code_prefix"),
    admin.from("characters").select("slug,name"),
  ]);
  const prefix = new Map((series ?? []).map((s: { slug: string; code_prefix: string }) => [s.slug, s.code_prefix]));
  const nameToSlug = new Map((chars ?? []).map((c: { slug: string; name: string }) => [c.name, c.slug]));

  const result: SyncResult = { source, found: items.length, inserted: 0, updated: 0, skipped: [] };

  for (const it of items) {
    const { series: s, number } = parseTitle(it.title);
    if (!s || number === null || !prefix.has(s)) {
      result.skipped.push(it.title);
      continue;
    }
    const tags = parseTags(it.description, nameToSlug);
    const tape = tags.tape ?? `${prefix.get(s)}${String(number).padStart(2, "0")}`;

    const { data: existing } = await admin
      .from("episodes")
      .select("id,title,q1,q2,thumbnail_url,youtube_id")
      .or(`youtube_id.eq.${it.youtubeId},tape_code.eq.${tape}`)
      .maybeSingle();

    const thumb = `https://i.ytimg.com/vi/${it.youtubeId}/hqdefault.jpg`;
    if (existing) {
      const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (it.views !== null) patch.views = it.views;
      if (!existing.youtube_id) patch.youtube_id = it.youtubeId;
      // 예전 동기화가 해시태그째 넣은 제목만 정리 (어드민에서 고친 제목은 그대로)
      if (typeof existing.title === "string" && /#|\s\+\s/.test(existing.title)) patch.title = cleanTitle(existing.title);
      if (!existing.q1 && tags.q1) patch.q1 = tags.q1;
      if (!existing.q2 && tags.q2) patch.q2 = tags.q2;
      if (!existing.thumbnail_url) patch.thumbnail_url = thumb;
      if (it.durationSec) patch.duration_sec = it.durationSec;
      await admin.from("episodes").update(patch).eq("id", existing.id);
      result.updated++;
    } else {
      const { data: ins, error } = await admin
        .from("episodes")
        .insert({
          series_slug: s, number, tape_code: tape, title: cleanTitle(it.title), youtube_id: it.youtubeId,
          thumbnail_url: thumb, q1: tags.q1, q2: tags.q2, duration_sec: it.durationSec,
          views: it.views, published_at: it.publishedAt, status: "published", source: "youtube-sync",
        })
        .select("id")
        .single();
      if (error || !ins) {
        result.skipped.push(`${it.title} (${error?.message ?? "insert 실패"})`);
        continue;
      }
      const cast = tags.cast.length ? tags.cast : ["chunsik", "deokgu"];
      await admin.from("episode_cast").insert(cast.map((c) => ({ episode_id: ins.id, character_slug: c })));
      result.inserted++;
    }
  }

  await admin.from("sync_log").insert({
    source, found: result.found, inserted: result.inserted, updated: result.updated,
    message: result.skipped.length ? `건너뜀: ${result.skipped.join(" | ").slice(0, 900)}` : null,
  });
  return result;
}
