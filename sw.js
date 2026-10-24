/* SEFAZ-AL online: retire the former offline service worker without touching localStorage or IndexedDB. */
self.addEventListener('install',event=>{self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{await self.registration.unregister();await self.clients.claim();const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith('sefaz-al-offline-')).map(k=>caches.delete(k)));})())});
self.addEventListener('fetch',event=>{if(event.request.method==='GET')event.respondWith(fetch(event.request,{cache:'no-store'}))});
