const CACHE_NAME = 'scorebord-cache-v1';
const urlsToCache = [
    '/scorebord/',
    '/scorebord/index.html',
    '/scorebord/styles.css',
    '/scorebord/assets/scorebord-64.png',
    '/scorebord/assets/scorebord-128.png',
    '/scorebord/assets/scorebord-192.png',
    '/scorebord/assets/scorebord-256.png',
    '/scorebord/assets/scorebord-512.png',
    '/scorebord/assets/morris.png',
    '/scorebord/assets/ize.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
    );
});
