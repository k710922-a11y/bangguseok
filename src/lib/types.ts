export type Series = {
  slug: string;
  title: string;
  channel: string; // 편성표 채널 번호 "03"
  code_prefix: string; // 테이프 코드 접두어 "VHS-01"
  summary: string;
  format: string; // "58초 · 주 2회"
  status: "live" | "coming" | "planned";
  sort: number;
};

export type Character = {
  slug: string;
  name: string;
  role: "main" | "support";
  age: number | null;
  job: string;
  tagline: string; // 한 줄 별명
  personality: string;
  quote: string;
  comic: string; // 웃음 기능
  props: string; // 고정 소품
  spinoff: string | null;
  face_url: string;
  sheet_url: string | null;
  color: string;
  sort: number;
};

export type Episode = {
  id: string;
  series_slug: string;
  number: number;
  tape_code: string;
  title: string;
  youtube_id: string | null;
  tiktok_url: string | null;
  reels_url: string | null;
  thumbnail_url: string | null;
  q1: string | null;
  q2: string | null;
  summary: string | null;
  duration_sec: number | null;
  views: number | null;
  published_at: string | null;
  status: "published" | "draft";
  cast: string[]; // character slugs
};

export type EpisodeBonus = {
  q1_answer: string | null;
  q2_answer: string | null;
  q2_explain: string | null;
  fly_count: number | null;
  note: string | null;
};

export type Joke = {
  id: string;
  question: string;
  answer: string;
  wrong_answer: string | null; // 덕구식 오답
  asker: string; // 출제자 slug
};

export type WrongAnswer = {
  id: string;
  episode_code: string | null;
  nickname: string;
  body: string;
  votes: number;
  status: "pending" | "approved" | "featured" | "rejected";
  created_at: string;
};

export type Tip = {
  id: string;
  nickname: string | null;
  headline: string;
  source_url: string;
  note: string | null;
  status: "new" | "picked" | "rejected";
  created_at: string;
};

export type SiteSettings = {
  hero_headline: string;
  hero_sub: string;
  youtube_url: string;
  tiktok_url: string;
  instagram_url: string;
  notice: string;
};
