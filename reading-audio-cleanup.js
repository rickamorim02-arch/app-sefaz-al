(()=>{'use strict';
// Migração pontual: remove apenas gravações vinculadas à antiga ferramenta de áudio da Leitura.
// Não toca em desenhos, questões, favoritos, tarefas ou outros bancos.
const FLAG='sefaz-reading-audio-cleanup-v1';
function removeDatabase(name){return new Promise(resolve=>{try{const req=indexedDB.deleteDatabase(name);req.onsuccess=()=>resolve(true);req.onerror=()=>resolve(false);req.onblocked=()=>resolve(false)}catch(_){resolve(false)}})}
async function run(){if(localStorage.getItem(FLAG)==='done')return;const ok=await removeDatabase('sefaz-reading-audio-v1');if(!ok){console.warn('Limpeza do áudio da Leitura pendente: banco ocupado.');return}localStorage.removeItem('sefaz-reading-audio-pins-v1');localStorage.setItem(FLAG,'done');console.info('Áudios antigos da Leitura removidos deste aparelho.')}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
})();