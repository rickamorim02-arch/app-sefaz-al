(function(){'use strict';
const PREFIX='sefaz-ink-v2:',DB='sefaz-ink-storage-v1',STORE='drawings';
let dbPromise;
function db(){if(!dbPromise)dbPromise=new Promise((resolve,reject)=>{const req=indexedDB.open(DB,1);req.onupgradeneeded=()=>req.result.createObjectStore(STORE);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)});return dbPromise}
async function transaction(mode,fn){const database=await db();return new Promise((resolve,reject)=>{const tx=database.transaction(STORE,mode),store=tx.objectStore(STORE);let result;fn(store,v=>{result=v});tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error)})}
async function get(key){return transaction('readonly',(store,set)=>{const q=store.get(key);q.onsuccess=()=>set(q.result)})}
async function put(key,strokes){return transaction('readwrite',store=>store.put(strokes,key))}
async function migrate(){const keys=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith(PREFIX))keys.push(k)}
for(const key of keys){const raw=localStorage.getItem(key);let legacy;try{legacy=JSON.parse(raw)}catch(e){continue}if(!Array.isArray(legacy))continue;const existing=await get(key);if(!Array.isArray(existing)||!existing.length)await put(key,legacy);else if(legacy.length){const seen=new Set(existing.map(x=>JSON.stringify(x)));await put(key,existing.concat(legacy.filter(x=>!seen.has(JSON.stringify(x)))))}localStorage.removeItem(key)}}
async function all(){await migrate();return transaction('readonly',(store,set)=>{const q=store.getAllKeys();q.onsuccess=async()=>{const keys=q.result;const out={};try{for(const key of keys){const strokes=await get(key);if(Array.isArray(strokes)&&strokes.length)out[key]=strokes}set(out)}catch(e){set(out)}}})}
window.sefazInkStore={get:async key=>{await migrate();return(await get(key))||[]},put,all,migrate};
})();