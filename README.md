# 이음 — 디지털 기기 연습 앱

키오스크 같은 무인 기기 사용법을 **단계별로 천천히** 연습할 수 있는 PWA(설치형 웹앱)예요.
어르신, 장애가 있는 분 등 디지털 기기가 낯선 분들이 실제 기계 앞에서 당황하지 않도록 돕는 것이 목표예요.

## 주요 기능

| 기능 | 설명 |
|---|---|
| 4단계 학습 | **배우기**(누를 곳이 반짝임) → **연습하기**(막히면 도움말) → **혼자 해보기**(할 일만 보고 혼자) → **실제 기계처럼**(진짜 기계처럼 복잡한 화면) |
| 어르신도 쉽게 | 외래어 대신 쉬운 우리말(도움말, 할 일, 주문 기계), 큰 글씨·진한 글자색, 안내 글 속 **누를 버튼 이름은 노란 형광펜**으로 표시 |
| 맞춤 안내 | 처음 실행할 때 그림 네모 3개(👁 **글자** / 👂 **소리** / 👁+👂 **글자 + 소리**) 중 하나를 누르면 바로 다음으로 넘어가요 |
| 보기 편한 화면 | 글씨 크기 3단계, 고대비(검은 바탕) 모드 |
| 틀려도 괜찮아요 | 무엇을 눌렀는지 알려주고, 올바른 위치를 친절하게 안내해요 |
| 기록 | 걸린 시간, 틀린 횟수, 별(★) 4개로 진도 확인 |
| 오프라인 | 한 번 열면 인터넷 없이도 연습할 수 있어요 |
| 개인정보 보호 | 서버나 로그인이 없어요. 기록은 그 휴대폰 안에만 저장돼요 |

연습 시나리오는 지금 3가지예요. 가게·병원 이름은 모두 지어낸 이름이에요.
- 🍔 햄버거 가게 키오스크 (행복버거): 메뉴 분류, 세트 선택, 카드 결제
- ☕ 카페 키오스크 (구름카페): 온도·크기·수량 옵션, 포인트 적립 건너뛰기
- 🏥 병원 무인 접수기 (튼튼병원): 숫자판으로 생년월일 입력, 진료과 선택

### 4단계 '실제 화면'

1~3단계는 배우기 쉽게 단순하게 만든 화면이고, 4단계는 **실제 키오스크·병원 접수기와 최대한 비슷한 화면**이에요.
특정 회사의 로고나 화면을 그대로 베끼지 않고(상표·저작권 문제), 여러 실제 기계에서 공통으로 보이는 모습을 모았어요.

| 실제 기계의 어려운 점 | 4단계에 넣은 것 |
|---|---|
| 작은 글씨, 빽빽한 메뉴 | 화면 너비에 맞춘 작은 글씨, 9~12개 메뉴, 왼쪽 세로 분류·가로 탭 |
| 헷갈리는 메뉴 | BEST/NEW 표시, 품절(SOLD OUT)·휴진, 비슷한 이름(불고기 / 더블 불고기) |
| 계속 뜨는 창 | 세트 → 사이드 → 음료를 차례로 고르는 창, 추가 메뉴 권유, 스탬프 적립, 매장/포장을 마지막에 묻기 |
| 긴 옵션 창 | 온도·사이즈·샷·시럽·우유… 아래로 내려야 수량이 보임 |
| 시간 제한 | 남은 시간 표시(60~90초), 화면을 누르면 다시 처음 시간으로, 시간이 다 되면 "계속하시겠습니까?" 창 → 그냥 두면 처음 화면으로 |
| 화면 밖의 장치 | 기계 몸체의 **카드 투입구**(꽂기 → 결제 중 기다리기 → 뽑기)와 **영수증·번호표 출구** |
| 병원 접수 | 업무 8가지, 본인 확인 방법 고르기, 개인정보 동의 체크, 주민등록번호(뒷자리 ●로 가림), 가나다순 진료과, 의사별 대기 인원 |

## 앱 아이콘 바꾸기

`icons/logo-source.png` 가 원본 로고예요. 이 그림을 바꾼 뒤 아래 명령을 실행하면 크기별 아이콘이 다시 만들어져요.

```powershell
powershell -ExecutionPolicy Bypass -File tools\make_icons.ps1
```

초록색 그림 부분만 잘라서 흰 바탕 가운데에 놓아요. (안드로이드용 '마스커블' 아이콘은 잘려도 괜찮게 여백을 더 줘요)

## 내 컴퓨터에서 실행하기

PWA는 파일을 더블클릭해서 열면 동작하지 않아요. 간단한 서버로 열어야 해요.

```powershell
cd C:\Users\User\jeom
python -m http.server 8080
```

그다음 브라우저에서 `http://localhost:8080` 을 열어요.

## 인터넷에 올리기 (무료, GitHub Pages)

휴대폰에서 쓰거나 친구에게 공유하려면 인터넷 주소가 필요해요. PWA는 **https** 주소에서만 설치돼요.

1. [github.com](https://github.com) 에 가입하고 새 저장소(Repository)를 만들어요. 예: `ieum`
2. 이 폴더의 파일을 모두 올려요. (`Add file` → `Upload files` 로 끌어다 놓기. `tools`, `.claude` 폴더는 안 올려도 돼요)
3. 저장소의 `Settings` → `Pages` → Branch를 `main`, 폴더를 `/ (root)` 로 고르고 `Save`
4. 1~2분 뒤 `https://내아이디.github.io/ieum/` 주소가 생겨요.
5. 이 주소로 QR코드를 만들어 나눠 주면, 휴대폰 카메라로 찍어서 바로 열 수 있어요.

> 앱을 고친 뒤 다시 올릴 때는 `sw.js` 맨 위의 `CACHE = 'ieum-v3'` 숫자를 올려 주세요. (v3 → v4)
> 그래야 이미 설치한 휴대폰에도 새 버전이 들어가요.

### 휴대폰에 설치하기
- **안드로이드(크롬)**: 앱 첫 화면의 '휴대폰에 앱으로 설치하기' 버튼, 또는 메뉴(⋮) → '홈 화면에 추가'
- **아이폰(사파리)**: 아래 공유 버튼(□↑) → '홈 화면에 추가'

## 폴더 구조

```
jeom/
├─ index.html            앱의 뼈대 (한 페이지)
├─ manifest.webmanifest  앱 이름, 아이콘, 색 (PWA 설정)
├─ sw.js                 서비스 워커: 오프라인 저장
├─ css/style.css         디자인 (큰 글씨, 고대비, 가상 키오스크 모양)
├─ js/
│  ├─ app.js             화면 이동, 시작/설정/목록/결과 화면
│  ├─ engine.js          연습 진행 (정답 확인, 힌트, 반짝임, 점수)
│  ├─ kiosk.js           시나리오 설계도 → 키오스크 화면으로 그리기
│  ├─ speech.js          목소리 안내(TTS), 효과음, 진동
│  ├─ store.js           설정·기록 저장
│  └─ ui.js              알림, 확인 창, 한국어 조사(을/를) 처리
├─ scenarios/            연습 시나리오 (여기만 고치면 새 연습을 만들 수 있어요)
│  ├─ index.js           연습 목록
│  ├─ burger.js          1~3단계 (쉬운 화면)
│  ├─ burger-real.js     4단계 실제 화면
│  ├─ cafe.js / cafe-real.js
│  └─ hospital.js / hospital-real.js
├─ icons/                앱 아이콘 (logo-source.png 가 원본)
└─ tools/make_icons.ps1  원본 로고로 아이콘을 다시 만드는 스크립트
```

## 새 시나리오 만들기

예를 들어 '영화관 발권기'를 추가하고 싶다면:

1. `scenarios/burger.js` 를 복사해서 `scenarios/movie.js` 로 저장해요.
2. `id`, `title`, `summary`, `icon`, `theme`, `kioskName`, `mission` 을 바꿔요.
3. `screens` 에 화면들을 설계하고, `steps` 에 순서를 적어요.
4. `scenarios/index.js` 에 `import movie from './movie.js';` 를 넣고 목록에 `movie` 를 추가해요.
5. `sw.js` 의 `FILES` 에 `'./scenarios/movie.js'` 를 추가해요.

`theme` 는 지금 `burger`(빨강), `cafe`(갈색), `hospital`(파랑)이 있어요. 새 색을 쓰려면 `css/style.css` 의 `.theme-burger` 줄을 따라 하나 추가하면 돼요.

### 단계(step) 쓰는 법

```js
{
  screen: 'where',          // 보여줄 화면 이름
  target: 'eat-in',         // 눌러야 하는 버튼 id
  guide: "'먹고 가기'를 눌러보세요.",              // 자막
  voice: '왼쪽에 있는 먹고 가기 버튼을 누르세요.',  // 목소리 (위치를 말로 설명하면 좋아요)
  hint: '접시 그림이 있는 왼쪽 버튼이에요.',       // 틀렸을 때 / 힌트 버튼
}
```

숫자를 입력하는 단계는 `target` 대신 `input` 을 써요:
`input: { display: 'birth', value: '520315' }`

### 화면 부품(type) 목록

| type | 모양 | 예시 |
|---|---|---|
| `title` | 큰 제목 | `{ type: 'title', text: '어서 오세요!' }` |
| `text` | 글 (`small: true` 면 작게) | `{ type: 'text', text: '안내문' }` |
| `label` | 작은 소제목 | `{ type: 'label', text: '① 온도' }` |
| `icon` | 큰 그림(이모지) | `{ type: 'icon', text: '🍔' }` |
| `button` | 버튼. style: `primary` `outline` `ghost` `big` `choice` | `{ type: 'button', id: 'pay', label: '결제하기', style: 'primary' }` |
| `row` | 버튼 여러 개를 가로로 | `{ type: 'row', items: [버튼, 버튼] }` |
| `grid` | 메뉴 카드 바둑판 | `{ type: 'grid', cols: 2, items: [{ id, icon, label, sub, badge }] }` |
| `tabs` | 메뉴 분류 탭 | `{ type: 'tabs', active: 'tab-a', items: [{ id, label }] }` |
| `list` | 내역 표 | `{ type: 'list', items: [{ label, value }] }` |
| `total` | 합계 금액 | `{ type: 'total', label: '금액', value: '6,500원' }` |
| `display` + `keypad` | 숫자 입력칸 + 숫자판 | `{ type: 'display', id: 'birth', length: 6 }`, `{ type: 'keypad' }` |
| `stepper` | 수량 − 1 + | `{ type: 'stepper', label: '수량', value: 1, minusId: 'qty-minus', plusId: 'qty-plus' }` |
| `cartbar` | 아래쪽 장바구니 띠 | `{ type: 'cartbar', text: '1개', button: 버튼 }` |
| `slot` | 카드 투입구 그림 | `{ type: 'slot', id: 'card-slot', label: '카드 꽂기' }` |
| `ticket` | 번호표 | `{ type: 'ticket', title: '주문번호', number: '105', text: '...' }` |

화면에 `base: '다른화면이름'` 을 쓰면 그 화면 위에 **팝업 창**으로 떠요. `footer` 에 넣은 부품은 화면 맨 아래에 고정돼요.

### 4단계(실제 화면) 만들기

`burger-real.js` 처럼 따로 파일을 만들고, 원래 시나리오에 `import real from './movie-real.js';` 와 `real,` 을 넣으면 4단계가 생겨요.
맨 위에 `skin: 'real'`, `timeLimit: 60`(남은 시간, 초), `hardware: ['card', 'receipt']`(카드 투입구·영수증 출구)를 적어요.

| type | 모양 |
|---|---|
| `attract` | 대기 화면 광고 (화면 전체가 버튼). 화면에 `noStatus: true` 를 함께 써요 |
| `banner` | 위쪽 광고 띠 |
| `split` | 왼쪽 세로 분류 + 오른쪽 내용: `{ type: 'split', side: { active, items }, main: [부품들] }` |
| `menu` | 실제 같은 메뉴판: `items: [{ id, icon, label, price, badge: 'BEST', soldout: true }]`, `compact: true` 면 작은 칸 |
| `cartpanel` | 주문 내역 (−/+/×, 합계, 버튼) |
| `optgroup` | 옵션 고르기 (`required: true` 면 '필수') |
| `itemhead` | 옵션 창 맨 위 메뉴 사진·이름·가격 |
| `stepbar` | 1. 장소 › 2. 메뉴 › 3. 결제 진행 표시 |
| `notice` / `check` | 약관 글 상자 / 동의 체크 칸 |
| `spinner` | 처리 중 (빙글빙글) |
| `langbar` | 언어(한국어·English…)·큰 글씨·직원 호출 버튼 줄 |
| `arrowdown` | 기계 아래 장치를 가리키는 화살표 |

단계에 쓸 수 있는 것:
- `target: 'card-reader'` / `'receipt-slot'` : 화면 아래 몸체의 카드 투입구 / 영수증 출구를 누르기
- `wait: 2500` : 누를 것 없이 2.5초 기다리기 (예: 결제 중)
- `hardware: { card: true }` : 카드가 꽂혀 있는 모습, `hardware: { paper: true }` : 출구에 종이가 나온 모습
- 숫자 입력칸 `display` 에 `dash: 6`(6번째 뒤에 -), `mask: '●●●●●●'`(가린 글자), `prefix: '010-'` 을 쓸 수 있어요

시나리오에 빠진 화면이나 버튼이 있으면, 브라우저에서 **F12 → Console** 에 `[시나리오 movie] 3번째 단계: ...` 처럼 알려줘요.

## 알아두면 좋은 점

- **목소리**는 기기에 들어 있는 한국어 음성을 써요. 기기마다 목소리가 다르고, 한국어 음성이 없는 기기에서는 소리 안내가 안 나올 수 있어요. (설정 화면에 안내가 떠요)
- **아이폰**은 화면을 한 번 눌러야 소리가 나와서, 앱을 열 때마다 '눌러서 시작하기' 화면이 먼저 나와요.
- **진동**은 안드로이드에서만 돼요.
