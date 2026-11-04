// Веб-версия Квитка без интернета (тестировщик 04.11.2026: без связи фото
// не распознавалось, пока модель не скачалась при первом фото).
// При первом открытии с интернетом браузер кладёт к себе всё нужное:
// приложение, движок экрана, распознавание и модель. Дальше Квиток
// открывается и распознаёт без сети. Фото и данные сюда не попадают -
// только файлы самого Квитка. Список и версию подставляет сборка (web.yml).
'use strict';
const VERSION = 'ea7413f';
const CACHE = 'kvitok-' + VERSION;
const FILES = ["assets/AssetManifest.bin", "assets/AssetManifest.bin.json", "assets/FontManifest.json", "assets/assets/fonts/manrope/Manrope-Bold.ttf", "assets/assets/fonts/manrope/Manrope-ExtraBold.ttf", "assets/assets/fonts/manrope/Manrope-Regular.ttf", "assets/assets/fonts/manrope/Manrope-SemiBold.ttf", "assets/assets/tessdata/rus.traineddata", "assets/assets/tessdata_config.json", "assets/fonts/MaterialIcons-Regular.otf", "assets/fonts/fallback/Roboto-Regular.ttf", "assets/packages/flutter_local_notifications_web/web/notifications_service_worker.js", "assets/shaders/ink_sparkle.frag", "assets/shaders/stretch_effect.frag", "canvaskit/canvaskit.js", "canvaskit/canvaskit.wasm", "canvaskit/chromium/canvaskit.js", "canvaskit/chromium/canvaskit.wasm", "favicon.png", "flutter.js", "flutter_bootstrap.js", "icons/Icon-192.png", "icons/Icon-512.png", "icons/Icon-maskable-192.png", "icons/Icon-maskable-512.png", "index.html", "kvitok_ocr.js", "main.dart.js", "manifest.json", "privacy.html", "tess/tesseract-core-lstm.wasm.js", "tess/tesseract-core-simd-lstm.wasm.js", "tess/tesseract.min.js", "tess/worker.min.js", "version.json"];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const k of await caches.keys()) {
      if (k !== CACHE) await caches.delete(k);
    }
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  // Страница - сначала из сети (новая версия), без сети - сохранённая.
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).catch(() => caches.match('index.html', { ignoreSearch: true })
      .then((r) => r || caches.match('./', { ignoreSearch: true }))));
    return;
  }
  // Файлы Квитка - из сохранённых, остальное - из сети с сохранением.
  event.respondWith(caches.open(CACHE).then(async (c) => {
    const hit = await c.match(req, { ignoreSearch: true });
    if (hit) return hit;
    const resp = await fetch(req);
    if (resp.ok && resp.type === 'basic') c.put(req, resp.clone());
    return resp;
  }));
});
