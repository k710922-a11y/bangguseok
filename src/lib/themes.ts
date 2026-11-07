export const THEMES = ["tv", "ilbo"] as const;
export type Theme = (typeof THEMES)[number];

export function isTheme(v: string): v is Theme {
  return (THEMES as readonly string[]).includes(v);
}

export const THEME_INFO: Record<Theme, { name: string; short: string; other: Theme }> = {
  tv: { name: "채널 고정! 브라운관 TV", short: "TV 채널", other: "ilbo" },
  ilbo: { name: "방구석 일보", short: "동네 신문", other: "tv" },
};

export function navFor(theme: Theme) {
  const base = `/${theme}`;
  return theme === "tv"
    ? [
        { href: base, label: "홈" },
        { href: `${base}/tapes`, label: "비디오가게" },
        { href: `${base}/people`, label: "방구석 사람들" },
        { href: `${base}/play`, label: "놀이터" },
      ]
    : [
        { href: base, label: "1면" },
        { href: `${base}/tapes`, label: "지난 호" },
        { href: `${base}/people`, label: "인물 열전" },
        { href: `${base}/play`, label: "퍼즐·투고" },
      ];
}
