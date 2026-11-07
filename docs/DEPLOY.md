# bangguseok.jawsweb.site 배포 절차

A.D.I(adi.jawsweb.site)·해동기공과 **완전히 같은 방식**이다:
**GitHub 리포 → 미니PC Coolify 자동 빌드(Railpack) → Cloudflare 터널 `keymedi-home` 서브도메인**, DB는 **방구석 전용 Supabase 인스턴스**.
한 번만 세팅하면 이후에는 `git push` 만으로 배포된다.

| 항목 | 값 |
|---|---|
| 리포 | `k710922-a11y/bangguseok` (private) |
| 공개 도메인 | `https://bangguseok.jawsweb.site` (+ `www.bangguseok…` 은 아래 ⚠️ 참고) |
| Supabase API | `https://api-bangguseok.jawsweb.site` (LAN Studio `http://192.168.0.202:8004` 예정) |
| Coolify | http://192.168.0.202:8000 → Project `bangguseok` |
| 빌드 | Railpack, Port 3000 (Nixpacks 는 Node 버전 문제로 실패 — ADI 와 동일) |

> ### ⚠️ `www.bangguseok.jawsweb.site` 인증서
> Cloudflare 무료 인증서(Universal SSL)는 `jawsweb.site` 와 **한 단계** 서브도메인(`*.jawsweb.site`)만 덮는다.
> `www.bangguseok.jawsweb.site` 는 두 단계라서 그대로 연결하면 브라우저에 **인증서 오류**가 난다.
> - 기본 주소는 `bangguseok.jawsweb.site` 로 운영한다 (adi·haedong 과 같은 형태, 추가 비용 없음).
> - `www.` 도 꼭 필요하면: Cloudflare → SSL/TLS → Edge Certificates → **Advanced Certificate Manager**(월 $10)로
>   `*.bangguseok.jawsweb.site` 인증서를 발급한 뒤, 아래 4단계에서 `www.bangguseok` 호스트를 추가하고
>   Coolify 도메인에 함께 넣는다. 앱은 두 주소 모두에서 그대로 동작한다.

---

## 1. GitHub 리포

`https://github.com/k710922-a11y/bangguseok` (private, 2026-11-07 생성·첫 푸시 완료). 작업 PC 에는:

```bash
cd "C:\Users\KEYMEDI\Documents\[AI.프로젝트] 라이브.프로젝트"
git clone https://github.com/k710922-a11y/bangguseok.git
```

## 2. Supabase — 전용 인스턴스 + 스키마 + 시드

`docs/SUPABASE_BANGGUSEOK.md` 1~6단계. 요약:
Coolify Supabase 서비스 `bangguseok-supabase` → Kong 도메인 `api-bangguseok.jawsweb.site` → Studio SQL Editor 에서
`supabase/schema.sql` → `supabase/seed.sql` → 운영자 계정 `k710922@gmail.com` (Auto Confirm).

## 3. Coolify 앱

1. Project `bangguseok` → **+ New Resource → Private Repository (GitHub App)** → `k710922-a11y/bangguseok`, 브랜치 `main`
2. Build Pack **Railpack**, Port `3000`
3. **Environment Variables** (Build + Runtime 모두 체크):

   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://api-bangguseok.jawsweb.site` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | bangguseok-supabase 의 `SERVICE_SUPABASEANON_KEY` |
   | `SUPABASE_SERVICE_ROLE_KEY` | bangguseok-supabase 의 `SERVICE_SUPABASESERVICE_KEY` |
   | `NEXT_PUBLIC_SITE_URL` | `https://bangguseok.jawsweb.site` |
   | `YOUTUBE_CHANNEL_ID` | `UCpzm3QjqrZ8huyHCHehuAvg` |
   | `YOUTUBE_API_KEY` | (선택) Google Cloud → YouTube Data API v3 키 |
   | `CRON_SECRET` | 아무 긴 난수 (`openssl rand -hex 24`) |

4. **Domains**: `http://bangguseok.jawsweb.site` (ADI 처럼 http — TLS 는 Cloudflare 가 끝낸다)
5. Deploy → 빌드 로그 `✓ Compiled successfully` 확인

> Supabase 를 붙이기 전에 먼저 배포해도 된다. DB 가 없으면 공개 페이지는 내장 시드(캐릭터 12·EP.01~03·자판기 15문제)로 렌더되고,
> 오답·제보 접수와 어드민만 비활성화된다.

## 4. Cloudflare 터널 (서버 터미널)

ADI 와 같은 로컬 설정 파일 방식. 미니PC 터미널에서:

```bash
sudo bash scripts/server/add-cloudflared-hosts.sh   # 리포의 스크립트 — 아래 내용을 자동으로 넣고 재시작
```

직접 넣는다면 `/etc/cloudflared/config.yml` 의 `ingress:` 맨 아래 `- service: http_status:404` **위에**:

```yaml
  - hostname: bangguseok.jawsweb.site
    service: http://127.0.0.1:80
  - hostname: api-bangguseok.jawsweb.site
    path: ^/(rest|auth|storage|realtime|functions|graphql)/v1
    service: http://127.0.0.1:80
```

그다음:

```bash
cloudflared tunnel route dns keymedi-home bangguseok.jawsweb.site
cloudflared tunnel route dns keymedi-home api-bangguseok.jawsweb.site
sudo systemctl restart cloudflared
```

확인: `curl -sI https://bangguseok.jawsweb.site | head -1` → `HTTP/2 200`

## 5. 첫 로그인

`https://bangguseok.jawsweb.site` → 아무 화면 우측 상단 **⚙ 운영** → `/login` → `k710922@gmail.com` + 2단계에서 정한 비밀번호
→ `/admin` 대시보드에 회차 3 · 캐릭터 12 · 자판기 15 가 보이면 끝.
소유자 이메일이 아닌 계정은 로그인해도 즉시 로그아웃되고 "운영자(소유자) 계정만…" 안내가 뜬다.

## 6. 유튜브 자동 수집 (Coolify Scheduled Task)

Coolify → bangguseok-web 앱 → **Scheduled Tasks → + Add**

| 항목 | 값 |
|---|---|
| Name | youtube-sync |
| Command | `curl -fsS -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/youtube-sync` |
| Frequency | `*/30 * * * *` |

수동 실행은 어드민 **유튜브 동기화 → 지금 가져오기**. 결과는 대시보드 「최근 유튜브 동기화」에 남는다.

## 7. 업로드 규칙 (자동 수집이 읽는 형식)

- 제목: `[방구석] 춘식&덕구 : 아재개그 EP.#04` · 늬우스는 제목에 「늬우스」
- 설명란 마지막 줄(선택): `#TAPE VHS-0104 #출연 봉구 #Q1 문제 #Q2 문제`
- 테이프 코드를 생략하면 시리즈 접두어 + 2자리 회차로 자동 생성 (아재개그 = `VHS-01`, 늬우스 = `VHS-02`, 단골 특별전 = `VHS-03`)
- 쇼츠 엔딩에 같은 코드를 1.5초 노출 → 시청자가 사이트에 입력 → Q2 해설·숨은 파리 정답 공개 (보너스는 어드민 회차 편집에서 입력)
