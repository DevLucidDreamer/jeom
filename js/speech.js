/*
 * 소리 담당: 목소리 안내(TTS), 효과음, 진동.
 *
 * 목소리는 브라우저에 들어 있는 '음성 합성(Web Speech API)'을 써요.
 * 인터넷 없이도 되고 무료예요. (기기마다 목소리는 조금씩 달라요)
 */
let settings = { guide: 'both', rate: 1, sound: true, vibrate: true };

const synth = 'speechSynthesis' in window ? window.speechSynthesis : null;
let koVoice = null;
let speakTimer = null;
let audioCtx = null;

/** 설정이 바뀌면 app.js 가 불러줘요. */
export function configure(next) {
  settings = next;
}

/* ---------- 목소리 고르기 ---------- */
function pickVoice() {
  if (!synth) return;
  const ko = synth.getVoices().filter((v) => (v.lang || '').toLowerCase().replace('_', '-').startsWith('ko'));
  // 구글 목소리가 있으면 더 자연스러워서 먼저 골라요.
  koVoice = ko.find((v) => /google/i.test(v.name)) || ko.find((v) => v.localService) || ko[0] || null;
}
if (synth) {
  pickVoice();
  synth.addEventListener?.('voiceschanged', pickVoice);
}

export const speechSupported = () => !!synth;
export const hasKoreanVoice = () => !!koVoice;

/** 이모지는 읽지 않게 빼요. ("👆" → "위를 가리키는 손" 같은 소리 방지) */
function clean(text) {
  return String(text).replace(/[\p{Extended_Pictographic}️‍]/gu, '').replace(/\s+/g, ' ').trim();
}

/**
 * 글을 소리 내어 읽어요.
 * '자막만' 모드에서는 읽지 않아요. force: true 면 모드와 상관없이 읽어요.
 */
export function speak(text, { force = false } = {}) {
  if (!synth) return;
  if (!force && settings.guide === 'caption') return;
  const words = clean(text);
  if (!words) return;

  synth.cancel();
  clearTimeout(speakTimer);
  // 크롬은 cancel() 바로 뒤에 speak() 하면 가끔 무시해서 아주 잠깐 기다려요.
  speakTimer = setTimeout(() => {
    const u = new SpeechSynthesisUtterance(words);
    u.lang = 'ko-KR';
    if (koVoice) u.voice = koVoice;
    u.rate = settings.rate || 1;
    synth.speak(u);
  }, 80);
}

export function stopSpeaking() {
  clearTimeout(speakTimer);
  synth?.cancel();
}

/**
 * 아이폰은 사용자가 화면을 '직접 누른 순간'에 한 번 소리를 내야 그 뒤로 소리가 나와요.
 * 그래서 시작 버튼을 누를 때 이 함수를 불러요.
 */
export function unlockAudio() {
  try {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) audioCtx = new Ctx();
    }
    if (audioCtx?.state === 'suspended') audioCtx.resume();
  } catch {
    /* 효과음이 없어도 앱은 동작해요 */
  }
  if (synth) {
    const u = new SpeechSynthesisUtterance(' ');
    u.volume = 0;
    u.lang = 'ko-KR';
    synth.speak(u);
  }
}

/* ---------- 효과음 (악기 소리를 직접 만들어요) ---------- */
function tone(freq, start, duration, type = 'sine', volume = 0.16) {
  if (!audioCtx) return;
  const t = audioCtx.currentTime + start;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(volume, t + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(t);
  osc.stop(t + duration + 0.05);
}

export function playCorrect() {
  if (!settings.sound) return;
  tone(660, 0, 0.16);
  tone(880, 0.12, 0.22);
}

export function playWrong() {
  if (!settings.sound) return;
  tone(240, 0, 0.28, 'triangle', 0.2);
}

export function playTap() {
  if (!settings.sound) return;
  tone(600, 0, 0.07, 'sine', 0.1);
}

export function playFinish() {
  if (!settings.sound) return;
  [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.13, 0.3));
}

/* ---------- 진동 (안드로이드 휴대폰만 지원) ---------- */
export function vibrate(pattern) {
  // 사용자가 화면을 한 번이라도 직접 누른 뒤에만 진동할 수 있어요 (브라우저 규칙)
  const touched = navigator.userActivation ? navigator.userActivation.hasBeenActive : true;
  if (settings.vibrate && navigator.vibrate && touched) navigator.vibrate(pattern);
}
