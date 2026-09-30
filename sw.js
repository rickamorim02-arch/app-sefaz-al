const C='sefaz-al-v26-controle-estudos';
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(['./','./index.html','./manifest.webmanifest','./study.js']))) });
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.mode==='navigate'||u.pathname.endsWith('/index.html')||u.pathname.endsWith('/app-sefaz-al/')){
    e.respondWith(fetch(e.request).then(async r=>{
      let text=await r.clone().text();
      if(!text.includes('study.js')) text=text.replace('</body>','<script src="study.js?v=26"></script></body>');
      let out=new Response(text,{status:r.status,statusText:r.statusText,headers:{'Content-Type':'text/html; charset=utf-8'}});
      caches.open(C).then(c=>c.put(e.request,out.clone()));return out;
    }).catch(()=>caches.match(e.request)));
    return;
  }
  e.respondWith(fetch(e.request).then(r=>{let x=r.clone();caches.open(C).then(c=>c.put(e.request,x));return r}).catch(()=>caches.match(e.request)));
});