(function(){
function loadReading(){if(document.getElementById('readingModuleScript'))return;const s=document.createElement('script');s.id='readingModuleScript';s.src='reading.js?v=1';document.body.appendChild(s)}
function initCycleTab(){
 if(document.getElementById('study')){loadReading();return true;}
 const app=document.querySelector('.app'),nav=app&&app.querySelector('nav');if(!app||!nav)return false;
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
 loadReading();return true;
}
let tries=0,t=setInterval(function(){tries++;if(initCycleTab()||tries>120)clearInterval(t)},50);
})();