/*
 * 가상 키오스크 화면 그리기.
 *
 * 시나리오 파일(scenarios/*.js)에 적힌 화면 설계도를 실제 버튼과 글자로 바꿔요.
 * 누를 수 있는 것에는 data-kid(버튼 이름표)가 붙고, engine.js 가 이것으로 정답을 확인해요.
 *
 * 1~3단계(쉬운 화면) 부품:
 *   title, text, label, icon, button, row, grid, tabs, list, total,
 *   display, keypad, stepper, cartbar, slot, ticket, spacer
 * 4단계(실제 화면, skin: 'real') 에서 추가로 쓰는 부품:
 *   attract, banner, split, menu, cartpanel, optgroup, itemhead,
 *   stepbar, notice, check, spinner, langbar, arrowdown
 * 자세한 사용법은 README.md 의 '시나리오 만들기'를 보세요.
 */
import { esc } from './ui.js';

const KEYPAD = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'clear'];
const KEY_LABEL = { del: '⌫ 지우기', clear: '전체삭제' };
const LANGS = [
  { id: 'lang-ko', label: '한국어' },
  { id: 'lang-en', label: 'English' },
  { id: 'lang-zh', label: '中文' },
  { id: 'lang-ja', label: '日本語' },
];
const ACCESS = [
  { id: 'acc-big', label: '큰 글씨' },
  { id: 'acc-low', label: '낮은 화면' },
  { id: 'call-staff', label: '🔔 직원 호출' },
];
/** 기계 몸체(화면 밖)에 있는 장치 */
export const HARDWARE = {
  card: { id: 'card-reader', label: '카드 투입구' },
  receipt: { id: 'receipt-slot', label: '영수증 출구' },
};

/** 화면 하나를 HTML 로 만들어요. screen.base 가 있으면 그 화면 위에 팝업 창으로 띄워요. */
export function renderScreen(scenario, screenId, state = { fields: {} }) {
  const screen = scenario.screens[screenId];
  if (!screen) {
    return `<div class="k-layer"><div class="k-body"><p>화면 '${esc(screenId)}'을(를) 찾을 수 없어요.</p></div></div>`;
  }
  if (!screen.base) return layer(scenario, screen, state, false);

  const base = scenario.screens[screen.base];
  return `
    ${layer(scenario, base, state, true)}
    <div class="k-backdrop" data-backdrop></div>
    <div class="k-modal" role="dialog" aria-label="${esc(screen.title || '선택 창')}">
      ${screen.title ? `<div class="k-modal-title">${esc(screen.title)}</div>` : ''}
      <div class="k-modal-body">${elements(screen.layout, state)}</div>
      ${screen.footer ? `<div class="k-modal-foot">${elements(screen.footer, state)}</div>` : ''}
    </div>`;
}

/** 기계 아랫부분. 실제 화면 단계에서는 카드 투입구와 영수증 출구를 누를 수 있어요. */
export function hardwareHTML(scenario) {
  const hw = scenario.hardware || [];
  if (!hw.length) return `<div class="k-hardware" aria-hidden="true"><span></span></div>`;
  return `
    <div class="rk-hw">
      ${hw.includes('card') ? `
        <button type="button" class="rk-reader" data-kid="${HARDWARE.card.id}" data-label="${HARDWARE.card.label}">
          <span class="rk-reader-slot"><span class="rk-reader-card" aria-hidden="true"></span></span>
          <span class="rk-hw-label">IC카드 투입구</span>
        </button>` : ''}
      ${hw.includes('receipt') ? `
        <button type="button" class="rk-printer" data-kid="${HARDWARE.receipt.id}" data-label="${HARDWARE.receipt.label}">
          <span class="rk-printer-slot"><span class="rk-paper" aria-hidden="true"></span></span>
          <span class="rk-hw-label">영수증·번호표 출구</span>
        </button>` : ''}
    </div>`;
}

/** 숫자 입력칸 안쪽 (engine.js 가 숫자를 누를 때마다 다시 그려요) */
export function digitsHTML(value = '', length = 6, { dash = 0, mask = '', prefix = '' } = {}) {
  let html = prefix ? `<span class="k-prefix">${esc(prefix)}</span>` : '';
  for (let i = 0; i < length; i++) {
    if (dash && i === dash) html += '<span class="k-dash">-</span>';
    html += `<span class="k-digit ${value[i] ? 'is-filled' : ''}">${value[i] ? esc(value[i]) : ''}</span>`;
  }
  if (mask) html += `<span class="k-mask">${esc(mask)}</span>`;
  return html;
}

/** 화면 안에서 누를 수 있는 버튼 이름표를 모두 모아요. (시나리오 검사용) */
export function screenIds(scenario, screenId) {
  const ids = new Set();
  const screen = scenario.screens[screenId];
  const walk = (list = []) => list.forEach((e) => {
    if (e.id) ids.add(e.id);
    if (['grid', 'tabs', 'menu', 'optgroup'].includes(e.type)) e.items.forEach((it) => ids.add(it.id));
    if (e.type === 'row') walk(e.items);
    if (e.type === 'split') { e.side.items.forEach((it) => ids.add(it.id)); walk(e.main); }
    if (e.type === 'keypad') KEYPAD.forEach((k) => ids.add(`key-${k}`));
    if (e.type === 'stepper') { ids.add(e.minusId); ids.add(e.plusId); }
    if (e.type === 'cartbar') ids.add(e.button.id);
    if (e.type === 'cartpanel') {
      e.items.forEach((it) => ['minus', 'plus', 'del'].forEach((k) => ids.add(`${it.id}-${k}`)));
      walk(e.buttons);
    }
    if (e.type === 'langbar') [...LANGS, ...ACCESS].forEach((it) => ids.add(it.id));
  });
  if (screen) {
    walk(screen.layout);
    walk(screen.footer);
    if (scenario.skin === 'real' && !screen.noStatus && !screen.base) ids.add('rk-home');
  }
  (scenario.hardware || []).forEach((h) => ids.add(HARDWARE[h].id));
  return ids;
}

/* ---------- 내부 도우미 ---------- */

// 팝업 뒤에 깔린 화면(inert)은 눌리지 않게 이름표를 붙이지 않아요.
function kid(id, label, state) {
  return state.inert ? 'tabindex="-1"' : `data-kid="${esc(id)}" data-label="${esc(label)}"`;
}

function layer(scenario, screen, state, inert) {
  const s = { ...state, inert };
  let head;
  if (scenario.skin === 'real') head = screen.noStatus ? '' : statusBar(scenario, screen, s);
  else head = `<div class="k-head"><span class="k-logo" aria-hidden="true">${scenario.kioskLogo}</span><span>${esc(screen.header || scenario.kioskName)}</span></div>`;

  return `
    <div class="k-layer" ${inert ? 'aria-hidden="true" inert' : ''}>
      ${head}
      <div class="k-body">${elements(screen.layout, s)}</div>
      ${screen.footer ? `<div class="k-footer">${elements(screen.footer, s)}</div>` : ''}
    </div>`;
}

/** 실제 키오스크 맨 위 줄: 가게 이름, 매장/포장 표시, 처음으로, 남은 시간 */
function statusBar(scenario, screen, s) {
  return `
    <div class="rk-status">
      <span class="rk-brand"><span aria-hidden="true">${scenario.kioskLogo}</span> ${esc(scenario.kioskName)}</span>
      ${screen.place ? `<span class="rk-chip">${esc(screen.place)}</span>` : ''}
      <span class="rk-status-right">
        <button type="button" class="rk-home" ${kid('rk-home', '처음으로', s)}>⌂ 처음으로</button>
        ${scenario.timeLimit ? `<span class="rk-timer" data-timer>${scenario.timeLimit}초</span>` : ''}
      </span>
    </div>`;
}

function elements(list = [], state) {
  return list.map((e) => element(e, state)).join('');
}

function button(e, state) {
  const cls = ['k-btn', `k-${e.style || 'default'}`, e.selected ? 'is-selected' : '', e.disabled ? 'is-disabled' : ''].join(' ');
  return `
    <button type="button" class="${cls}" ${kid(e.id, e.label, state)} ${e.selected ? 'aria-pressed="true"' : ''}>
      ${e.icon ? `<span class="k-btn-icon" aria-hidden="true">${e.icon}</span>` : ''}
      <span class="k-btn-label">${esc(e.label)}</span>
      ${e.sub ? `<span class="k-btn-sub">${esc(e.sub)}</span>` : ''}
    </button>`;
}

function badgeClass(text) {
  return /new|신메뉴/i.test(text) ? 'is-new' : '';
}

function element(e, state) {
  switch (e.type) {
    case 'title':
      return `<h3 class="k-title">${esc(e.text)}</h3>`;
    case 'text':
      return `<p class="k-text ${e.small ? 'k-small' : ''}">${esc(e.text)}</p>`;
    case 'label':
      return `<div class="k-section-label">${esc(e.text)}</div>`;
    case 'icon':
      return `<div class="k-icon" aria-hidden="true">${e.text}</div>`;
    case 'spacer':
      return `<div class="k-spacer"></div>`;
    case 'button':
      return button(e, state);
    case 'row':
      return `<div class="k-row">${elements(e.items, state)}</div>`;

    case 'grid':
      return `
        <div class="k-grid" style="--cols:${e.cols || 2}">
          ${e.items.map((it) => `
            <button type="button" class="k-card" ${kid(it.id, it.label, state)}>
              ${it.badge ? `<span class="k-badge">${esc(it.badge)}</span>` : ''}
              <span class="k-card-icon" aria-hidden="true">${it.icon || ''}</span>
              <span class="k-card-label">${esc(it.label)}</span>
              ${it.sub ? `<span class="k-card-sub">${esc(it.sub)}</span>` : ''}
            </button>`).join('')}
        </div>`;

    case 'tabs':
      return `
        <div class="k-tabs" role="tablist">
          ${e.items.map((t) => `
            <button type="button" role="tab" class="k-tab ${t.id === e.active ? 'is-active' : ''}"
              aria-selected="${t.id === e.active}" ${kid(t.id, t.label, state)}>${esc(t.label)}</button>`).join('')}
        </div>`;

    case 'list':
      return `<ul class="k-list">${e.items.map((it) => `<li><span>${esc(it.label)}</span><span>${esc(it.value)}</span></li>`).join('')}</ul>`;

    case 'total':
      return `<div class="k-total"><span>${esc(e.label)}</span><strong>${esc(e.value)}</strong></div>`;

    case 'display': {
      const value = state.fields?.[e.id] || '';
      return `
        <div class="k-display" data-display="${esc(e.id)}" data-length="${e.length}"
          data-dash="${e.dash || 0}" data-mask="${esc(e.mask || '')}" data-prefix="${esc(e.prefix || '')}" aria-live="polite">
          ${digitsHTML(value, e.length, e)}
        </div>
        ${e.placeholder ? `<p class="k-text k-small center">${esc(e.placeholder)}</p>` : ''}`;
    }

    case 'keypad':
      return `
        <div class="k-keypad">
          ${KEYPAD.map((k) => `
            <button type="button" class="k-key ${KEY_LABEL[k] ? 'k-key-fn' : ''}" ${kid(`key-${k}`, KEY_LABEL[k] ? KEY_LABEL[k].replace('⌫ ', '') : k, state)}>${KEY_LABEL[k] || k}</button>`).join('')}
        </div>`;

    case 'stepper':
      return `
        <div class="k-stepper">
          <span class="k-section-label">${esc(e.label)}</span>
          <div class="k-stepper-ctrl">
            <button type="button" class="k-round" ${kid(e.minusId, '빼기(−)', state)} aria-label="수량 줄이기">−</button>
            <span class="k-stepper-val">${esc(e.value)}</span>
            <button type="button" class="k-round" ${kid(e.plusId, '더하기(+)', state)} aria-label="수량 늘리기">+</button>
          </div>
        </div>`;

    case 'cartbar':
      return `
        <div class="k-cartbar">
          <div class="k-cart-text"><span aria-hidden="true">🛒</span> ${esc(e.text)}</div>
          ${button(e.button, state)}
        </div>`;

    case 'slot':
      return `
        <button type="button" class="k-slot" ${kid(e.id, e.label, state)}>
          <span class="k-slot-card" aria-hidden="true">💳</span>
          <span class="k-slot-hole" aria-hidden="true"></span>
          <span class="k-slot-label">${esc(e.label)}</span>
        </button>`;

    case 'ticket':
      return `
        <div class="k-ticket">
          <div class="k-ticket-title">${esc(e.title)}</div>
          <div class="k-ticket-num">${esc(e.number)}</div>
          <p>${esc(e.text)}</p>
        </div>`;

    /* ===== 4단계(실제 화면) 부품 ===== */

    // 대기 화면 광고: 화면 전체가 하나의 큰 버튼
    case 'attract':
      return `
        <button type="button" class="rk-attract" ${kid(e.id, e.cta, state)}>
          ${e.tag ? `<span class="rk-attract-tag">${esc(e.tag)}</span>` : ''}
          <span class="rk-attract-icon" aria-hidden="true">${e.icon}</span>
          <strong>${esc(e.title)}</strong>
          <span>${esc(e.text)}</span>
          <span class="rk-attract-cta">${esc(e.cta)}</span>
        </button>`;

    // 위쪽 광고 띠
    case 'banner':
      return `
        <div class="rk-banner">
          <div class="rk-banner-text">
            ${e.tag ? `<small>${esc(e.tag)}</small>` : ''}
            <strong>${esc(e.title)}</strong>
            <span>${esc(e.text)}</span>
          </div>
          <span class="rk-banner-icon" aria-hidden="true">${e.icon}</span>
        </div>`;

    // 왼쪽 세로 메뉴 분류 + 오른쪽 내용
    case 'split':
      return `
        <div class="rk-split">
          <nav class="rk-side" aria-label="메뉴 분류">
            ${e.side.items.map((t) => `
              <button type="button" class="${t.id === e.side.active ? 'is-active' : ''}" ${kid(t.id, t.label, state)}>${esc(t.label)}</button>`).join('')}
          </nav>
          <div class="rk-main">${elements(e.main, state)}</div>
        </div>`;

    // 실제 같은 메뉴판 (사진 칸, 이름, 가격, BEST/NEW, 품절)
    case 'menu':
      return `
        <div class="rk-menu ${e.compact ? 'is-compact' : ''}" style="--cols:${e.cols || 3}">
          ${e.items.map((it) => `
            <button type="button" class="rk-item ${it.soldout ? 'is-soldout' : ''}" ${kid(it.id, it.label, state)}
              ${it.soldout ? `data-soldout="${esc(typeof it.soldout === 'string' ? it.soldout : 'SOLD OUT')}"` : ''}>
              ${it.badge ? `<span class="rk-badge ${badgeClass(it.badge)}">${esc(it.badge)}</span>` : ''}
              <span class="rk-item-img" aria-hidden="true">${it.icon || ''}</span>
              <span class="rk-item-name">${esc(it.label)}</span>
              ${it.sub ? `<span class="rk-item-sub">${esc(it.sub)}</span>` : ''}
              ${it.price ? `<span class="rk-item-price">${esc(it.price)}</span>` : ''}
            </button>`).join('')}
        </div>`;

    // 아래쪽 주문 내역 (수량 −/+, 삭제 ×, 합계, 버튼)
    case 'cartpanel':
      return `
        <div class="rk-cart">
          <div class="rk-cart-head"><span>주문 내역 (${e.items.length})</span><span>${e.place ? esc(e.place) : ''}</span></div>
          <div class="rk-cart-list">
            ${e.items.length ? e.items.map((it) => `
              <div class="rk-cart-row">
                <span class="rk-cart-name">${esc(it.name)}${it.opts ? `<small>${esc(it.opts)}</small>` : ''}</span>
                <span class="rk-qty">
                  <button type="button" ${kid(`${it.id}-minus`, '수량 빼기(−)', state)} aria-label="수량 줄이기">−</button>
                  <b>${it.qty}</b>
                  <button type="button" ${kid(`${it.id}-plus`, '수량 더하기(+)', state)} aria-label="수량 늘리기">+</button>
                </span>
                <span class="rk-cart-price">${esc(it.price)}</span>
                <button type="button" class="rk-del" ${kid(`${it.id}-del`, '삭제(×)', state)} aria-label="삭제">×</button>
              </div>`).join('') : '<div class="rk-cart-empty">선택한 메뉴가 없습니다</div>'}
          </div>
          <div class="rk-cart-total"><span>총 결제금액</span><strong>${esc(e.total)}</strong></div>
          <div class="rk-cart-btns">${elements(e.buttons, state)}</div>
        </div>`;

    // 옵션 고르기 (필수/선택)
    case 'optgroup':
      return `
        <div class="rk-optgroup">
          <div class="rk-opt-title">${esc(e.title)} ${e.required ? '<em>필수</em>' : '<em class="is-optional">선택</em>'}</div>
          <div class="rk-opts" style="--cols:${e.cols || 3}">
            ${e.items.map((it) => `
              <button type="button" class="rk-opt ${it.selected ? 'is-selected' : ''}" ${kid(it.id, it.label, state)} ${it.selected ? 'aria-pressed="true"' : ''}>
                ${it.icon ? `<span class="rk-opt-icon" aria-hidden="true">${it.icon}</span>` : ''}
                <span>${esc(it.label)}</span>
                ${it.sub ? `<small>${esc(it.sub)}</small>` : ''}
              </button>`).join('')}
          </div>
        </div>`;

    // 옵션 창 맨 위: 메뉴 사진·이름·가격
    case 'itemhead':
      return `
        <div class="rk-itemhead">
          <span class="rk-itemhead-img" aria-hidden="true">${e.icon}</span>
          <span class="rk-itemhead-text"><strong>${esc(e.name)}</strong>${e.desc ? `<small>${esc(e.desc)}</small>` : ''}<b>${esc(e.price)}</b></span>
        </div>`;

    // 진행 단계 표시 (1 장소 > 2 메뉴 > 3 결제)
    case 'stepbar':
      return `
        <div class="rk-stepbar">
          ${e.items.map((t, i) => `<span class="${i === e.current ? 'is-current' : ''} ${i < e.current ? 'is-done' : ''}">${i + 1}. ${esc(t)}</span>`).join('')}
        </div>`;

    // 약관처럼 작은 글씨가 빽빽한 상자
    case 'notice':
      return `<div class="rk-notice">${esc(e.text)}</div>`;

    // 동의 체크 상자
    case 'check':
      return `
        <button type="button" class="rk-check ${e.checked ? 'is-checked' : ''}" ${kid(e.id, e.label, state)} aria-pressed="${!!e.checked}">
          <span class="rk-box" aria-hidden="true">${e.checked ? '✓' : ''}</span><span>${esc(e.label)}</span>
        </button>`;

    // 처리 중 (빙글빙글)
    case 'spinner':
      return `<div class="rk-spinner"><span class="rk-spin" aria-hidden="true"></span><strong>${esc(e.text)}</strong></div>`;

    // 언어 선택, 큰 글씨, 직원 호출
    case 'langbar':
      return `
        <div class="rk-langbar">
          ${LANGS.map((l) => `<button type="button" class="${l.id === 'lang-ko' ? 'is-active' : ''}" ${kid(l.id, l.label, state)}>${l.label}</button>`).join('')}
          <span class="rk-sep" aria-hidden="true"></span>
          ${ACCESS.map((a) => `<button type="button" ${kid(a.id, a.label.replace('🔔 ', ''), state)}>${a.label}</button>`).join('')}
        </div>`;

    // 기계 아래쪽 장치를 가리키는 화살표
    case 'arrowdown':
      return `<div class="rk-arrow"><span aria-hidden="true">▼</span>${esc(e.text)}</div>`;

    default:
      console.warn('알 수 없는 부품 type:', e.type);
      return '';
  }
}
