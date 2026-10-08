(function(){const KEY='sefazVoiceRecordings_v1',DEVICE_KEY='sefazDeviceCode_v1';let rec=null,parts=[],stream=null,timer=null,started=0;const $=id=>document.getElementById(id);function deviceCode(){let x=localStorage.getItem(DEVICE_KEY);if(!x){let a=new Uint8Array(16);crypto.getRandomValues(a);x='SFZ-'+Array.from(a,b=>b.toString(16).padStart(2,'0')).join('').toUpperCase();localStorage.setItem(DEVICE_KEY,x)}return x}function saved(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch(e){return[]}}function cleanLegacyAudio(){try{let a=saved(),changed=false;a=a.map(x=>{if(x&&typeof x.audio==='string'&&x.audio.startsWith('data:')){let y={...x};delete y.audio;y.status=y.status==='salvo no SEFAZ-AL'?'áudio legado removido do SEFAZ-AL':y.status;changed=true;return y}return x});if(a.length>100){a=a.slice(0,100);changed=true}if(changed)localStorage.setItem(KEY,JSON.stringify(a))}catch(_){}}function persist(a){try{localStorage.setItem(KEY,JSON.stringify(a));return true}catch(e){return false}}function fmt(ms){let s=Math.max(0,Math.floor(ms/1000)),m=Math.floor(s/60);return String(m).padStart(2,'0')+':'+String(s%60).padStart(2,'0')}function toast(text){let x=$('voiceToast');if(!x)return;x.textContent=text;x.classList.add('show');clearTimeout(x._t);x._t=setTimeout(()=>x.classList.remove('show'),2600)}function setIdle(){let b=$('voiceFloat'),c=$('voiceClock');if(b){b.textContent='🎙️';b.classList.remove('recording')}if(c)c.textContent=''}function init(){if($('voiceFloat'))return;let b=document.createElement('button');b.id='voiceFloat';b.type='button';b.textContent='🎙️';b.title='Gravar áudio • '+deviceCode();b.onclick=toggle;let c=document.createElement('div');c.id='voiceClock';let t=document.createElement('div');t.id='voiceToast';document.body.append(b,c,t);let more=$('more');if(more&&!$('voiceDeviceCard')){let d=document.createElement('div');d.id='voiceDeviceCard';d.className='card';d.innerHTML='<h3>🔐 Código do aparelho</h3><p>Use este mesmo código no Livro por Voz para receber somente os áudios deste aparelho.</p><div style="font-size:20px;font-weight:900;letter-spacing:1px;margin:10px 0">'+deviceCode()+'</div><button class="primary" id="copyDeviceCode">Copiar código</button>';more.prepend(d);$('copyDeviceCode').onclick=async()=>{try{await navigator.clipboard.writeText(deviceCode());toast('Código copiado.')}catch(_){prompt('Copie o código:',deviceCode())}}}let st=document.createElement('style');st.textContent='#voiceFloat{position:fixed;right:14px;bottom:78px;z-index:95;width:54px;height:54px;border:0;border-radius:50%;background:#ffd52e;color:#07182e;font-size:25px;box-shadow:0 5px 18px #0008}#voiceFloat.recording{background:#d93025;color:#fff;animation:vPulse 1.1s infinite}#voiceClock{position:fixed;right:74px;bottom:92px;z-index:95;color:#fff;background:#07182eee;border:1px solid #24517c;border-radius:10px;padding:6px 9px;font:700 13px system-ui;min-width:58px;text-align:center}#voiceClock:empty{display:none}#voiceToast{position:fixed;z-index:100;left:50%;bottom:145px;transform:translate(-50%,12px);max-width:84vw;background:#07182e;color:#fff;border:1px solid #24517c;border-radius:12px;padding:9px 12px;font:600 12px system-ui;opacity:0;pointer-events:none;transition:.18s}#voiceToast.show{opacity:1;transform:translate(-50%,0)}@keyframes vPulse{50%{transform:scale(1.08)}}';document.head.appendChild(st)}async function toData(blob){return await new Promise((ok,no)=>{let r=new FileReader();r.onload=()=>ok(r.result);r.onerror=no;r.readAsDataURL(blob)})}function context(){let card=document.querySelector('#feed .q[data-id]'),id=card?.dataset?.id||'',q=(window.st?.qs||[]).find(x=>String(x.id)===String(id));let read=(()=>{try{return JSON.parse(localStorage.getItem('sefaz-reading-last-v2')||'null')}catch(_){return null}})();return{questionId:id,subject:q?.s||read?.subject||'',lesson:(window.sefazQuestionLesson&&q?window.sefazQuestionLesson(q):'')||q?.t||read?.lesson||''}}const INBOX='https://livro-por-voz.vercel.app/api/inbox';
const QDB='sefazVoiceQueue_v1',QSTORE='pending';
function qdb(){return new Promise((ok,no)=>{let r=indexedDB.open(QDB,1);r.onupgradeneeded=()=>{let d=r.result;if(!d.objectStoreNames.contains(QSTORE))d.createObjectStore(QSTORE,{keyPath:'id'})};r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)})}
async function queuePut(item,blob){let d=await qdb();return new Promise((ok,no)=>{let tx=d.transaction(QSTORE,'readwrite');tx.objectStore(QSTORE).put({id:String(item.id),item,blob,queuedAt:Date.now()});tx.oncomplete=()=>{d.close();ok(true)};tx.onerror=()=>{d.close();no(tx.error)}})}
async function queueDel(id){let d=await qdb();return new Promise((ok,no)=>{let tx=d.transaction(QSTORE,'readwrite');tx.objectStore(QSTORE).delete(String(id));tx.oncomplete=()=>{d.close();ok(true)};tx.onerror=()=>{d.close();no(tx.error)}})}
async function queueAll(){let d=await qdb();return new Promise((ok,no)=>{let tx=d.transaction(QSTORE,'readonly'),r=tx.objectStore(QSTORE).getAll();r.onsuccess=()=>ok(r.result||[]);r.onerror=()=>no(r.error);tx.oncomplete=()=>d.close()})}
let flushing=false;
async function flushQueue(){if(flushing||!navigator.onLine)return;flushing=true;try{let all=await queueAll();for(const q of all){if(!navigator.onLine)break;let sent=await sendBackground(q.item,q.blob,false);if(sent){await queueDel(q.id);mark(q.id,'enviado ao Livro por Voz')}}}catch(e){console.warn('Fila de áudio indisponível',e)}finally{flushing=false}}

function mark(id,status){let a=saved(),x=a.find(r=>String(r.id)===String(id));if(x){x.status=status;persist(a)}}
async function sendBackground(item,blob,storeOnFail=true){
  try{
    const h={'Content-Type':blob.type||item.type||'audio/webm','X-SEFAZ-ID':String(item.id),'X-SEFAZ-CREATED':item.created||'','X-SEFAZ-DURATION':String(item.duration||0),'X-SEFAZ-SUBJECT':item.meta?.subject||'','X-SEFAZ-LESSON':item.meta?.lesson||'','X-SEFAZ-QUESTION':item.meta?.questionId||'','X-DEVICE-CODE':deviceCode()};
    const r=await fetch(INBOX,{method:'POST',headers:h,body:blob});
    if(!r.ok)throw new Error('HTTP '+r.status);
    mark(item.id,'enviado ao Livro por Voz');
    try{await queueDel(item.id)}catch(_){}
    toast('✓ Áudio enviado ao Livro por Voz.');
    return true;
  }catch(e){
    if(storeOnFail){try{await queuePut(item,blob);mark(item.id,'aguardando internet');toast('📴 Áudio guardado neste aparelho. Enviarei quando a internet voltar.')}catch(_){mark(item.id,'falha ao salvar áudio offline');toast('⚠️ Não foi possível guardar o áudio para envio.')}}
    return false
  }
}
async function retry(item){toast('Este áudio antigo precisa ser reenviado a partir da gravação original.');return false}
async function keep(blob,duration){
  let item={id:Date.now(),created:new Date().toISOString(),duration,type:blob.type||'audio/webm',meta:context(),status:'enviando ao Livro por Voz'};
  let a=saved();a.unshift(item);if(a.length>100)a.length=100;
  persist(a);
  window.dispatchEvent(new CustomEvent('sefazVoiceReady',{detail:{blob,record:item}}));
  toast('✓ Gravação concluída ('+fmt(duration)+'). Enviando…');
  await sendBackground(item,blob);
}
let starting=false,stopping=false;
async function toggle(){
  const b=$('voiceFloat');
  if(starting||stopping)return;
  if(rec&&rec.state==='recording'){
    stopping=true;
    clearInterval(timer);timer=null;
    if(b){b.disabled=true;b.textContent='⌛'}
    toast('Finalizando gravação…');
    try{const active=rec;active.stop();if(stream)stream.getTracks().forEach(t=>t.stop());setTimeout(()=>{if(stopping&&rec===active){stopping=false;rec=null;setIdle();if(b)b.disabled=false;toast('Gravação interrompida; não foi possível finalizar o arquivo.')}},2500)}catch(e){if(stream)stream.getTracks().forEach(t=>t.stop());stopping=false;rec=null;setIdle();if(b)b.disabled=false;toast('Falha ao finalizar gravação.')}
    return;
  }
  starting=true;if(b)b.disabled=true;
  let nextStream=null;
  try{
    nextStream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}});
    stream=nextStream;parts=[];
    const activeRec=new MediaRecorder(nextStream);
    rec=activeRec;started=Date.now();
    activeRec.ondataavailable=e=>{if(e.data&&e.data.size)parts.push(e.data)};
    activeRec.onstop=async()=>{
      clearInterval(timer);timer=null;
      const duration=Date.now()-started;
      nextStream.getTracks().forEach(t=>t.stop());
      if(stream===nextStream)stream=null;
      const blob=new Blob(parts,{type:activeRec.mimeType||'audio/webm'});
      parts=[];if(rec===activeRec)rec=null;
      stopping=false;setIdle();if(b)b.disabled=false;
      if(blob.size)await keep(blob,duration);else toast('⚠️ A gravação ficou vazia.');
    };
    activeRec.onerror=()=>{try{activeRec.stop()}catch(_){}};
    activeRec.start(500);
    if(b){b.textContent='⏹';b.classList.add('recording');b.disabled=false}
    $('voiceClock').textContent='🔴 00:00';
    timer=setInterval(()=>$('voiceClock').textContent='🔴 '+fmt(Date.now()-started),250);
    toast('🔴 Gravando. Toque novamente para parar.');
  }catch(e){
    nextStream?.getTracks().forEach(t=>t.stop());
    rec=null;stream=null;stopping=false;setIdle();if(b)b.disabled=false;
    toast('Não foi possível acessar o microfone.');
  }finally{starting=false}
}
cleanLegacyAudio();window.addEventListener('online',flushQueue);setTimeout(flushQueue,1200);if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();window.sefazVoiceRecordings=()=>saved();window.sefazDeviceCode=()=>deviceCode();window.sendSefazVoiceToLivro=id=>{let x=saved().find(r=>String(r.id)===String(id));return x?retry(x):false};})();