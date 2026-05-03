@@ -1,5 +1,4 @@
// sw.js
const CACHE_NAME = 'admin-app-v1';
const CACHE_NAME = 'admin-app-v2';

self.addEventListener('install', (event) => {
  event.waitUntil(
@@ -8,7 +7,8 @@ self.addEventListener('install', (event) => {
        './index.html',
        './style.css',
        './script.js',
        './icon.png'
        './icon-192.png',
        './icon-512.png'
      ]);
    })
  );
