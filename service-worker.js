const CACHE_NAME = "sgm-cache-v1";

const urlsToCache = [
  "/",
  "/db.json",
  "/index.html",
  "/style.css",
  "/styles/button.css",
  "/styles/footer.css",
  "/styles/header.css",
  "/styles/main.css",
  "/styles/modal.css",
  "/scripts/App.js",
  "/scripts/DOM.js",
  "/scripts/FileManager.js",
  "/scripts/Listener.js",
  "/scripts/Product.js",
  "/scripts/Stock.js",
  "/scripts/Storage.js",
  "/script.js",
  "/icons/icon-192x192.png",
];

// Instala o Service Worker e armazena no cache os recursos necessários
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Intercepta as requisições de rede e responde com recursos do cache se disponíveis
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// Atualiza o Service Worker e limpa caches antigos
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
