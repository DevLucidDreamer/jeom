/*
 * 연습 엔진: 시나리오의 단계(steps)를 하나씩 진행해요.
 *
 * 한 단계의 흐름
 *   1. 키오스크 화면을 보여주고, 안내 문구를 자막/목소리로 알려줘요.
 *   2. 정답 버튼을 누르면 → 칭찬하고 다음 단계로.
 *   3. 다른 버튼을 누르면 → 무엇을 눌렀는지 알려주고 힌트를 줘요.
 *
 * 학습 단계(mode)별 차이
 *   learn(배우기)    : 처음부터 누를 곳이 반짝여요.
 *   practice(연습하기): 반짝임 없이 해보고, 2번 틀리면 반짝여요.
 *   test(실전)       : 미션만 보여줘요. 3번 틀리거나 '도움'을 누르면 알려줘요.
 *   real(실제 화면)  : 실제 기계처럼 복잡한 화면(scenario.real). 안내는 연습하기와 같고,
 *                      실제 기계처럼 남은 시간이 줄어들어요. (아무 곳이나 누르면 다시 처음 시간으로)
 */
import { renderScreen, digitsHTML, screenIds, hardwareHTML } from './kiosk.js';
import * as voice from './speech.js';
import { esc, josa, showToast } from './ui.js';

export const MODES = {
  learn: { step: 1, name: '배우기', icon: '📖', desc: '누를 곳을 반짝여서 하나씩 알려드려요.' },
  practice: { step: 2, name: '연습하기', icon: '✍️', desc: '스스로 눌러 봐요. 막히면 도움말을 볼 수 있어요.' },
  test: { step: 3, name: '혼자 해보기', icon: '🏆', desc: '할 일만 보고 혼자 해봐요. 막히면 도움말을 볼 수 있어요.' },
  real: { step: 4, name: '실제 기계처럼', icon: '🖥️', desc: '진짜 기계처럼 복잡한 화면이에요. 시간 제한도 있어요.' },
};
export const MODE_ORDER = ['learn', 'practice', 'test', 'real'];

/** 이 시나리오에서 할 수 있는 단계들 (실제 화면이 없는 시나리오는 3단계까지) */
export function modesFor(scenario) {
  return MODE_ORDER.filter((m) => m !== 'real' || scenario.real);
}

const PRAISE = ['잘했어요!', '맞아요!', '좋아요!', '훌륭해요!'];
const DIGIT_READ = ['영', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
const TIMEOUT_WAIT = 15; // 시간 초과 창이 뜬 뒤 처음 화면으로 돌아가기까지 (초)

/**
 * 안내 글에서 '작은따옴표'로 감싼 버튼 이름을 노란 형광펜처럼 굵게 보여줘요.
 * 예) "'결제하기'를 눌러요" → [결제하기]를 눌러요  (어르신이 누를 곳을 바로 찾도록)
 */
function formatGuide(text) {
  return esc(text).replace(/&#39;(.+?)&#39;/g, '<b class="g-key">$1</b>');
}

/** 시나리오에 빠진 화면이나 버튼이 없는지 검사해요. 문제가 있으면 개발자 도구(F12) 콘솔에 알려줘요. */
export function checkScenario(sc, label = sc.id) {
  const problems = [];
  sc.steps.forEach((st, i) => {
    const n = `${i + 1}번째 단계`;
    if (!st.guide) problems.push(`${n}: guide(안내 문구)가 없어요`);
    if (!sc.screens[st.screen]) {
      problems.push(`${n}: 화면 '${st.screen}'이(가) 없어요`);
      return;
    }
    if (st.wait) return; // 기다리기 단계는 누를 버튼이 없어요
    const ids = screenIds(sc, st.screen);
    const need = st.input ? [...new Set(st.input.value.split('').map((d) => `key-${d}`))] : [].concat(st.target);
    need.forEach((id) => {
      if (!ids.has(id)) problems.push(`${n}: 화면 '${st.screen}'에 '${id}' 버튼이 없어요`);
    });
  });
  problems.forEach((p) => console.warn(`[시나리오 ${label}] ${p}`));
  return problems;
}

/** 단계에 맞는 시나리오 자료. 실제 화면 단계는 scenario.real 의 화면과 순서를 써요. */
export function scenarioFor(scenario, mode) {
  return mode === 'real' && scenario.real ? { ...scenario, ...scenario.real } : scenario;
}

/**
 * 연습을 시작해요.
 * handlers.onExit()   : '그만하기'를 눌렀을 때
 * handlers.onFinish({ time, mistakes, hints }) : 끝까지 마쳤을 때
 * 돌려주는 값의 destroy() 를 부르면 연습을 정리해요.
 */
export function startPractice(root, baseScenario, mode, settings, handlers) {
  const sc = scenarioFor(baseScenario, mode);
  checkScenario(sc, mode === 'real' ? `${sc.id}(실제 화면)` : sc.id);
  const steps = sc.steps;
  const total = steps.length;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const s = {
    i: 0,            // 지금 몇 번째 단계인지 (0부터)
    wrong: 0,        // 이번 단계에서 틀린 횟수
    mistakes: 0,     // 전체 틀린 횟수
    hints: 0,        // 힌트/도움 본 횟수
    typed: '',       // 숫자판으로 입력 중인 값
    fields: {},      // 입력칸에 들어간 값들
    busy: false,     // 다음 단계로 넘어가는 중 (또는 기다리기 단계)
    highlighted: false,
    finished: false,
    startedAt: Date.now(),
  };
  const timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));
  let lastSpoken = '';

  root.innerHTML = `
    <div class="play mode-${mode}">
      <header class="play-top">
        <button class="btn btn-outline btn-sm" data-act="exit">✕ 그만하기</button>
        <div class="play-title">
          <strong>${esc(sc.title)}</strong>
          <span class="mode-pill">${MODES[mode].step}단계 · ${MODES[mode].name}</span>
        </div>
      </header>
      <div class="progress" role="progressbar" aria-label="진행" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="0">
        <div class="progress-bar"></div>
      </div>
      <div class="play-main">
        <section class="guide" aria-label="안내">
          <div class="guide-meta">
            <span class="progress-text"></span>
            ${mode !== 'test' ? `<span class="mission-line">🎯 ${esc(sc.mission)}</span>` : ''}
          </div>
          <p class="guide-text"></p>
          <p class="guide-voice-only">🔊 소리로 안내하고 있어요</p>
          <div class="guide-actions">
            <button class="btn btn-soft" data-act="replay">🔊 다시 듣기</button>
            <button class="btn btn-soft" data-act="hint">💡 도움말</button>
          </div>
          <p class="sr-only" aria-live="polite" data-live></p>
        </section>
        <section class="stage" aria-label="연습용 기계 화면">
          <div class="kiosk theme-${sc.theme} ${sc.skin === 'real' ? 'skin-real' : ''}">
            <div class="k-screen" data-kiosk></div>
            ${hardwareHTML(sc)}
          </div>
        </section>
      </div>
    </div>`;

  const $ = (sel) => root.querySelector(sel);
  const kioskBox = $('.kiosk');          // 기계 전체 (화면 + 몸체 장치)
  const screenEl = $('[data-kiosk]');    // 기계 화면
  const guideBox = $('.guide');
  const guideText = $('.guide-text');
  const live = $('[data-live]');

  /* ---------- 안내 보여주기 / 읽어주기 ---------- */
  function say(text, voiceText = text, kind = 'guide') {
    guideText.innerHTML = formatGuide(text);
    guideBox.dataset.kind = kind;
    live.textContent = text;
    lastSpoken = voiceText;
    voice.speak(voiceText);
  }

  /* ---------- 반짝임(정답 위치 알려주기) ---------- */
  function currentTargetId() {
    const st = steps[s.i];
    return st.input ? `key-${st.input.value[s.typed.length]}` : [].concat(st.target)[0];
  }
  function clearHighlight() {
    kioskBox.querySelectorAll('.k-hl').forEach((el) => el.classList.remove('k-hl'));
  }
  function highlightEl(el) {
    clearHighlight();
    if (!el) return;
    el.classList.add('k-hl');
    el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
  }
  function highlight() {
    s.highlighted = true;
    highlightEl(kioskBox.querySelector(`[data-kid="${CSS.escape(currentTargetId())}"]`));
  }

  /* ---------- 남은 시간 (실제 화면 단계만) ---------- */
  const timeLimit = mode === 'real' ? sc.timeLimit || 0 : 0;
  let remaining = timeLimit;
  let timeoutOpen = false;
  let timeoutLeft = 0;
  let timerId = null;

  function renderTimer() {
    kioskBox.querySelectorAll('[data-timer]').forEach((el) => {
      el.textContent = `${remaining}초`;
      el.classList.toggle('is-low', remaining <= 10);
    });
  }
  function resetTimer() {
    if (!timeLimit) return;
    remaining = timeLimit;
    renderTimer();
  }
  function tick() {
    if (s.finished) return;
    if (timeoutOpen) {
      timeoutLeft -= 1;
      const el = screenEl.querySelector('[data-timeout-left]');
      if (el) el.textContent = timeoutLeft;
      if (timeoutLeft <= 0) restartFromTimeout();
      return;
    }
    if (s.busy) return; // 결제 중 같은 기다리기 단계에서는 멈춰요
    remaining -= 1;
    renderTimer();
    if (remaining <= 0) openTimeout();
  }
  if (timeLimit) timerId = setInterval(tick, 1000);

  // 실제 키오스크처럼: 시간이 다 되면 "계속하시겠습니까?" 창
  function openTimeout() {
    timeoutOpen = true;
    timeoutLeft = TIMEOUT_WAIT;
    const box = document.createElement('div');
    box.className = 'rk-timeout';
    box.innerHTML = `
      <div class="rk-timeout-box" role="alertdialog" aria-label="시간 초과">
        <div class="rk-timeout-icon" aria-hidden="true">⏰</div>
        <strong>${esc(sc.timeoutTitle || '이용 시간이 초과되었습니다')}</strong>
        <p>계속 진행하시겠습니까?<br><b data-timeout-left>${TIMEOUT_WAIT}</b>초 후 처음 화면으로 돌아갑니다.</p>
        <div class="rk-timeout-btns">
          <button type="button" data-kid="__restart" data-label="처음으로">처음으로</button>
          <button type="button" class="is-primary" data-kid="__continue" data-label="계속하기">계속하기</button>
        </div>
      </div>`;
    screenEl.appendChild(box);
    voice.playWrong();
    say(
      "⏰ 시간이 다 되면 실제 기계도 이렇게 물어봐요. 이어서 하려면 '계속하기'를 눌러요.",
      '시간이 다 되어서 창이 떴어요. 이어서 하려면 창 아래 오른쪽의 계속하기를 누르세요.',
      'hint'
    );
    highlightEl(box.querySelector('[data-kid="__continue"]'));
  }
  function closeTimeout() {
    timeoutOpen = false;
    screenEl.querySelector('.rk-timeout')?.remove();
    clearHighlight();
  }
  function continueAfterTimeout() {
    closeTimeout();
    resetTimer();
    showToast('시간이 다시 늘어났어요', 'good', 1200);
    const st = steps[s.i];
    say(st.guide, st.voice || st.guide);
    if (mode === 'learn' || s.highlighted) highlight();
  }
  function restartFromTimeout() {
    closeTimeout();
    s.mistakes += 1;
    s.i = 0;
    s.fields = {};
    s.busy = true;
    screenEl.innerHTML = renderScreen(sc, steps[0].screen, { fields: s.fields });
    resetTimer();
    say(
      '⏰ 시간이 지나 처음 화면으로 돌아갔어요. 실제 기계도 이렇게 돼요. 처음부터 다시 해봐요!',
      '시간이 지나 처음 화면으로 돌아갔어요. 실제 기계도 이렇게 돼요. 처음부터 다시 해봐요.',
      'hint'
    );
    later(enterStep, 3000);
  }

  /* ---------- 단계 시작 ---------- */
  function enterStep() {
    const st = steps[s.i];
    s.wrong = 0;
    s.typed = '';
    s.highlighted = false;
    s.busy = false;
    if (st.input) s.fields[st.input.display] = '';

    screenEl.innerHTML = renderScreen(sc, st.screen, { fields: s.fields });
    // 기계 몸체 장치는 다시 그리지 않으니, 지난 단계의 표시(초록 테두리 등)를 지워요.
    kioskBox.querySelectorAll('.rk-hw [data-kid]').forEach((el) => el.classList.remove('k-ok', 'k-shake', 'k-press'));
    kioskBox.classList.toggle('hw-card-in', !!st.hardware?.card);
    kioskBox.classList.toggle('hw-paper', !!st.hardware?.paper);
    renderTimer();
    $('.progress-text').textContent = `모두 ${total}개 중 ${s.i + 1}번째`;
    $('.progress-bar').style.width = `${(s.i / total) * 100}%`;
    $('.progress').setAttribute('aria-valuenow', s.i);

    // 기다리기 단계 (예: 결제 중) : 누를 것 없이 잠시 뒤 다음으로
    if (st.wait) {
      s.busy = true;
      say(`⏳ ${st.guide}`, st.voice || st.guide, 'guide');
      later(() => {
        s.i += 1;
        if (s.i >= total) finish();
        else enterStep();
      }, st.wait);
      return;
    }

    if (mode === 'test') {
      const missionText = `🎯 할 일: ${sc.mission}`;
      if (s.i === 0) {
        say(missionText, `혼자 해보기예요. 할 일은, ${sc.mission} 막히면 도움말 버튼을 누르세요.`, 'mission');
      } else {
        guideText.innerHTML = formatGuide(missionText);
        guideBox.dataset.kind = 'mission';
        lastSpoken = `할 일은, ${sc.mission}`;
      }
      return;
    }

    const spoken = st.voice || st.guide;
    say(st.guide, s.i === 0 ? `이번 연습은, ${sc.mission} ${spoken}` : spoken);
    if (mode === 'learn') highlight();
  }

  /* ---------- 버튼을 눌렀을 때 ---------- */
  function onTap(id, label, el) {
    if (s.finished) return;

    if (timeoutOpen) {
      if (id === '__continue') continueAfterTimeout();
      else if (id === '__restart') restartFromTimeout();
      return;
    }
    if (s.busy) return;
    resetTimer(); // 실제 기계처럼 화면을 누르면 남은 시간이 다시 처음으로
    const st = steps[s.i];

    // 숫자판 입력 단계
    if (st.input) {
      const need = st.input.value[s.typed.length];
      if (id === `key-${need}`) {
        s.typed += need;
        s.fields[st.input.display] = s.typed;
        const d = screenEl.querySelector(`[data-display="${CSS.escape(st.input.display)}"]`);
        if (d) {
          d.innerHTML = digitsHTML(s.typed, Number(d.dataset.length), {
            dash: Number(d.dataset.dash) || 0, mask: d.dataset.mask, prefix: d.dataset.prefix,
          });
        }
        voice.playTap();
        voice.vibrate(15);
        pressEffect(el);
        if (s.typed.length === st.input.value.length) return success(el);
        voice.speak(DIGIT_READ[need]);
        if (s.highlighted) highlight();
        return;
      }
      return wrong(id, label, el, `지금은 숫자 ${josa(need, '을/를')} 누를 차례예요.`);
    }

    if ([].concat(st.target).includes(id)) success(el);
    else wrong(id, label, el);
  }

  function pressEffect(el) {
    if (!el) return;
    el.classList.remove('k-press');
    void el.offsetWidth; // 애니메이션 다시 시작
    el.classList.add('k-press');
  }

  function success(el) {
    s.busy = true;
    clearHighlight();
    el?.classList.add('k-ok');
    voice.playCorrect();
    voice.vibrate(30);
    if (mode !== 'test') showToast(`✔ ${PRAISE[Math.floor(Math.random() * PRAISE.length)]}`, 'good', 900);
    later(() => {
      s.i += 1;
      if (s.i >= total) finish();
      else enterStep();
    }, 750);
  }

  function wrong(id, label, el, inputHelp) {
    s.wrong += 1;
    s.mistakes += 1;
    voice.playWrong();
    voice.vibrate([60, 40, 60]);
    if (el) {
      el.classList.remove('k-shake');
      void el.offsetWidth;
      el.classList.add('k-shake');
    }

    const st = steps[s.i];
    let touched = '';
    if (id === '__backdrop') touched = '창 바깥을 누르셨어요. 가운데 뜬 창 안에서 골라야 해요. ';
    // 잘못 누른 버튼 이름은 “ ”로 감싸요. (' '로 감싸면 노란 형광펜이 칠해져 정답처럼 보여요)
    else if (label) touched = `“${label}”${josa(label, '을/를').slice(label.length)} 누르셨어요. `;

    // 실전: 두 번까지는 짧게만 알려주고, 세 번째부터 자세히 도와줘요.
    if (mode === 'test' && s.wrong < 3) {
      showToast('다시 한번 찾아보세요', 'bad', 1400);
      voice.speak('다시 한번 찾아보세요.');
      return;
    }

    const help = inputHelp || (mode === 'test' ? st.guide : st.hint || st.guide);
    const helpVoice = inputHelp || (mode === 'test' ? st.voice || st.guide : st.hint || st.voice || st.guide);
    say(`${touched}${help}`, `${touched}${helpVoice}`, 'hint');

    // 배우기·실전(3번째부터)은 바로, 연습하기·실제 화면은 2번 틀리면 반짝여요.
    if (mode === 'learn' || mode === 'test' || s.wrong >= 2) highlight();
  }

  function showHint() {
    if (s.finished || s.busy || timeoutOpen) return;
    const st = steps[s.i];
    s.hints += 1;
    const extra = st.input ? ` 지금은 숫자 ${josa(st.input.value[s.typed.length], '을/를')} 누를 차례예요.` : '';
    const text = mode === 'test' ? st.guide : st.hint || st.guide;
    const spoken = mode === 'test' ? st.voice || st.guide : st.hint || st.voice || st.guide;
    say(`💡 ${text}${extra}`, `${spoken}${extra}`, 'hint');
    highlight();
  }

  function finish() {
    s.finished = true;
    clearInterval(timerId);
    $('.progress-bar').style.width = '100%';
    const time = Math.max(1, Math.round((Date.now() - s.startedAt) / 1000));
    voice.playFinish();
    say('🎉 모두 끝났어요!', '모두 끝났어요!', 'good');
    later(() => handlers.onFinish({ time, mistakes: s.mistakes, hints: s.hints }), 1300);
  }

  /* ---------- 이벤트 연결 ---------- */
  kioskBox.addEventListener('click', (e) => {
    if (e.target.closest('[data-backdrop]')) return onTap('__backdrop', null, null);
    const el = e.target.closest('[data-kid]');
    if (el && kioskBox.contains(el)) onTap(el.dataset.kid, el.dataset.label, el);
  });

  root.querySelector('[data-act="exit"]').addEventListener('click', () => handlers.onExit());
  root.querySelector('[data-act="hint"]').addEventListener('click', showHint);
  root.querySelector('[data-act="replay"]').addEventListener('click', () => voice.speak(lastSpoken));

  enterStep();

  return {
    destroy() {
      s.finished = true;
      clearInterval(timerId);
      timers.forEach(clearTimeout);
      voice.stopSpeaking();
    },
  };
}
