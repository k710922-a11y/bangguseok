# [방구석] 춘식&덕구 — bangguseok.jawsweb.site

B급 레트로 코미디 채널 「방구석 춘식&덕구」 공식 사이트. **대문에서 두 개의 채널(디자인)을 골라 입장**한다.

| 경로 | 화면 |
|---|---|
| `/` | 대문 — 시안 A·C 중 선택 |
| `/tv/*` | 시안 A · 채널 고정! 브라운관 TV (어두운 자취방) |
| `/ilbo/*` | 시안 C · 방구석 일보 (캐릭터시트 누런 종이 신문) |
| `/{tv,ilbo}/tapes`, `/tapes/[코드]` | 회차 아카이브 · 회차 페이지(영상·Q1/Q2·테이프 코드·출연·다음 화) |
| `/{tv,ilbo}/people`, `/people/[slug]` | 캐릭터 12인 · 캐릭터시트 · 출연작 |
| `/{tv,ilbo}/play` | 아재개그 자판기 · 오답 명예의 전당 · 늬우스 제보함 |
| `/login`, `/admin/*` | 운영 콘솔 — **k710922@gmail.com 만** (각 화면 우측 상단 ⚙ 운영) |

해동기공·A.D.I 와 같은 구조: **Next.js 16 · React 19 · Tailwind 4 · 자체 호스팅 Supabase · 미니PC Coolify**.
로그인도 같은 방식 — Supabase 이메일/비밀번호 → 서버에서 `getUser()` 로 JWT 검증 → 소유자 이메일 확인,
DB 쪽은 `is_owner()` RLS 로 이중 차단.

## 백엔드 API
| 엔드포인트 | 용도 |
|---|---|
| `POST /api/tape` | 테이프 코드 → 회차 + 보너스(Q 정답·해설·숨은 파리) |
| `GET /api/jokes/random` | 자판기 문제 |
| `POST /api/wrong-answers`, `/vote` | 오답 제출(승인 대기) · 투표 |
| `POST /api/tips` | 늬우스 제보 |
| `GET /api/cron/youtube-sync` | 유튜브 → 회차 자동 수집 (CRON_SECRET) |
| `POST /api/admin/upload` | 어드민 이미지 업로드 → media 버킷 |

## 로컬 실행
```bash
npm install
cp .env.example .env.local   # Supabase 값을 넣지 않아도 내장 시드로 공개 화면은 뜬다
npm run dev
```

## 배포
`docs/DEPLOY.md` (Coolify·Cloudflare) → `docs/SUPABASE_BANGGUSEOK.md` (DB). 시드 수정은 `src/lib/seed-data.ts` 를 고친 뒤
`node --experimental-strip-types scripts/gen-seed.mjs` 로 `supabase/seed.sql` 재생성.

## 디자인 토큰
`src/app/globals.css` — `data-theme="tv" | "ilbo" | "admin"` 이 `--bg/--fg/--panel/--accent…` 를 바꾸고,
컴포넌트는 `bg-bg text-fg bg-accent` 처럼 토큰 이름만 쓴다. 로고·얼굴·캐릭터시트는 `public/img/` (Drive 원본을 WebP 로 변환).
