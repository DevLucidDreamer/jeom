/*
 * 서비스 워커: 앱 파일을 휴대폰에 저장해 두고, 인터넷이 없어도 앱이 열리게 해 줘요.
 *
 * ⚠️ 파일을 새로 추가하면 아래 FILES 목록에도 넣어 주세요.
 * ⚠️ 앱을 고친 뒤 배포할 때는 CACHE 이름의 숫자를 올려 주세요. (v1 → v2)
 */
const CACHE = 'ieum-v3';

const FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/style.css',
  './js/app.js',
  './js/engine.js',
  './js/kiosk.js',
  './js/speech.js',
  './js/store.js',
  './js/ui.js',
  './scenarios/index.js',
  './scenarios/burger.js',
  './scenarios/burger-real.js',
  './scenarios/cafe.js',
  './scenarios/cafe-real.js',
  './scenarios/hospital.js',
  './scenarios/hospital-real.js',
  './icons/favicon-48.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
];

// 설치될 때: 파일을 모두 저장
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(FILES)).then(() => self.skipWaiting())
  );
});

// 새 버전이 켜질 때: 예전 버전 저장소 지우기
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// 파일 요청: 인터넷이 되면 최신 파일을 받고(그리고 저장), 안 되면 저장해 둔 파일을 써요.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  event.respondWith(
    // no-cache: 브라우저 임시 저장본 대신 서버에 '바뀐 게 있는지' 꼭 물어봐요. (고친 내용이 바로 보이게)
    fetch(req, { cache: 'no-cache' })
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy));
        }
        return res;
      })
      .catch(async () => {
        const cached = await caches.match(req, { ignoreSearch: true });
        if (cached) return cached;
        if (req.mode === 'navigate') return caches.match('./index.html');
        return Response.error();
      })
  );
});
