import type { Metadata } from "next";
import "./globals.css";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://bangguseok.jawsweb.site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: "[방구석] 춘식&덕구", template: "%s | 방구석 춘식&덕구" },
  description:
    "1990년대에 시계가 멈춘 자취방, 두 백수 춘식과 덕구의 B급 코미디. 아재개그 배틀 · 방구석 늬우스 · 동네 사람들.",
  openGraph: {
    title: "[방구석] 춘식&덕구",
    description: "아재개그 배틀 · 방구석 늬우스 · B급 레트로 코미디",
    images: ["/img/hero_sofa.webp"],
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=Nanum+Myeongjo:wght@400;700;800&family=Noto+Sans+KR:wght@400;500;700;900&family=VT323&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
