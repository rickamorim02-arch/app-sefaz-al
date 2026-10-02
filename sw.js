const CACHE='sefaz-al-offline-v49';
const CORE=[
 './','./index.html','./manifest.webmanifest','./questoes.json','./reading-data.json',
 './study.js','./study-open-fix.js','./study-cycle-plan.js','./reading.js','./notes.js',
 './offline.js','./backup.js','./cycle-timer.js','./cycle-navigator.js','./tablet.css'
];
self.addEventListener('install',e=>{
 self.skipWaiting();
 e.waitUntil(caches.open(CACHE).then(async c=>{
   for(const url of CORE){try{const r=await fetch(url,{cache:'reload'});if(r.ok)await c.put(url,r.clone())}catch(_){}}
 }));
});
self.addEventListener('activate',e=>e.waitUntil(
 caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())
));
self.addEventListener('message',e=>{
 if(e.data&&e.data.type==='PREPARE_OFFLINE'){
   e.waitUntil(caches.open(CACHE).then(async c=>{
     let ok=0,fail=[];
     for(const url of CORE){try{const r=await fetch(url,{cache:'reload'});if(!r.ok)throw new Error(String(r.status));await c.put(url,r.clone());ok++}catch(err){fail.push(url)}}
     if(e.source)e.source.postMessage({type:'OFFLINE_READY',ok,fail,total:CORE.length});
   }));
 }
});
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 const u=new URL(e.request.url);if(u.origin!==location.origin)return;
 const dynamic=/\.(?:js|css|json)$/i.test(u.pathname);
 if(e.request.mode==='navigate'){
   e.respondWith(fetch(e.request,{cache:'no-store'}).then(r=>{const x=r.clone();caches.open(CACHE).then(c=>c.put('./index.html',x));return r}).catch(()=>caches.match('./index.html')));return;
 }
 if(dynamic){
   e.respondWith(fetch(e.request,{cache:'no-store'}).then(r=>{if(r&&r.ok){const x=r.clone();caches.open(CACHE).then(c=>c.put(e.request,x))}return r}).catch(()=>caches.match(e.request).then(hit=>hit||caches.match(u.pathname.replace(/^\/app-sefaz-al\//,'./')))));return;
 }
 e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(r=>{if(r&&r.ok){const x=r.clone();caches.open(CACHE).then(c=>c.put(e.request,x))}return r})));
});