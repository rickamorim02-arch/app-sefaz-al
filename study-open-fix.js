(function(){
// Compatibilidade do app com o formato saneado v43/v44.
// O banco novo armazena alternativas sem o prefixo "A)"/"B)"; o carregador antigo
// exigia esse prefixo e, por isso, rejeitava o banco e mantinha milhares de questões antigas do localStorage.
window.cleanOptions=function(q){
 const src=Array.isArray(q&&q.o)?q.o:[],out=[],seen={};
 for(let i=0;i<src.length&&i<5;i++){
   const raw=String(src[i]??'').trim(); if(!raw)continue;
   const m=raw.match(/^([A-E])[\)\.\-:]\s*/i);
   const l=m?m[1].toUpperCase():String.fromCharCode(65+i);
   if(seen[l])continue; seen[l]=1;
   out.push({l:l,raw:m?raw:(l+') '+raw)});
 }
 return out;
};
window.validQuestion=function(q){
 if(!q||!String(q.id||'').trim()||!String(q.q||'').trim())return false;
 const txt=String(q.q||'').toLowerCase();
 if(txt.includes('julgue, isoladamente, a seguinte alternativa apresentada no material:'))return false;
 // Normaliza os campos de apresentação sem alterar o conteúdo da questão.
 if(!q.s)q.s=q.source_package_canonical||q.source_package||'SEFAZ-AL';
 if(!q.t)q.t=String(q.source_pdf||'').replace(/_cropped\.pdf$/i,'').replace(/\.pdf$/i,'');
 const opts=window.cleanOptions(q),r=String(q.r||'').trim().charAt(0).toUpperCase();
 return opts.length>=2&&opts.some(o=>o.l===r);
};

function loadReading(){
 if(document.getElementById('readingModuleScript'))return;
 const s=document.createElement('script');
 s.id='readingModuleScript';
 s.src='reading.js?v=3';
 document.body.appendChild(s);
}
function initCycleTab(){
 const app=document.querySelector('.app'),nav=app&&app.querySelector('nav');
 if(!app||!nav)return false;
 loadReading();
 if(document.getElementById('study'))return true;
 const style=document.createElement('style');style.textContent='.cycleBlock summary{cursor:pointer}.cycleLessons{margin-top:10px}.studyLesson{width:100%;display:flex;justify-content:space-between;align-items:center;gap:10px;text-align:left;margin:8px 0;padding:12px;border-radius:12px;border:1px solid #24517c;background:#07182e;color:#fff}.studyLesson span{flex:1}.studyLesson small{white-space:nowrap;color:#aabbd0}.studyLesson.s1{border-color:#ffd52e}.studyLesson.s2{border-color:#43e09d;background:#0d3f35}';document.head.appendChild(style);
 const sec=document.createElement('section');sec.id='study';sec.className='panel hidden';sec.innerHTML='<h2>📚 Ciclo de Estudos</h2><p>Abra um bloco e marque as aulas estudadas. As marcações permanecem nos ciclos seguintes.</p><div id="studyCyclePlan"></div><div id="studyList" style="display:none"></div>';
 app.insertBefore(sec,nav);
 const b=document.createElement('button');b.id='nstudy';b.innerHTML='📚<br>Ciclo';
 b.addEventListener('click',function(){
   document.querySelectorAll('.app>main,.app>section').forEach(e=>e.classList.add('hidden'));
   const ff=document.getElementById('feedFilter');if(ff)ff.classList.add('hidden');
   nav.querySelectorAll('button').forEach(x=>x.classList.remove('on'));
   sec.classList.remove('hidden');b.classList.add('on');
   if(typeof window.renderStudyCyclePlan==='function')window.renderStudyCyclePlan();
   window.scrollTo(0,0);
 });
 nav.insertBefore(b,nav.lastElementChild);
 nav.querySelectorAll('button:not(#nstudy)').forEach(x=>x.addEventListener('click',()=>sec.classList.add('hidden')));
 return true;
}
let tries=0,t=setInterval(function(){tries++;if(initCycleTab()||tries>120)clearInterval(t)},50);
})();