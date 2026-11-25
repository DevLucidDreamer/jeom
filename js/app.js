/*
 * 앱의 중심: 화면 이동(라우터)과 각 화면(시작, 처음 설정, 목록, 단계 선택, 결과, 설정, 소개)을 그려요.
 * 실제 연습 진행은 engine.js 가 맡아요.
 *
 * 주소 끝의 '#/...' 로 화면을 구분해요.
 *   #/home              연습 목록
 *   #/setup             처음 설정
 *   #/settings          설정
 *   #/about             앱 소개
 *   #/s/burger          단계 선택
 *   #/play/burger/learn 연습 화면
 *   #/done/burger/learn 결과 화면
 */
import { getSettings, saveSettings, hasSettings, getProgress, resetProgress, saveResult } from './store.js';
import * as voice from './speech.js';
import { startPractice, MODES, modesFor } from './engine.js';
import { esc, formatTime, showToast, confirmDialog, closeDialog } from './ui.js';
import { SCENARIOS, getScenario } from '../scenarios/index.js';

const app = document.getElementById('app');
let settings = getSettings();
let started = false;        // 이번에 앱을 열고 '시작하기'를 눌렀는지
let practice = null;        // 진행 중인 연습
let lastResult = null;      // 방금 끝난 연습 결과
let installPrompt = null;   // 안드로이드 '앱 설치' 요청

// 앱 아이콘 그림 (icons 폴더). 큰 화면에는 큰 그림을 써서 선명하게.
const LOGO = `<img class="logo" src="icons/icon-192.png" alt="" width="192" height="192">`;
const LOGO_BIG = `<img class="logo" src="icons/icon-512.png" alt="" width="512" height="512">`;

// 안내 방식 그림: 눈(글자), 귀(소리)
const EYE = `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M4 32C14 15 50 15 60 32 50 49 14 49 4 32Z" style="fill:var(--surface)" stroke="currentColor" stroke-width="4.5" stroke-linejoin="round"/><circle cx="32" cy="32" r="11" fill="currentColor"/><circle cx="36" cy="28" r="3.5" style="fill:var(--surface)"/></svg>`;
const EAR = `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M17 27C17 15 25 7 35 7s18 8 18 19c0 8-4 12-8 15-3 3-5 6-5 11 0 6-4 10-10 10-5 0-8-3-9-7" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><path d="M27 27c0-6 4-10 8-10s9 4 9 10c0 4-3 6-5 7-2 2-3 4-3 6" fill="none" stroke="currentColor" stroke-width="4.5" stroke-linecap="round"/></svg>`;

const GUIDE_OPTIONS = [
  { id: 'caption', pics: [EYE], name: '글자' },
  { id: 'voice', pics: [EAR], name: '소리' },
  { id: 'both', pics: [EYE, EAR], name: '글자 + 소리' },
];
const FONT_OPTIONS = [
  { id: 'normal', name: '보통' },
  { id: 'large', name: '크게' },
  { id: 'xlarge', name: '아주 크게' },
];
const RATE_OPTIONS = [
  { id: 0.8, name: '느리게' },
  { id: 1, name: '보통' },
  { id: 1.2, name: '빠르게' },
];

/* ======================= 설정 적용 ======================= */
function applySettings(s = settings) {
  const root = document.documentElement;
  root.dataset.font = s.font;
  root.dataset.contrast = s.contrast ? 'high' : 'normal';
  root.dataset.guide = s.guide;
  voice.configure(s);
  document.querySelector('meta[name="theme-color"]').content = s.contrast ? '#000000' : '#3B7D2C';
}

/** '소리로 듣기' 모드일 때 화면이 바뀌면 무슨 화면인지 읽어줘요. */
function announce(text) {
  if (settings.guide === 'voice') voice.speak(text);
}

/* ======================= 화면 이동 ======================= */
function go(path) {
  const target = `#/${path}`;
  if (location.hash === target) route();
  else location.hash = target;
}

function route() {
  practice?.destroy();
  practice = null;
  voice.stopSpeaking();
  closeDialog();
  app.className = '';
  window.scrollTo(0, 0);

  // 앱을 열면 항상 시작 화면부터 (아이폰에서 소리를 켜려면 한 번 눌러야 해서)
  if (!started) return renderWelcome();

  const [page, a, b] = location.hash.replace(/^#\/?/, '').split('/');
  switch (page) {
    case 'setup': return renderSetup();
    case 'settings': return renderSettings();
    case 'about': return renderAbout();
    case 's': return renderScenario(a);
    case 'play': return renderPlay(a, b);
    case 'done': return renderDone(a, b);
    default: return renderHome();
  }
}

function focusTitle() {
  app.querySelector('h1')?.focus({ preventScroll: true });
}

/* ======================= 시작 화면 ======================= */
function renderWelcome() {
  app.className = 'page page-welcome';
  app.innerHTML = `
    <section class="welcome">
      ${LOGO_BIG}
      <h1 class="welcome-title">이음</h1>
      <p class="welcome-sub">무인 주문 기계(키오스크),<br>천천히 같이 연습해요</p>
      <button class="btn btn-primary btn-huge pulse" id="start">👆 눌러서 시작하기</button>
      <p class="muted">소리가 나와요. 음량을 확인해 주세요.</p>
    </section>`;

  app.querySelector('#start').addEventListener('click', () => {
    voice.unlockAudio();
    started = true;
    go(hasSettings() ? 'home' : 'setup');
  });
}

/* ======================= 처음 설정 ======================= */
function renderSetup(step = 1, draft = { ...settings }) {
  app.className = 'page';
  voice.configure(draft);

  if (step === 1) {
    app.innerHTML = `
      <section class="setup">
        <p class="step-chip">1 / 2</p>
        <h1 tabindex="-1">어떻게 안내해 드릴까요?</h1>
        <div class="guide-tiles">
          ${GUIDE_OPTIONS.map((o) => `
            <button class="guide-tile" data-guide="${o.id}" aria-pressed="${draft.guide === o.id}">
              <span class="guide-pics">${o.pics.join('<span class="plus" aria-hidden="true">+</span>')}</span>
              <strong>${o.name}</strong>
            </button>`).join('')}
        </div>
      </section>`;
    focusTitle();
    voice.speak('어떻게 안내해 드릴까요? 차례대로 글자, 소리, 글자와 소리가 있어요. 원하는 것을 누르세요.', { force: true });

    // 누르면 바로 다음 단계로 넘어가요.
    app.querySelectorAll('[data-guide]').forEach((btn) => {
      btn.addEventListener('click', () => {
        draft.guide = btn.dataset.guide;
        voice.configure(draft);
        app.querySelectorAll('[data-guide]').forEach((b) => b.setAttribute('aria-pressed', b === btn));
        voice.stopSpeaking();
        if (draft.guide === 'caption') showToast('글자로 안내해 드릴게요', 'info', 1800);
        setTimeout(() => renderSetup(2, draft), 220);
      });
    });
    return;
  }

  // 2단계: 글씨 크기, 고대비
  app.innerHTML = `
    <section class="setup">
      <p class="step-chip">2 / 2</p>
      <h1 tabindex="-1">글씨 크기를 골라주세요</h1>
      <p class="lead">고르면 바로 글씨 크기가 바뀌어요.</p>
      <div class="choice-list">
        ${FONT_OPTIONS.map((o) => `
          <button class="choice-card font-${o.id}" data-font="${o.id}" aria-pressed="${draft.font === o.id}">
            <span class="choice-text"><strong>${o.name}</strong><small class="font-sample">가나다 안녕하세요</small></span>
            <span class="choice-check" aria-hidden="true">✔</span>
          </button>`).join('')}
      </div>
      <button class="choice-card toggle-card" id="contrast" aria-pressed="${draft.contrast}">
        <span class="choice-icon" aria-hidden="true">🌓</span>
        <span class="choice-text"><strong>화면을 더 선명하게</strong><small>검은 바탕에 밝은 글씨로 바꿔요</small></span>
        <span class="choice-check" aria-hidden="true">✔</span>
      </button>
      <div class="row-actions">
        <button class="btn btn-outline" id="prev">← 이전</button>
        <button class="btn btn-primary" id="finish">시작하기</button>
      </div>
    </section>`;
  focusTitle();
  if (draft.guide !== 'caption') {
    voice.speak('글씨 크기를 골라주세요. 보통, 크게, 아주 크게가 있어요. 다 고르면 맨 아래 오른쪽 시작하기를 누르세요.');
  }

  app.querySelectorAll('[data-font]').forEach((btn) => {
    btn.addEventListener('click', () => {
      draft.font = btn.dataset.font;
      applySettings(draft);
      app.querySelectorAll('[data-font]').forEach((b) => b.setAttribute('aria-pressed', b === btn));
    });
  });
  app.querySelector('#contrast').addEventListener('click', (e) => {
    draft.contrast = !draft.contrast;
    applySettings(draft);
    e.currentTarget.setAttribute('aria-pressed', draft.contrast);
  });
  app.querySelector('#prev').addEventListener('click', () => renderSetup(1, draft));
  app.querySelector('#finish').addEventListener('click', () => {
    settings = { ...draft };
    saveSettings(settings);
    applySettings();
    go('home');
  });
}

/* ======================= 연습 목록 (홈) ======================= */
function stars(done, total) {
  return `<span class="stars" aria-label="${total}단계 중 ${done}단계 완료"><span aria-hidden="true">${'★'.repeat(done)}${'☆'.repeat(total - done)}</span></span>`;
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}
function isInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
}

function renderHome() {
  const progress = getProgress();
  app.className = 'page';
  app.innerHTML = `
    <header class="topbar">
      <div class="brand">${LOGO}<span>이음</span></div>
      <a class="btn btn-outline btn-sm" href="#/settings">⚙️ 설정</a>
    </header>
    <h1 tabindex="-1">무엇을 연습할까요?</h1>
    <p class="lead">연습하고 싶은 기계를 눌러주세요.</p>
    <ul class="scn-list">
      ${SCENARIOS.map((sc) => {
        const modes = modesFor(sc);
        const done = modes.filter((m) => progress[sc.id]?.[m]).length;
        return `
        <li>
          <a class="scn-card theme-${sc.theme}" href="#/s/${sc.id}">
            <span class="scn-icon" aria-hidden="true">${sc.icon}</span>
            <span class="scn-text">
              <strong>${esc(sc.title)}</strong>
              <small>${esc(sc.summary)}</small>
              ${stars(done, modes.length)}
            </span>
            <span class="chev" aria-hidden="true">›</span>
          </a>
        </li>`;
      }).join('')}
    </ul>
    <div class="home-extra">
      <button class="btn btn-soft btn-block" id="install" hidden>📲 휴대폰에 앱으로 설치하기</button>
      <a class="btn btn-ghost btn-block" href="#/about">ℹ️ 이음은 어떤 앱인가요?</a>
    </div>`;
  focusTitle();
  announce(`무엇을 연습할까요? ${SCENARIOS.map((s) => s.title).join(', ')}가 있어요. 화면 위쪽부터 차례로 있어요.`);
  updateInstallButton();
}

function updateInstallButton() {
  const btn = document.getElementById('install');
  if (!btn) return;
  btn.hidden = isInstalled() || !(installPrompt || isIOS());
  btn.onclick = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      await installPrompt.userChoice.catch(() => null);
      installPrompt = null;
      updateInstallButton();
    } else {
      confirmDialog({
        title: '아이폰에서 설치하는 법',
        html: `<ol class="howto"><li>사파리(Safari) 아래쪽의 <strong>공유 버튼(□↑)</strong>을 눌러요.</li><li><strong>'홈 화면에 추가'</strong>를 눌러요.</li><li>오른쪽 위 <strong>'추가'</strong>를 누르면 끝!</li></ol>`,
        ok: '알겠어요',
        cancel: null,
      });
    }
  };
}

/* ======================= 단계 선택 ======================= */
function renderScenario(id) {
  const sc = getScenario(id);
  if (!sc) return go('home');
  const progress = getProgress()[sc.id] || {};
  app.className = 'page';
  app.innerHTML = `
    <header class="topbar">
      <a class="btn btn-outline btn-sm" href="#/home">← 목록</a>
    </header>
    <div class="scn-hero theme-${sc.theme}">
      <span class="scn-icon" aria-hidden="true">${sc.icon}</span>
      <h1 tabindex="-1">${esc(sc.title)}</h1>
    </div>
    <div class="mission">
      <strong>🎯 이번 연습</strong>
      <p>${esc(sc.mission)}</p>
    </div>
    <h2>단계를 골라주세요</h2>
    <div class="mode-list">
      ${modesFor(sc).map((m) => {
        const r = progress[m];
        return `
        <a class="mode-card mode-${m}" href="#/play/${sc.id}/${m}">
          <span class="mode-icon" aria-hidden="true">${MODES[m].icon}</span>
          <span class="mode-text">
            <span class="mode-step">${MODES[m].step}단계</span>
            <strong>${MODES[m].name}</strong>
            <small>${MODES[m].desc}</small>
            ${r ? `<span class="mode-done">✔ 완료 · 최고 기록 ${formatTime(r.best.time)}, 틀린 횟수 ${r.best.mistakes}번</span>` : ''}
          </span>
          <span class="chev" aria-hidden="true">›</span>
        </a>`;
      }).join('')}
    </div>
    <p class="muted center">처음이라면 1단계 '배우기'부터 시작해 보세요.</p>`;
  focusTitle();
  announce(`${sc.title}. 이번 연습은, ${sc.mission} 위에서부터 ${modesFor(sc).map((m) => `${MODES[m].step}단계 ${MODES[m].name}`).join(', ')}. 모두 ${modesFor(sc).length}단계예요.`);
}

/* ======================= 연습 화면 ======================= */
function renderPlay(id, mode) {
  const sc = getScenario(id);
  if (!sc || !modesFor(sc).includes(mode)) return go('home');
  app.className = 'page-play';
  practice = startPractice(app, sc, mode, settings, {
    async onExit() {
      announce('연습을 그만할까요? 왼쪽은 계속하기, 오른쪽은 그만하기예요.');
      const ok = await confirmDialog({
        title: '연습을 그만할까요?',
        text: '지금까지 한 연습은 기록되지 않아요.',
        ok: '그만하기',
        cancel: '계속하기',
      });
      if (ok) go(`s/${id}`);
      return ok;
    },
    onFinish(result) {
      const isBest = saveResult(id, mode, result);
      lastResult = { id, mode, isBest, ...result };
      go(`done/${id}/${mode}`);
    },
  });
}

/* ======================= 결과 화면 ======================= */
function renderDone(id, mode) {
  const sc = getScenario(id);
  const r = lastResult;
  if (!sc || !r || r.id !== id || r.mode !== mode) return go(sc ? `s/${id}` : 'home');

  const modes = modesFor(sc);
  const next = modes[modes.indexOf(mode) + 1];
  const praise =
    r.mistakes === 0 ? '한 번도 틀리지 않았어요! 정말 잘하셨어요.'
    : r.mistakes <= 3 ? '잘하셨어요! 조금만 더 연습하면 완벽해요.'
    : '끝까지 해내셨어요! 여러 번 할수록 점점 쉬워져요.';

  app.className = 'page';
  app.innerHTML = `
    <section class="done">
      <div class="done-burst" aria-hidden="true">🎉</div>
      <h1 tabindex="-1">${esc(sc.title)}<br>${MODES[mode].name} 완료!</h1>
      <p class="lead center">${praise}</p>
      <div class="stats">
        <div><span>걸린 시간</span><strong>${formatTime(r.time)}</strong></div>
        <div><span>틀린 횟수</span><strong>${r.mistakes}번</strong></div>
        <div><span>도움말 본 횟수</span><strong>${r.hints}번</strong></div>
      </div>
      ${r.isBest ? '<p class="best">🏅 지금까지 중 최고 기록이에요!</p>' : ''}
      <div class="stack">
        ${next
          ? `<a class="btn btn-primary btn-block" href="#/play/${id}/${next}">다음 단계: ${MODES[next].name} →</a>`
          : `<a class="btn btn-primary btn-block" href="#/home">다른 기계 연습하기 →</a>`}
        <a class="btn btn-outline btn-block" href="#/play/${id}/${mode}">🔁 한 번 더 하기</a>
        <a class="btn btn-ghost btn-block" href="#/s/${id}">단계 선택으로</a>
      </div>
    </section>`;
  focusTitle();
  voice.speak(`${MODES[mode].name} 완료! ${praise} 걸린 시간은 ${formatTime(r.time)}예요.`);
}

/* ======================= 설정 ======================= */
function segment(key, options, current) {
  return `
    <div class="seg" style="--n:${options.length}" role="group">
      ${options.map((o) => `<button data-key="${key}" data-value="${o.id}" aria-pressed="${String(o.id) === String(current)}">${o.name}</button>`).join('')}
    </div>`;
}
const onOff = [{ id: true, name: '켜기' }, { id: false, name: '끄기' }];

function renderSettings() {
  app.className = 'page';
  app.innerHTML = `
    <header class="topbar">
      <a class="btn btn-outline btn-sm" href="#/home">← 목록</a>
    </header>
    <h1 tabindex="-1">설정</h1>

    <section class="set-group">
      <h2>안내 방식</h2>
      ${segment('guide', GUIDE_OPTIONS, settings.guide)}
      <p class="muted small" id="voice-note" hidden>⚠️ 이 기기에서 한국어 목소리를 찾지 못했어요. 소리 안내가 안 나오면 안내 방식을 '글자'로 바꿔 주세요.</p>
    </section>
    <section class="set-group">
      <h2>글씨 크기</h2>
      ${segment('font', FONT_OPTIONS, settings.font)}
    </section>
    <section class="set-group">
      <h2>말하기 빠르기</h2>
      ${segment('rate', RATE_OPTIONS, settings.rate)}
      <button class="btn btn-soft btn-block" id="test-voice">🔊 목소리 들어보기</button>
    </section>
    <section class="set-group">
      <h2>화면을 더 선명하게</h2>
      ${segment('contrast', onOff, settings.contrast)}
    </section>
    <section class="set-group">
      <h2>맞았을 때·틀렸을 때 소리</h2>
      ${segment('sound', onOff, settings.sound)}
    </section>
    ${navigator.vibrate ? `
    <section class="set-group">
      <h2>진동</h2>
      ${segment('vibrate', onOff, settings.vibrate)}
    </section>` : ''}

    <section class="set-group">
      <h2>기타</h2>
      <div class="stack">
        <button class="btn btn-outline btn-block" id="redo-setup">처음 설정 다시 하기</button>
        <button class="btn btn-danger-outline btn-block" id="reset">연습 기록 모두 지우기</button>
      </div>
    </section>`;
  focusTitle();
  announce('설정 화면이에요.');

  setTimeout(() => {
    const note = document.getElementById('voice-note');
    if (note) note.hidden = voice.speechSupported() && voice.hasKoreanVoice();
  }, 800);

  app.querySelectorAll('.seg button').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.key;
      let value = btn.dataset.value;
      if (value === 'true' || value === 'false') value = value === 'true';
      else if (key === 'rate') value = Number(value);

      settings = { ...settings, [key]: value };
      saveSettings(settings);
      applySettings();
      btn.parentElement.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', b === btn));

      if (key === 'guide' && value !== 'caption') voice.speak('이렇게 소리로 안내해 드릴게요.');
      if (key === 'rate') voice.speak('이 빠르기로 말할게요.', { force: true });
      showToast('✔ 저장했어요', 'good', 1000);
    });
  });

  app.querySelector('#test-voice').addEventListener('click', () => {
    if (!voice.speechSupported()) return showToast('이 브라우저는 소리 안내를 지원하지 않아요', 'bad', 2500);
    voice.speak('안녕하세요. 이 목소리가 잘 들리나요?', { force: true });
  });
  app.querySelector('#redo-setup').addEventListener('click', () => go('setup'));
  app.querySelector('#reset').addEventListener('click', async () => {
    const ok = await confirmDialog({
      title: '연습 기록을 지울까요?',
      text: '별과 최고 기록이 모두 사라지고, 되돌릴 수 없어요.',
      ok: '지우기',
      cancel: '취소',
      danger: true,
    });
    if (ok) {
      resetProgress();
      showToast('기록을 지웠어요', 'info');
    }
  });
}

/* ======================= 앱 소개 ======================= */
function renderAbout() {
  app.className = 'page';
  app.innerHTML = `
    <header class="topbar">
      <a class="btn btn-outline btn-sm" href="#/home">← 목록</a>
    </header>
    <h1 tabindex="-1">이음은 어떤 앱인가요?</h1>
    <article class="about">
      <h2>왜 만들었나요?</h2>
      <p>식당, 카페, 병원 어디서나 키오스크 같은 무인 기계가 늘고 있어요. 하지만 화면이 복잡해서 어르신이나 몸이 불편한 분들은 사용하기 어려워요. 실제 기계 앞에서는 뒷사람 눈치가 보여 천천히 배우기도 힘들어요.</p>
      <p>이음에서는 <strong>아무도 기다리지 않아요.</strong> 천천히, 몇 번이고 다시 연습할 수 있어요.</p>

      <h2>이렇게 도와드려요</h2>
      <ul>
        <li><strong>4단계로 천천히</strong>: 배우기(하나씩 알려줌) → 연습하기(막히면 도움말) → 혼자 해보기 → 실제 기계처럼</li>
        <li><strong>나에게 맞는 안내</strong>: 글자만, 소리만, 또는 둘 다</li>
        <li><strong>보기 편한 화면</strong>: 큰 글씨, 검은 바탕의 선명한 화면</li>
        <li><strong>인터넷 없이도</strong>: 한 번 열면 인터넷이 없어도 연습할 수 있어요</li>
      </ul>

      <h2>개인정보</h2>
      <p>이름, 전화번호 같은 정보를 모으지 않아요. 설정과 연습 기록은 이 휴대폰 안에만 저장돼요.</p>

      <h2>휴대폰에 설치하기</h2>
      <ul>
        <li><strong>안드로이드</strong>: 크롬 오른쪽 위 메뉴(⋮) → '홈 화면에 추가' 또는 '앱 설치'</li>
        <li><strong>아이폰</strong>: 사파리 아래 공유 버튼(□↑) → '홈 화면에 추가'</li>
      </ul>

      <p class="muted small">※ 연습 화면의 가게·병원 이름은 연습용으로 지어낸 이름이에요. 실제 기계는 가게마다 화면 모양이 조금씩 달라요.</p>
    </article>`;
  focusTitle();
  announce('이음 앱 소개 화면이에요.');
}

/* ======================= 앱 시작 ======================= */
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  installPrompt = e;
  updateInstallButton();
});
window.addEventListener('appinstalled', () => {
  installPrompt = null;
  updateInstallButton();
  showToast('📲 설치했어요! 홈 화면에서 열 수 있어요', 'good', 3000);
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}

window.addEventListener('hashchange', route);
applySettings();
route();
