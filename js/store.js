/*
 * 저장소: 설정과 연습 기록을 이 기기(브라우저) 안에만 저장해요.
 * 서버로 보내는 정보는 하나도 없어요.
 */
const KEY_SETTINGS = 'ieum.settings';
const KEY_PROGRESS = 'ieum.progress';

export const DEFAULT_SETTINGS = {
  guide: 'both',     // 안내 방식: 'caption'(자막만) | 'voice'(음성만) | 'both'(둘 다)
  font: 'normal',    // 글씨 크기: 'normal' | 'large' | 'xlarge'
  contrast: false,   // 고대비(검은 바탕, 선명한 색)
  rate: 1,           // 말하기 속도: 0.8 느리게 | 1 보통 | 1.2 빠르게
  sound: true,       // 맞음/틀림 효과음
  vibrate: true,     // 진동 (안드로이드만)
};

// 개인 정보 보호 모드 등에서 저장이 막혀도 앱이 멈추지 않도록 try/catch 로 감싸요.
function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* 저장이 안 돼도 이번 사용에는 문제없어요 */
  }
}

export function hasSettings() {
  return read(KEY_SETTINGS, null) !== null;
}

export function getSettings() {
  return { ...DEFAULT_SETTINGS, ...read(KEY_SETTINGS, {}) };
}

export function saveSettings(settings) {
  write(KEY_SETTINGS, settings);
}

/** { burger: { learn: { count, best: { time, mistakes } }, ... }, ... } */
export function getProgress() {
  return read(KEY_PROGRESS, {});
}

/** 연습 결과를 저장하고, 최고 기록이면 true 를 돌려줘요. (틀린 횟수가 적을수록, 같으면 빠를수록 좋은 기록) */
export function saveResult(scenarioId, mode, result) {
  const progress = getProgress();
  const byScenario = progress[scenarioId] || (progress[scenarioId] = {});
  const prev = byScenario[mode];
  const record = { time: result.time, mistakes: result.mistakes };

  const isBest =
    !prev ||
    record.mistakes < prev.best.mistakes ||
    (record.mistakes === prev.best.mistakes && record.time < prev.best.time);

  byScenario[mode] = {
    count: (prev?.count || 0) + 1,
    best: isBest ? record : prev.best,
  };
  write(KEY_PROGRESS, progress);
  return isBest;
}

export function resetProgress() {
  try {
    localStorage.removeItem(KEY_PROGRESS);
  } catch {
    /* 무시 */
  }
}
