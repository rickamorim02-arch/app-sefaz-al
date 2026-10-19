(function(){
'use strict';
const URL='https://pdhnsmozkqqsroulocxc.supabase.co',KEY='sb_publishable_obXaIW-V8t2lqAvOl0LKKA_f1OFiWwP';
const AUTH=URL+'/auth/v1',REST=URL+'/rest/v1/sefaz_sync';
const SESSION_KEY='sefaz-sync-session-v1',TRACKED=['sefaz-al-shorts','sefaz-al-notes-v1','sefaz-reading-checked-v1','sefaz-reading-second-v1','sefaz-reading-pins-v1','sefaz-al-fixed-cycle-v1','sefaz-al-study-tasks-v1'];
let session=null,busy=false,timer=null,dirty=false,lastSnapshot='',lastRemote='';
const BACKUP_KEY='sefaz-sync-safety-v1';
const INK_PREFIX='ink:';
const byteSize=v=>new TextEncoder().encode(JSON.stringify(v)).length;
function remoteParts(rows){const remote={};for(const row of rows){if(row.part.startsWith(INK_PREFIX)){remote.ink=remote.ink||{};remote.ink[row.part.slice(INK_PREFIX.length)]=row.payload}else if(row.part==='ink'){remote.ink={...(row.payload||{}),...(remote.ink||{})}}else remote[row.part]=row.payload}return remote}

function el(id){return document.getElementById(id)}
function status(message){if(el('syncStatus'))el('syncStatus').textContent=message}
function headers(token){return {'apikey':KEY,'Authorization':'Bearer '+token,'Content-Type':'application/json'}}
function parse(v,fallback){try{return JSON.parse(v)||fallback}catch(e){return fallback}}
async function safeBackup(data){
 const record={date:new Date().toISOString(),data};
 if(typeof indexedDB!=='undefined'){
  try{await new Promise((resolve,reject)=>{
   const open=indexedDB.open('sefaz-sync-safety',1);
   open.onupgradeneeded=()=>{if(!open.result.objectStoreNames.contains('copies'))open.result.createObjectStore('copies',{keyPath:'id',autoIncrement:true})};
   open.onerror=()=>reject(open.error);
   open.onsuccess=()=>{const db=open.result;const tx=db.transaction('copies','readwrite');const store=tx.objectStore('copies');store.add(record);const keys=store.getAllKeys();keys.onsuccess=()=>{const ids=keys.result||[];for(const id of ids.slice(0,Math.max(0,ids.length-3)))store.delete(id)};tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>{db.close();reject(tx.error)};tx.onabort=()=>{db.close();reject(tx.error)}}
  });return true}catch(e){console.warn('Backup IndexedDB falhou',e)}
 }
 try{const history=parse(localStorage.getItem(BACKUP_KEY),[]);history.push(record);while(history.length>2)history.shift();localStorage.setItem(BACKUP_KEY,JSON.stringify(history));return true}catch(e){console.warn('Backup local falhou',e);return false}
}
function inkData(){const out={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith('sefaz-ink-v2:')){const strokes=parse(localStorage.getItem(k),[]);if(Array.isArray(strokes)&&strokes.length)out[k]=strokes}}return out}
async function localData(){const out={};for(const k of TRACKED){const v=parse(localStorage.getItem(k),k==='sefaz-al-notes-v1'?[]:{});if(k==='sefaz-al-shorts'){const {qs,...progress}=v&&typeof v==='object'&&!Array.isArray(v)?v:{};delete progress.fav;out[k]=progress}else out[k]=v}return out}
function mergeTasks(a,b){const map=new Map();for(const t of [...(Array.isArray(b)?b:[]),...(Array.isArray(a)?a:[])])if(t&&t.id){const old=map.get(t.id);if(!old||String(t.updatedAt||t.completedAt||'')>=String(old.updatedAt||old.completedAt||''))map.set(t.id,t)}return [...map.values()]}
function mergeCycle(a,b){const ah=Array.isArray(a?.history)?a.history:[],bh=Array.isArray(b?.history)?b.history:[];const events=new Map();for(const h of [...bh,...ah])if(h&&Number.isInteger(h.round)&&Number.isInteger(h.step)){const id=h.round+':'+h.step;const prev=events.get(id);if(!prev||String(h.at||'')<String(prev.at||''))events.set(id,h)}const history=[...events.values()].sort((x,y)=>x.round-y.round||x.step-y.step);const round=Math.max(1,Number(a?.round)||1,Number(b?.round)||1);const done=[...new Set([...history.filter(h=>h.round===round).map(h=>h.step),...(Number(a?.round)===round&&Array.isArray(a.done)?a.done:[]),...(Number(b?.round)===round&&Array.isArray(b.done)?b.done:[])])].sort((x,y)=>x-y);return {...b,...a,round,done,history}}
function merge(a,b){const result={...a};for(const k of TRACKED){const x=a[k],y=b[k];if(k==='sefaz-al-study-tasks-v1'){result[k]=mergeTasks(x,y)}else if(k==='sefaz-al-fixed-cycle-v1'){result[k]=mergeCycle(x,y)}else if(k==='sefaz-al-shorts'){const left=x&&typeof x==='object'?x:{},right=y&&typeof y==='object'?y:{};const {qs:discardRemote,...remoteProgress}=right,{qs:discardLocal,...localProgress}=left;result[k]={...remoteProgress,...localProgress,ans:{...(right.ans||{}),...(left.ans||{})}};delete result[k].fav}else if(k==='sefaz-reading-pins-v1'){const merged={...(y||{})};for(const [id,p] of Object.entries(x||{})){const prev=merged[id];if(!prev||String(p.updated||p.created||'')>=String(prev.updated||prev.created||''))merged[id]=p}result[k]=merged}else if(k==='sefaz-al-notes-v1'){const byId=new Map();for(const n of [...(Array.isArray(y)?y:[]),...(Array.isArray(x)?x:[])])if(n&&n.id){const prev=byId.get(n.id);if(!prev||String(n.updated||n.created||'')>=String(prev.updated||prev.created||''))byId.set(n.id,n)}result[k]=[...byId.values()]}else result[k]={...(y||{}),...(x||{})}}const ink={...(b.ink||{})};for(const [key,strokes] of Object.entries(a.ink||{})){if(!Array.isArray(strokes)||!strokes.length)continue;const existing=ink[key];if(!Array.isArray(existing)||!existing.length)ink[key]=strokes;else if(JSON.stringify(existing)!==JSON.stringify(strokes)){const seen=new Set(existing.map(v=>JSON.stringify(v)));ink[key]=existing.concat(strokes.filter(v=>{const id=JSON.stringify(v);if(seen.has(id))return false;seen.add(id);return true}))}}const deletions={};for(const source of [b.inkDeleted||{},a.inkDeleted||{}])for(const [key,values] of Object.entries(source)){const list=new Set(deletions[key]||[]);for(const value of Array.isArray(values)?values:[])list.add(value);deletions[key]=[...list]}
for(const [key,values] of Object.entries(ink)){const removed=new Set(deletions[key]||[]);ink[key]=values.filter(st=>!removed.has(JSON.stringify(st)))}result.ink=ink;result.inkDeleted=deletions;return result}
function authErrorPt(message){
 const raw=String(message||'');const m=raw.toLowerCase();
 if(m.includes('rate limit')||m.includes('too many requests')||m.includes('429')||m.includes('over_email_send_rate_limit'))return 'Limite de envio de e-mails atingido. Aguarde antes de solicitar outra recuperação. Se já recebeu um e-mail, utilize o link mais recente ainda válido.';
 if(m.includes('invalid login credentials'))return 'E-mail ou senha incorretos. Confira os dados ou use Esqueci minha senha.';
 if(m.includes('email not confirmed'))return 'Confirme seu endereço de e-mail antes de entrar.';
 if(m.includes('email address')&&m.includes('invalid'))return 'Endereço de e-mail inválido. Confira o e-mail informado.';
 if(m.includes('token has expired')||m.includes('otp_expired')||m.includes('expired')||m.includes('invalid token'))return 'O link de recuperação expirou ou é inválido. Solicite um novo link quando o envio de e-mails estiver disponível.';
 if(m.includes('weak password')||m.includes('password should'))return 'Senha não aceita. Escolha uma senha mais forte e tente novamente.';
 if(m.includes('user already registered'))return 'Este e-mail já possui cadastro. Use Entrar ou Esqueci minha senha.';
 if(m.includes('failed to fetch')||m.includes('networkerror'))return 'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.';
 return raw||'Não foi possível concluir a operação. Tente novamente.';
}
async function request(url,options={}){const response=await fetch(url,options);let data=await response.json().catch(()=>({}));if(!response.ok)throw Error(authErrorPt(data.msg||data.message||data.error_description||data.error||'Erro HTTP '+response.status));return data}
async function refresh(){if(!session)return false;if(Date.now()/1000 < (session.expires_at||0)-90)return true;const data=await request(AUTH+'/token?grant_type=refresh_token',{method:'POST',headers:{'apikey':KEY,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:session.refresh_token})});session={...data,expires_at:Math.floor(Date.now()/1000)+data.expires_in};localStorage.setItem(SESSION_KEY,JSON.stringify(session));return true}
function updateUI(){const logged=!!session;el('syncLogin').hidden=logged;el('syncLogged').hidden=!logged;if(logged)el('syncUser').textContent=session.user?.email||'Conta conectada'}
async function sync(){if(!session||busy||!navigator.onLine)return;busy=true;let phase='autenticação';status('Sincronizando...');try{await refresh();phase='leitura do servidor';const h=headers(session.access_token);const endpoint=URL+'/rest/v1/sefaz_sync_parts';const local=await localData();const rows=await request(endpoint+'?user_id=eq.'+encodeURIComponent(session.user.id)+'&select=part,payload',{headers:h});const remote=remoteParts(rows);const merged=merge(local,remote);
phase='comparação dos registros';const remoteString=JSON.stringify(TRACKED.map(k=>remote[k])),mergedString=JSON.stringify(TRACKED.map(k=>merged[k]));
// A leitura adicional de updated_at foi retirada para evitar uma segunda consulta pesada.
if(mergedString!==remoteString){phase='backup de segurança';if(!(await safeBackup(local)))throw Error('Backup local indisponível. Sincronização suspensa.');phase='gravação no servidor';const changes=TRACKED.map(part=>[part,merged[part],remote[part]]);for(const [part,payload,previous] of changes){if(JSON.stringify(previous)===JSON.stringify(payload))continue;phase='gravação no servidor ('+part+')';const bytes=byteSize(payload);if(bytes>180000)throw Error('Registro '+part+' possui '+Math.round(bytes/1024)+' KB. Envio suspenso para evitar timeout; dados locais preservados.');await request(endpoint+'?on_conflict=user_id,part',{method:'POST',headers:{...h,Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({user_id:session.user.id,part,payload:payload??{},updated_at:new Date().toISOString()})})}}
phase='aplicação local';if(mergedString!==JSON.stringify(TRACKED.map(k=>local[k]))&&!(await safeBackup(local)))throw Error('Backup local indisponível. Sincronização suspensa.');
for(const k of TRACKED){if(JSON.stringify(local[k])!==JSON.stringify(merged[k])){if(k==='sefaz-al-shorts'){const existing=parse(localStorage.getItem(k),{});localStorage.setItem(k,JSON.stringify({...existing,...merged[k],qs:existing.qs||[],fav:existing.fav||{}}))}else localStorage.setItem(k,JSON.stringify(merged[k]))}}
window.dispatchEvent(new Event('sefaz:sync-pins'));
if(JSON.stringify(local['sefaz-al-shorts'])!==JSON.stringify(merged['sefaz-al-shorts'])&&typeof st!=='undefined'){st.ans=merged['sefaz-al-shorts'].ans||{};if(typeof render==='function')render()}
if(typeof renderNotesPanel==='function'&&!el('notesPanel')?.classList.contains('hidden'))renderNotesPanel();
window.dispatchEvent(new Event('sefaz:sync-reading'));window.dispatchEvent(new Event('sefaz:sync-tasks'));lastSnapshot=JSON.stringify(await localData());dirty=false;status('Sincronizado • '+new Date().toLocaleTimeString('pt-BR'))}
catch(e){console.error('Sincronização falhou em '+phase,e);status('Sincronização pendente ('+phase+'): '+e.message)}finally{busy=false}}
async function login(signup){const email=el('syncEmail').value.trim(),password=el('syncPassword').value;if(!email||!password){status('Informe e-mail e senha.');return}status('Conectando...');try{const data=await request(AUTH+(signup?'/signup':'/token?grant_type=password'),{method:'POST',headers:{'apikey':KEY,'Content-Type':'application/json'},body:JSON.stringify({email,password})});if(!data.access_token){status('Conta criada. Confirme o e-mail recebido e depois entre.');return}session={...data,expires_at:Math.floor(Date.now()/1000)+data.expires_in};localStorage.setItem(SESSION_KEY,JSON.stringify(session));el('syncPassword').value='';updateUI();status('Conectado. Toque em Sincronizar agora para transferir os registros.')}catch(e){status(e.message)}}
async function recoverPassword(){
 const email=el('syncEmail')?.value.trim();
 if(!email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){status('Informe o e-mail cadastrado para recuperar a senha.');el('syncEmail')?.focus();return}
 const button=el('syncRecover');if(button)button.disabled=true;
 status('Solicitando e-mail de recuperação...');
 try{
  await request(AUTH+'/recover',{method:'POST',headers:{'apikey':KEY,'Content-Type':'application/json'},body:JSON.stringify({email})});
  status('Se este e-mail estiver cadastrado, você receberá um link para redefinir a senha. Verifique também o spam. Nenhum dado local foi alterado.');
 }catch(e){status('Recuperação de senha: '+authErrorPt(e.message))}
 finally{if(button)button.disabled=false}
}

// A recuperação do Supabase volta ao aplicativo com credenciais temporárias no fragmento da URL.
// Elas são consumidas apenas para trocar a senha; nunca são gravadas no armazenamento local.
async function handlePasswordRecovery(){
 const hash=new URLSearchParams(location.hash.replace(/^#/,''));
 const query=new URLSearchParams(location.search);
 const type=hash.get('type')||query.get('type');
 const error=hash.get('error_description')||query.get('error_description');
 const access=hash.get('access_token');
 const refreshToken=hash.get('refresh_token');
 const tokenHash=query.get('token_hash')||hash.get('token_hash');
 const code=query.get('code');
 if(type!=='recovery'&&!error&&!tokenHash&&!code)return;
 const clearLink=()=>{try{history.replaceState(null,'',location.pathname)}catch(_){}};
 if(error){clearLink();status('Link de recuperação inválido ou expirado: '+error);return}
 if(type!=='recovery'&&!tokenHash&&!code)return;
 let recoveryToken=access;
 try{
  if(!recoveryToken&&tokenHash){
   const data=await request(AUTH+'/verify',{method:'POST',headers:{'apikey':KEY,'Content-Type':'application/json'},body:JSON.stringify({token_hash:tokenHash,type:'recovery'})});
   recoveryToken=data.access_token;
  }else if(!recoveryToken&&code){
   const data=await request(AUTH+'/token?grant_type=pkce',{method:'POST',headers:{'apikey':KEY,'Content-Type':'application/json'},body:JSON.stringify({auth_code:code,code_verifier:sessionStorage.getItem('sefaz-recovery-code-verifier')||''})});
   recoveryToken=data.access_token;
  }
 }catch(e){clearLink();status('Não foi possível validar o link: '+e.message);return}
 clearLink();
 if(!recoveryToken){status('O link não contém autorização válida para trocar a senha. Solicite outro e-mail.');return}
 const overlay=document.createElement('div');overlay.id='sefazRecoveryOverlay';
 overlay.style.cssText='position:fixed;inset:0;background:#071326ee;z-index:99999;display:flex;align-items:center;justify-content:center;padding:18px';
 const box=document.createElement('section');box.style.cssText='background:#142b47;color:white;padding:24px;border-radius:16px;width:100%;max-width:420px;box-shadow:0 10px 40px #0008';
 const title=document.createElement('h2');title.textContent='Redefinir senha da sincronização';
 const info=document.createElement('p');info.textContent='Crie uma nova senha com pelo menos 8 caracteres. Seus estudos e redações não serão apagados.';
 const input=document.createElement('input');input.type='password';input.placeholder='Nova senha';input.autocomplete='new-password';input.style.cssText='width:100%;margin:8px 0;padding:12px;color:#111;background:#fff';
 const confirm=document.createElement('input');confirm.type='password';confirm.placeholder='Repita a nova senha';confirm.autocomplete='new-password';confirm.style.cssText=input.style.cssText;
 const feedback=document.createElement('p');feedback.setAttribute('role','status');
 const save=document.createElement('button');save.type='button';save.textContent='Salvar nova senha';save.style.cssText='padding:12px;margin-top:10px';
 const cancel=document.createElement('button');cancel.type='button';cancel.textContent='Fechar';cancel.style.cssText='padding:12px;margin-left:8px';
 cancel.onclick=()=>{overlay.remove();status('Redefinição cancelada. Você pode solicitar outro link de recuperação.')};
 save.onclick=async()=>{
  if(input.value.length<8){feedback.textContent='Use pelo menos 8 caracteres.';return}
  if(input.value!==confirm.value){feedback.textContent='As senhas não coincidem.';return}
  save.disabled=true;feedback.textContent='Salvando nova senha...';
  try{
   await request(AUTH+'/user',{method:'PUT',headers:headers(recoveryToken),body:JSON.stringify({password:input.value})});
   input.value='';confirm.value='';feedback.textContent='Senha alterada com sucesso! Entre com seu e-mail e a nova senha na aba Mais → Sincronização.';
   status('Senha redefinida. Entre com sua nova senha. Seus dados locais foram preservados.');
   save.remove();cancel.textContent='Concluir';
  }catch(e){feedback.textContent='Não foi possível alterar a senha: '+e.message}
  finally{save.disabled=false}
 };
 box.append(title,info,input,confirm,save,cancel,feedback);overlay.appendChild(box);document.body.appendChild(overlay);input.focus();
}
function init(){const root=document.createElement('div');root.className='card';root.id='sefazSyncPanel';root.innerHTML='<h3>☁️ Sincronização privada</h3><p>Use a mesma conta no celular e no tablet. Os dados locais permanecem no aparelho.</p><div id="syncLogin"><input id="syncEmail" type="email" autocomplete="username" placeholder="E-mail" style="width:100%;margin-bottom:8px"><input id="syncPassword" type="password" autocomplete="current-password" placeholder="Senha" style="width:100%;margin-bottom:8px"><div style="display:flex;gap:8px;flex-wrap:wrap"><button id="syncEnter" type="button">Entrar</button><button id="syncRegister" type="button">Criar conta</button><button id="syncRecover" type="button">Esqueci minha senha</button></div></div><div id="syncLogged" hidden><p id="syncUser"></p><button id="syncNow" type="button">Sincronizar agora</button> <button id="syncExit" type="button">Sair desta conta</button></div><p id="syncStatus" role="status">Desconectado. A sincronização é manual: entre e toque em Sincronizar agora.</p><small>Sincronização somente pelo botão Sincronizar agora. Transfere respostas, anotações de texto, aulas marcadas e tarefas. Não sincroniza áudios, desenhos da caneta nem marcações gráficas. Em alterações simultâneas, revise os registros antes de continuar.</small>';
const more=el('more');if(!more)return;more.insertBefore(root,more.firstElementChild?.nextSibling||null);
el('syncEnter').onclick=()=>login(false);el('syncRegister').onclick=()=>login(true);el('syncRecover').onclick=recoverPassword;el('syncNow').onclick=sync;el('syncExit').onclick=async()=>{const token=session?.access_token;session=null;localStorage.removeItem(SESSION_KEY);updateUI();status('Desconectado. Dados locais preservados.');if(token)fetch(AUTH+'/logout',{method:'POST',headers:headers(token)}).catch(()=>{})};
session=parse(localStorage.getItem(SESSION_KEY),null);updateUI();handlePasswordRecovery().catch(e=>status('Erro ao abrir recuperação: '+e.message));if(session)status('Conectado. Sincronização manual: toque em Sincronizar agora quando desejar.');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
