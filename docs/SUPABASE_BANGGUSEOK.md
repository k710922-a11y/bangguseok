# 방구석 전용 Supabase — Coolify 템플릿 → api-bangguseok.jawsweb.site

A.D.I 와 같은 이유(사이트 설정이 key 전역)로 **해동·A.D.I 와 분리된 인스턴스**를 하나 더 띄운다.
변수 이름은 Coolify 공식 Supabase 템플릿 기준 (`docs/SUPABASE_ADI.md` 와 동일 절차).

## 1. 서비스 생성
Coolify http://192.168.0.202:8000 → Project `bangguseok` → **+ New → Service → Supabase**. 아직 Deploy 하지 않는다.

## 2. Kong 도메인
Service Stack → `supabase-kong` → Domains = `http://api-bangguseok.jawsweb.site` → Save.
LAN 에서 Studio 를 쓰려면 Kong 포트를 `8004:8000` 으로 노출 (adi = 8003, 겹치지 않게).

## 3. 환경변수
| 변수 | 값 |
|---|---|
| `SERVICE_USER_ADMIN` / `SERVICE_PASSWORD_ADMIN` | Studio Basic Auth — 메모 |
| `SERVICE_SUPABASEANON_KEY` | → 앱 `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `SERVICE_SUPABASESERVICE_KEY` | → 앱 `SUPABASE_SERVICE_ROLE_KEY` (공개 금지) |
| `GOTRUE_SITE_URL` | `https://bangguseok.jawsweb.site` |
| `API_EXTERNAL_URL` | `https://api-bangguseok.jawsweb.site` |
| `DISABLE_SIGNUP` | `true` (공개 가입 차단 — 운영자만) |
| `ENABLE_EMAIL_AUTOCONFIRM` | `true` |
| `STUDIO_DEFAULT_PROJECT` | `방구석` |

→ **Deploy**, 컨테이너가 모두 healthy 될 때까지 2~3분.

## 4. Cloudflare
`docs/DEPLOY.md` 4단계 (터널 ingress + `cloudflared tunnel route dns`).
공개 인터넷에는 `/rest|auth|storage|realtime|functions|graphql/v1` 만 열고 Studio(`/`)는 404 — ADI 와 동일.

## 5. 스키마 + 시드 (Studio → SQL Editor, LAN `http://192.168.0.202:8004`)
1. `supabase/schema.sql` 전체 → Run — 테이블 10개, RLS, `is_owner()`(k710922@gmail.com), `media` 버킷, 투표 RPC
2. `supabase/seed.sql` 전체 → Run — 시리즈 3 · 캐릭터 12 · EP.01~03 · EP.01 보너스 · 자판기 15 · 사이트 설정
   (둘 다 재실행 안전. 이미 고친 회차 값은 덮어쓰지 않음)

확인: Table Editor → `characters` 12행, `episodes` 3행.

## 6. 운영자 계정
Studio → Authentication → Users → **Add user** → `k710922@gmail.com`, 비밀번호, **Auto Confirm User** 체크.
`is_owner()` 와 앱의 `OWNER_EMAIL` 이 이 이메일만 통과시킨다 (대소문자 무시). 다른 계정은 만들어도 어드민에 못 들어간다.

## 7. 앱 환경변수 → Coolify bangguseok-web
`docs/DEPLOY.md` 3단계 표. 넣은 뒤 **Redeploy**.

---

### 데이터 구조
| 테이블 | 공개 읽기 | 익명 쓰기 | 용도 |
|---|---|---|---|
| `series` | ✓ | | 편성표 (테이프 코드 접두어) |
| `episodes` | 공개 상태만 | | 회차 (유튜브 자동 수집 + 직접 등록) |
| `episode_cast` | ✓ | | 회차 ↔ 캐릭터 |
| `episode_bonus` | ✗ (서버 전용) | | 테이프 코드 입력 시 공개되는 Q 정답·해설·숨은 파리 |
| `characters` | ✓ | | 12인 프로필·얼굴·캐릭터시트 |
| `jokes` | ✓ | | 아재개그 자판기 |
| `wrong_answers` | 승인된 것만 | 승인 대기로만 | 오답 명예의 전당 |
| `tips` | ✗ | 신규로만 | 늬우스 제보 (출처 URL 필수) |
| `site_settings` | ✓ | | 히어로 문구·공지·SNS 링크 |
| `sync_log` | ✗ | | 유튜브 동기화 기록 |

모든 쓰기는 `is_owner()` (소유자 세션) 또는 서버의 service role 키로만 가능하다.

### 트러블슈팅
| 증상 | 조치 |
|---|---|
| 로그인 후 "운영자(소유자) 계정만…" | 로그인한 이메일이 k710922@gmail.com 이 아님 |
| 로그인 `Email not confirmed` | Users 에서 해당 유저 Confirm |
| 오답·제보 제출 "창구가 열리지 않았습니다" | 앱 env 에 Supabase URL/ANON 키 없음 → 넣고 Redeploy |
| 이미지 업로드 403 | schema.sql 의 Storage 블록 재실행 |
| 동기화 "SUPABASE_SERVICE_ROLE_KEY 없음" | 앱 env 추가 후 Redeploy |
