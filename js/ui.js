/*
 * 여러 화면에서 같이 쓰는 작은 도구들: 알림(토스트), 확인 창, 글자 처리.
 */

/** HTML 특수문자를 안전하게 바꿔요. */
export function esc(text) {
  return String(text ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/**
 * 한국어 조사 붙이기. josa('포장하기', '을/를') → '포장하기를'
 * 받침이 있으면 앞의 것, 없으면 뒤의 것을 붙여요.
 */
export function josa(word, pair) {
  const [withBatchim, withoutBatchim] = pair.split('/');
  const chars = String(word).match(/[가-힣0-9a-zA-Z]/g);
  const last = chars ? chars[chars.length - 1] : '';
  let has = false;
  if (/[가-힣]/.test(last)) {
    const jong = (last.charCodeAt(0) - 0xac00) % 28;
    has = pair === '으로/로' ? jong !== 0 && jong !== 8 : jong !== 0; // 'ㄹ' 받침은 '로'
  } else if (/[0-9]/.test(last)) {
    has = '013678'.includes(last); // 영 일 삼 육 칠 팔 → 받침 있음
  } else if (/[a-zA-Z]/.test(last)) {
    has = /[lmn]/i.test(last);
  }
  return word + (has ? withBatchim : withoutBatchim);
}

/** 초 → '1분 5초' */
export function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  if (m === 0) return `${s}초`;
  return s === 0 ? `${m}분` : `${m}분 ${s}초`;
}

/* ---------- 토스트 알림 ---------- */
let toastTimer = null;

/** kind: 'good' | 'bad' | 'info' */
export function showToast(text, kind = 'info', ms = 1600) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = text;
  el.dataset.kind = kind;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), ms);
}

/* ---------- 확인 창 ---------- */
let pendingResolve = null;

export function closeDialog(result = false) {
  const root = document.getElementById('dialog-root');
  if (root) root.innerHTML = '';
  if (pendingResolve) {
    const resolve = pendingResolve;
    pendingResolve = null;
    resolve(result);
  }
}

/**
 * 예/아니오 확인 창. 결과는 true(확인) / false(취소).
 * cancel 을 null 로 주면 버튼이 하나인 안내 창이 돼요.
 */
export function confirmDialog({ title, text = '', html = '', ok = '확인', cancel = '취소', danger = false }) {
  closeDialog(false);
  const root = document.getElementById('dialog-root');
  root.innerHTML = `
    <div class="dlg-backdrop">
      <div class="dlg" role="alertdialog" aria-modal="true" aria-labelledby="dlg-title">
        <h2 id="dlg-title">${esc(title)}</h2>
        ${text ? `<p>${esc(text)}</p>` : ''}
        ${html}
        <div class="dlg-actions">
          ${cancel ? `<button class="btn btn-outline" data-result="0">${esc(cancel)}</button>` : ''}
          <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-result="1">${esc(ok)}</button>
        </div>
      </div>
    </div>`;

  return new Promise((resolve) => {
    pendingResolve = resolve;
    root.querySelectorAll('[data-result]').forEach((btn) => {
      btn.addEventListener('click', () => closeDialog(btn.dataset.result === '1'));
    });
    root.querySelector('[data-result="1"]').focus();
  });
}
