/**
 * 정본(시드) 데이터 — supabase/seed.sql 과 같은 내용.
 * DB 가 아직 연결되지 않았을 때(로컬 미리보기·첫 배포) 공개 페이지가 이 값으로 렌더된다.
 * 캐릭터 정보는 Drive「로고&캐릭터 / 캐릭터시트」기준.
 */
import type { Character, Episode, EpisodeBonus, Joke, Series, SiteSettings } from "./types";

export const SEED_SETTINGS: SiteSettings = {
  hero_headline: "오늘도 아무것도 안 했는데 뭔가 뿌듯하다.",
  hero_sub:
    "1990년대에 시계가 멈춘 자취방, 두 백수가 세상에서 가장 진지하게 쓸데없는 소리를 합니다. 매주 아재개그 배틀과 방구석 늬우스를 방송합니다.",
  youtube_url: "https://www.youtube.com/@room.comedy-911",
  tiktok_url: "",
  instagram_url: "",
  notice: "",
};

export const SEED_SERIES: Series[] = [
  {
    slug: "ajae",
    title: "아재개그 배틀",
    channel: "03",
    code_prefix: "VHS-01",
    summary: "자취방 소파 위 퀴즈 배틀. Q1은 춘식의 선공, Q2는 덕구의 역습.",
    format: "58초 · 주 2회",
    status: "live",
    sort: 1,
  },
  {
    slug: "news",
    title: "방구석 늬우스",
    channel: "07",
    code_prefix: "VHS-02",
    summary: "합판 뉴스데스크에서 전하는 진짜 황당 뉴스. 1970년대 앵커처럼 과하게 진지하게.",
    format: "30~58초 · 주 1회",
    status: "coming",
    sort: 2,
  },
  {
    slug: "spinoff",
    title: "단골 특별전",
    channel: "11",
    code_prefix: "VHS-03",
    summary: "반응 좋은 조연이 주인공. 삼식이 노래방, 옥분 할매 화투 한 판…",
    format: "30초 · 격주",
    status: "planned",
    sort: 3,
  },
];

const face = (f: string) => `/img/faces/${f}.webp`;
const sheet = (f: string) => `/img/sheets/${f}.webp`;

export const SEED_CHARACTERS: Character[] = [
  {
    slug: "chunsik", name: "춘식", role: "main", age: 34, job: "무직 (프로 백수)",
    tagline: "자칭 트렌드세터",
    personality: "게으르고 뻔뻔함, 호기심 많고 아는 척함. 축구·담배·라면·허세. 인생은 한 방이라고 믿음.",
    quote: "오늘도 아무것도 안 했는데 뭔가 뿌듯하다.",
    comic: "선공 출제자. 잘난 척하다 자폭하고, 모든 사건을 국가적 위기로 부풀린다.",
    props: "2002 붉은악마 티셔츠, 청록 추리닝, 담배",
    spinoff: null, face_url: face("chunsik_smug"), sheet_url: sheet("chunsik"), color: "#E2231A", sort: 1,
  },
  {
    slug: "deokgu", name: "덕구", role: "main", age: 33, job: "무직 (사실상 백수)",
    tagline: "기상천외 오답러",
    personality: "멍함, 느림, 착함, 눈치 없음. 라면·TV·틀딱 축구·낮잠. 잘 먹고, 잘 틀리고, 잘 놀림당함.",
    quote: "아…몰라… 그냥 대충 살지 뭐…",
    comic: "후공 출제자. 의식의 흐름대로 황당한 오답을 던지다 가끔 뼈 때리는 팩폭.",
    props: "금 간 안경, 보라색 바람막이, 턱의 밥풀",
    spinoff: null, face_url: face("deokgu_wrong"), sheet_url: sheet("deokgu"), color: "#7B4BB8", sort: 2,
  },
  {
    slug: "bonggu", name: "봉구", role: "support", age: 27, job: "백수 (상시 용돈 구걸형)",
    tagline: "밥 냄새 추적자",
    personality: "늘 해맑고 뻔뻔함, 공짜 좋아함, 음식 냄새만 나면 어디든 따라감.",
    quote: "밥 냄새 났지…?! 어디야?! 나도 좀…!!",
    comic: "음식 냄새만 나면 어디든 난입해 판을 깬다.",
    props: "88번 야구저지, 손선풍기, 편의점 소시지",
    spinoff: "봉구의 냄새 추적", face_url: face("bonggu"), sheet_url: sheet("bonggu"), color: "#4A7FC1", sort: 3,
  },
  {
    slug: "manbok", name: "만복", role: "support", age: 38, job: "전 역도부 / 자칭 피트니스 코치",
    tagline: "자칭 코치",
    personality: "마음 여리고 착한 거구. 엉터리 운동 조언을 진지하게 하고 눈물도 많음.",
    quote: "운동은… 무조건! 많이! 그리고… 일단 버텨요!",
    comic: "엉터리 운동 조언, 허리 통증으로 자폭, 툭하면 감동의 눈물.",
    props: "한양체육관 민소매, 부서진 배드민턴 라켓, 한약 보양즙",
    spinoff: "만복 코치의 홈트", face_url: face("manbok"), sheet_url: sheet("manbok"), color: "#7FA88A", sort: 4,
  },
  {
    slug: "okbun", name: "옥분", role: "support", age: 63, job: "주부 (동네 터줏대감)",
    tagline: "화투 승부사",
    personality: "평소엔 한없이 순하고 다정한 할머니지만, 화투나 음식이 걸리면 냉혹하고 무자비함.",
    quote: "근데 화투랑 음식 앞에선 아무도 못 말려…!",
    comic: "순한 할매에서 냉혹한 승부사로 돌변하는 반전.",
    props: "퀼팅 조끼, 고구마 봉지, 효자손",
    spinoff: "옥분 할매 화투 한 판", face_url: face("okbun"), sheet_url: sheet("okbun"), color: "#6E9A3A", sort: 5,
  },
  {
    slug: "samsik", name: "삼식", role: "support", age: 41, job: "가수 지망생 (전 나이트클럽 가수)",
    tagline: "무대 중독자",
    personality: "나이트클럽에서 실패한 가수. 어디서든 무대를 만들고 노래할 기회를 노리는 뻔뻔한 무대 중독자.",
    quote: "오늘도 한 곡 뽑아볼까! 이~예에~!!",
    comic: "어디서든 노래를 시작하고, 가사를 까먹고, 관객에게 굴욕당한다.",
    props: "노래방 마이크, 가짜 금목걸이, 가죽 점퍼",
    spinoff: "삼식이 노래방", face_url: face("samsik"), sheet_url: sheet("samsik"), color: "#8E2C3A", sort: 6,
  },
  {
    slug: "gwinam", name: "귀남", role: "support", age: 35, job: "동네 패션 오라클 (자칭 스타일리스트)",
    tagline: "패션 오라클",
    personality: "촌스러운 패션을 신념처럼 밀어붙이는, 자기만의 미의식이 확고한 동네 스타일 전도사.",
    quote: "패션은 감각이 아니라 용기야, 용기!",
    comic: "남의 옷차림을 한없이 훈수 두고, 거울 보다 화장 대참사.",
    props: "코발트 트레이닝복, 지브라 에코백, 왕진주 귀걸이",
    spinoff: "귀남의 패션 심판", face_url: face("gwinam"), sheet_url: sheet("gwinam"), color: "#3340A8", sort: 7,
  },
  {
    slug: "boknam", name: "복남", role: "support", age: 58, job: "자칭 전문가 (은퇴)",
    tagline: "자칭 전문가",
    personality: "뭐든지 '내가 예전에…'로 시작하는 자칭 전문가. 평생 쌓은 '경험'이 최고의 스펙이라 믿음.",
    quote: "내가 예전에 말이야… 그때는 말이지…!",
    comic: "과거 미화 훈수, 무시당하면 자존심 상해 라디오 들으며 졸기.",
    props: "낚시조끼, 빨간 휴대용 라디오, 말린 오징어",
    spinoff: "방구석 늬우스 원로 해설위원", face_url: face("boknam"), sheet_url: sheet("boknam"), color: "#A8432E", sort: 8,
  },
  {
    slug: "malsun", name: "말순", role: "support", age: 52, job: "아파트 순찰대장 (자칭)",
    tagline: "아파트 순찰대장",
    personality: "참견, 감시, 소문 수집, 정의감 과잉, 오지랖.",
    quote: "아파트는 내가 지킨다! 한 집도 그냥 못 지나가!",
    comic: "참견·감시·신고, 무시당하면 대성통곡.",
    props: "썬캡, 부채, 원예장갑, 마트 카트",
    spinoff: "늬우스 현장 제보", face_url: face("malsun"), sheet_url: sheet("malsun"), color: "#E07A2E", sort: 9,
  },
  {
    slug: "sunja", name: "순자", role: "support", age: 46, job: "시장 장사 (채소·반찬)",
    tagline: "흥정의 여왕",
    personality: "직설, 깐깐, 흥정의 여왕, 십 원도 깎음.",
    quote: "시장 바닥의 순자 누님! 한 푼도 그냥 안 판다!",
    comic: "흥정 배틀, 손님 앞에서만 공손한 이중 표정.",
    props: "꽃무늬 블라우스, 고무장갑, 대야",
    spinoff: "순자네 흥정 배틀", face_url: face("sunja"), sheet_url: sheet("sunja"), color: "#C2306E", sort: 10,
  },
  {
    slug: "seongchil", name: "성칠", role: "support", age: 31, job: "무직 (동네 소문 수집가)",
    tagline: "동네 소문통",
    personality: "소심, 겁 많음, 수다(귓속말), 호기심 과다. 작은 일도 크게 말함.",
    quote: "동네에 일어나는 건… 다~ 알고 있다…! (…아마도…!)",
    comic: "귓속말로 소문을 퍼뜨리다 '절대 아님!' 발뺌.",
    props: "니트 조끼, 파리채, 휴대폰 파우치",
    spinoff: "늬우스 소문 특파원", face_url: face("seongchil"), sheet_url: sheet("seongchil"), color: "#C9A227", sort: 11,
  },
  {
    slug: "deokchil", name: "덕칠", role: "support", age: 29, job: "배달 (동네 배달대행)",
    tagline: "배달 알뜰왕",
    personality: "아는 척 심한 잔재주꾼, 흥정에 목숨 검. 말은 크게 하는데 금방 들통남.",
    quote: "내가 이거 더 싸게 구할 수 있는데…!",
    comic: "아는 척·흥정에 목숨, 금방 들통나 찌질 눈물.",
    props: "신속배달 폴로티, 보온병, 전자시계",
    spinoff: "덕칠의 득템", face_url: face("deokchil"), sheet_url: sheet("deokchil"), color: "#9DB52A", sort: 12,
  },
];

export const SEED_EPISODES: Episode[] = [
  {
    id: "seed-ep3", series_slug: "ajae", number: 3, tape_code: "VHS-0103",
    title: "[방구석] 춘식&덕구 : 아재개그 EP.#03", youtube_id: "42HmILwKzCA",
    tiktok_url: null, reels_url: null, thumbnail_url: "/img/cuts/cut_33.webp",
    q1: null, q2: null, summary: null, duration_sec: 58, views: null,
    published_at: "2026-11-07T03:12:43Z", status: "published", cast: ["chunsik", "deokgu"],
  },
  {
    id: "seed-ep2", series_slug: "ajae", number: 2, tape_code: "VHS-0102",
    title: "[방구석] 춘식&덕구 : 아재개그 EP.#02", youtube_id: "dmmSmh8EvIc",
    tiktok_url: null, reels_url: null, thumbnail_url: "/img/cuts/cut_18.webp",
    q1: null, q2: null, summary: null, duration_sec: 58, views: null,
    published_at: "2026-11-07T03:11:05Z", status: "published", cast: ["chunsik", "deokgu"],
  },
  {
    id: "seed-ep1", series_slug: "ajae", number: 1, tape_code: "VHS-0101",
    title: "[방구석] 춘식&덕구 : 아재개그 EP.#01", youtube_id: "JETJ1kDEwls",
    tiktok_url: null, reels_url: null, thumbnail_url: "/img/cuts/cut_09.webp",
    q1: "세상에서 제일 가난한 왕은?", q2: "왕이 궁전에 가기 싫을 때 하는 말은?",
    summary: "춘식의 '캡숑짱' 뇌섹남 퀴즈에 덕구가 집주인 아저씨 오답으로 응수. Q2에서 전세 역전.",
    duration_sec: 58, views: null, published_at: "2026-11-07T03:00:29Z", status: "published",
    cast: ["chunsik", "deokgu"],
  },
];

export const SEED_BONUS: Record<string, EpisodeBonus> = {
  "VHS-0101": {
    q1_answer: "최저임금 (최저 + 임금)",
    q2_answer: "궁시렁 궁시렁 (궁 + 싫어)",
    q2_explain: "궁전(宮)에 가기 '싫어' → 궁시렁. 춘식은 '노가리 까러 삐삐 쳐라'라고 했다가 영혼이 빠져나갔다.",
    fly_count: null,
    note: "덕구의 오답: \"팬티에 똥 묻은 줄도 모르고 보일러 안 틀어주는 우리 집 주인아저씨?\"",
  },
};

export const SEED_JOKES: Joke[] = [
  { id: "j1", question: "세상에서 제일 가난한 왕은?", answer: "최저임금", wrong_answer: "보일러 안 틀어주는 우리 집 주인아저씨?", asker: "chunsik" },
  { id: "j2", question: "왕이 궁전에 가기 싫을 때 하는 말은?", answer: "궁시렁 궁시렁", wrong_answer: "내일은 노가리 까러 삐삐 쳐라… 이거지? 완전 따봉이지?", asker: "deokgu" },
  { id: "j3", question: "세상에서 가장 뜨거운 과일은?", answer: "천도복숭아", wrong_answer: "라면 국물에 빠진 귤…?", asker: "chunsik" },
  { id: "j4", question: "왕이 넘어지면?", answer: "킹콩", wrong_answer: "왕창…?", asker: "chunsik" },
  { id: "j5", question: "바나나가 웃으면?", answer: "바나나킥", wrong_answer: "바나나 우유… 사 먹으러 가자 형", asker: "chunsik" },
  { id: "j6", question: "소가 노래를 부르면?", answer: "소송", wrong_answer: "음메~ 이~예에~ (삼식이 형 따라함)", asker: "chunsik" },
  { id: "j7", question: "세상에서 가장 쉬운 숫자는?", answer: "190,000 (십구만 → 쉽구만)", wrong_answer: "0… 아무것도 안 해도 되니까", asker: "chunsik" },
  { id: "j8", question: "오리가 얼면?", answer: "언덕", wrong_answer: "오리털 파카?", asker: "deokgu" },
  { id: "j9", question: "반성문을 영어로 하면?", answer: "글로벌 (글로 벌)", wrong_answer: "쏘리 페이퍼…?", asker: "chunsik" },
  { id: "j10", question: "깨가 죽으면?", answer: "주근깨", wrong_answer: "참기름 됨", asker: "chunsik" },
  { id: "j11", question: "아몬드가 죽으면?", answer: "다이아몬드", wrong_answer: "아몬드 봉봉…?", asker: "deokgu" },
  { id: "j12", question: "미소의 반대말은?", answer: "당기소", wrong_answer: "된장국 안 먹는 소?", asker: "chunsik" },
  { id: "j13", question: "소금의 유통기한은?", answer: "천일 (천일염)", wrong_answer: "짠 날까지", asker: "chunsik" },
  { id: "j14", question: "토끼가 쓰는 빗은?", answer: "래빗", wrong_answer: "당근 모양 빗", asker: "deokgu" },
  { id: "j15", question: "신발이 화가 나면?", answer: "신발끈", wrong_answer: "발 냄새로 복수함", asker: "chunsik" },
];
