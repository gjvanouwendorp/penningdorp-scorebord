const CACHE_NAME = 'scorebord-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/assets/scorebord-64.png',
    '/assets/scorebord-128.png',
    '/assets/scorebord-192.png',
    '/assets/scorebord-256.png',
    '/assets/scorebord-512.png',
    '/assets/morris.png',
    '/assets/ize.png'
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
