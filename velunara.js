(()=>{'use strict';
const names=["Verídara","Calúria","Patrimélia","Codélira","Normélia","Constitúria","Tribélara","Econélia","Arquitélia","Probélia","Tesourélia","Vestíria","Governélia","Sináuria","Almerívia","Almerúvia","Numerélia","Renovélia","Federélia","Ciberélia"],icons=["🔎","⚖️","🏛️","💻","📜","📖","⚖️","🌳","🏗️","📈","💰","🔍","🌐","🧠","📘","📕","🔢","🌱","🤝","🛡️"];
const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const alias=[['auditoria fiscal'],['contabilidade geral'],['contabilidade publica'],['desenvolvimento de sistemas'],['direito administrativo'],['direito constitucional'],['direito tributario'],['economia e financas publicas','economia financas publicas'],['engenharia de software'],['estatistica e probabilidade','estatistica'],['financas publicas'],['forense computacional'],['governanca de ti'],['inteligencia artificial e ciencia de dados','ia e ciencia de dados'],['legislacao tributaria estadual i','lte1'],['legislacao tributaria estadual ii','lte2'],['matematica financeira'],['reforma tributaria ec 132','lc 214'],['reforma tributaria lc 227'],['seguranca da informacao e redes']];
const palette=['#c49a44','#4cbbbd','#647ac9','#8c75d8','#72a887','#b5a3e2','#d3a254','#76b66f','#8ab8d0','#9b9be5','#c8a36c','#5f9fcb','#72b8a6','#9e89e5','#74a4cc','#bd718a','#d2a675','#a4bc75','#76b8a8','#6e9ed8'];
const key='sefaz-velunara-v1';
function subjectIndex(s){let n=normalize(s);if(!n)return -1;for(let i=0;i<alias.length;i++)if(alias[i].some(a=>n===a||n.includes(a)))return i;return -1}
function state(){try{return JSON.parse(localStorage.getItem(key)||'{}')}catch{return {}}}
function store(v){try{localStorage.setItem(key,JSON.stringify(v))}catch{}}
function progress(i){let v=state()[i]||{};return {shorts:v.shorts||0,boxes:v.boxes||0,lessons:v.lessons||0,energy:(v.shorts||0)+10*(v.boxes||0)+20*(v.lessons||0)}}
function react(){let e=document.querySelector('#vel-floating .vel-card');if(!e)return;e.classList.remove('vel-reaction');void e.offsetWidth;e.classList.add('vel-reaction');setTimeout(()=>e.classList.remove('vel-reaction'),1200)}
function record(i,kind,id){if(i<0||!id)return;let all=state(),v=all[i]||{shorts:0,boxes:0,lessons:0,seen:{}};v.seen=v.seen||{};let k=kind+':'+id;if(v.seen[k])return;v.seen[k]=1;v[kind]=(v[kind]||0)+1;all[i]=v;store(all);draw();react()}
function level(p){return Math.min(5,1+Math.floor(p.energy/100))}
function portrait(i){const x=i%5,y=Math.floor(i/5);return '<span class="vel-portrait vel-photo" role="img" aria-label="Retrato de '+names[i]+'" style="background-image:url(./guardias-velunara.jpg);background-size:500% 400%;background-position:'+(x*25)+'% '+(y*100/3)+'%"><span class="vel-eye-glint" aria-hidden="true"></span></span>'}
function card(i,large=false){let p=progress(i),l=level(p);return '<div class="vel-card '+(large?'vel-large':'')+'">'+portrait(i)+'<div class="vel-detail"><strong>'+names[i]+'</strong><small>Nível '+l+' · '+p.energy+' energias</small><div class="vel-meter"><i style="width:'+Math.min(100,p.energy%100)+'%;background:'+palette[i]+'"></i></div>'+(large?'<small>'+p.shorts+' Shorts · '+p.boxes+' caixas · '+p.lessons+' aulas</small>':'')+'</div></div>'}
function active(){let reading=document.getElementById('reading'),feed=document.getElementById('feed');if(reading&&!reading.classList.contains('hidden'))return 'reading';if(feed&&!feed.classList.contains('hidden'))return 'feed';return ''}
function detect(){let a=active();if(a==='feed'){let q=document.querySelector('#feed .q:not([style*="display: none"])');let nodes=[...document.querySelectorAll('#feed .q')];q=nodes.find(e=>{let r=e.getBoundingClientRect();return r.top<innerHeight*.65&&r.bottom>innerHeight*.35})||q;return subjectIndex(q?.querySelector('.tag,.topic')?.textContent||q?.textContent.slice(0,180))}if(a==='reading'){let el=document.querySelector('#readingBody');return subjectIndex((el?.querySelector('h1,h2,h3')?.textContent||'')+' '+(el?.textContent||'').slice(0,220))}return -1}
function draw(){let old=document.getElementById('vel-floating');if(!old){old=document.createElement('aside');old.id='vel-floating';old.setAttribute('aria-label','Guardiã da matéria');document.body.appendChild(old)}let a=active(),i=detect();old.style.display=a&&i>=0?'block':'none';if(i>=0)old.innerHTML=card(i);let garden=document.getElementById('vel-garden');if(!garden){let stats=document.getElementById('stats');if(stats){garden=document.createElement('section');garden.id='vel-garden';garden.className='card';stats.appendChild(garden)}}if(garden&&(!garden.dataset.ready||!document.getElementById('stats')?.classList.contains('hidden'))){garden.innerHTML='<h3>🌿 Jardim de Velúnara</h3><p>As 20 Guardiãs evoluem separadamente conforme suas atividades registradas.</p><div class="vel-grid">'+names.map((_,i)=>card(i,true)).join('')+'</div>';garden.dataset.ready='1'}}
function hideOld(){document.querySelectorAll('#mascot3d,#mascotToggle,[id^="mascot-"]').forEach(e=>e.style.setProperty('display','none','important'))}
function observe(){hideOld();draw()}
let queued=false;function schedule(){if(queued)return;queued=true;setTimeout(()=>{queued=false;observe()},180)}
document.addEventListener('click',e=>{let b=e.target.closest('button');if(!b)return;let q=b.closest('.q');if(q&&b.classList.contains('opt')){let i=subjectIndex(q.querySelector('.tag,.topic')?.textContent||q.textContent.slice(0,180));record(i,'shorts',q.dataset.id||q.id||q.textContent.slice(0,130))}if(active()==='reading'&&/conclu|marcad|caixa/i.test(b.textContent||b.title||'')){let i=detect();if(i>=0)setTimeout(()=>record(i,/conclu/i.test(b.textContent)?'lessons':'boxes',(document.querySelector('#readingBody h2,#readingBody h3')?.textContent||'aula')+':'+b.textContent),350)}schedule()},true);
document.addEventListener('sefaz:navigate',schedule);document.addEventListener('scroll',schedule,true);
window.addEventListener('storage',schedule);setInterval(schedule,3000);
let css=document.createElement('style');css.textContent=`
#mascot3d,#mascotToggle,[id^="mascot-"]{display:none!important}
#vel-floating{position:fixed;top:72px;right:12px;z-index:90;pointer-events:none;width:135px}
.vel-card{display:flex;align-items:center;gap:7px;background:#09233de8;border:1px solid #58748b;border-radius:13px;padding:6px;color:white;min-width:0}
.vel-detail{min-width:0;flex:1}.vel-detail strong{display:block;font-size:11px}.vel-detail small{display:block;font-size:9px;color:#c9d5e4}
.vel-meter{height:5px;border-radius:10px;background:#344759;overflow:hidden;margin:4px 0}.vel-meter i{display:block;height:100%}
.vel-portrait{width:43px;height:58px;flex:none;position:relative;display:block;overflow:hidden;border-radius:21px 21px 8px 8px;background:linear-gradient(140deg,var(--vel-color),#101f37)}
.vel-photo{background-repeat:no-repeat;background-color:#132940;border:1px solid #c9a35a;background-origin:border-box;box-shadow:0 0 7px #a9824c77}
.vel-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(185px,1fr));gap:10px}.vel-large .vel-portrait{width:54px;height:70px}.vel-large .vel-detail strong{font-size:14px}.vel-large .vel-detail small{font-size:11px}
@media(max-width:480px){#vel-floating{top:72px;right:6px;width:112px}#vel-floating .vel-portrait{width:32px;height:44px}#vel-floating .vel-detail strong{font-size:10px}}

/* Velunara V3: expressive presence without distorting the original JPG faces */
.vel-card .vel-expression{position:absolute;top:-2px;right:3px;z-index:6;max-width:118px;opacity:0;transform:translateY(5px) scale(.95);transition:opacity .3s ease,transform .3s ease;pointer-events:none;background:#442036f2;border:1px solid #efb6c8;border-radius:10px;padding:4px 6px;color:#fff0f3;font-size:10px;line-height:1.3;text-align:center;text-shadow:0 1px 3px #240a18}
.vel-card .vel-expression.vel-expression-show{opacity:1;transform:translateY(-16px) scale(1)}
.vel-eye-glint{position:absolute;top:25%;left:22%;width:55%;height:17%;pointer-events:none;border-radius:50%;opacity:0;background:radial-gradient(ellipse at center,#ffecdd70 0%,transparent 65%);animation:vel-gaze 12s ease-in-out infinite}
@keyframes vel-gaze{0%,37%,44%,100%{opacity:0}40%,42%{opacity:.55}}
.vel-card:hover .vel-photo{filter:brightness(1.1) saturate(1.08)}
@media(prefers-reduced-motion:reduce){.vel-eye-glint{animation:none}.vel-card .vel-expression{transition:none}}
/* Velunara V2: sensualidade sofisticada, movimentos leves e sem alterar as fotos */
#vel-floating .vel-photo{transform-origin:50% 88%;animation:vel-breathe 5.8s ease-in-out infinite,vel-sway 11s ease-in-out infinite;will-change:transform}
.vel-large .vel-photo{transform-origin:50% 90%;animation:vel-breathe 6.2s ease-in-out infinite}
.vel-photo{isolation:isolate;transition:filter .5s ease,box-shadow .5s ease}
.vel-photo:after{content:'';position:absolute;inset:0;pointer-events:none;background:linear-gradient(110deg,transparent 28%,rgba(255,224,191,.17) 47%,transparent 65%);background-size:260% 100%;background-position:120% 0;animation:vel-glimmer 9s ease-in-out infinite;border-radius:inherit}
.vel-card{position:relative;overflow:hidden;transition:border-color .35s ease,box-shadow .35s ease}
.vel-card:hover{border-color:#d9a5a4;box-shadow:0 0 13px #bd718a55}
.vel-card.vel-reaction{animation:vel-react .85s ease-out}
.vel-card.vel-reaction .vel-photo{filter:brightness(1.24) saturate(1.18)}
.vel-card.vel-reaction:before{content:'✦  ♡  ✧';position:absolute;inset:0;display:flex;justify-content:center;align-items:flex-start;padding-top:3px;z-index:4;color:#ffd8db;font-size:18px;text-shadow:0 0 8px #f3b5cd;pointer-events:none;animation:vel-spark 1.1s ease-out forwards}
@keyframes vel-breathe{0%,100%{transform:scale(1) rotate(-.6deg)}50%{transform:scale(1.028) rotate(.6deg)}}
@keyframes vel-sway{0%,100%{filter:brightness(1)}50%{filter:brightness(1.07)}}
@keyframes vel-glimmer{0%,66%,100%{background-position:120% 0}83%{background-position:-120% 0}}
@keyframes vel-react{0%,100%{box-shadow:none}40%{box-shadow:0 0 22px #ffb5d6a6}}
@keyframes vel-spark{0%{opacity:0;transform:translateY(12px) scale(.7)}35%{opacity:1}100%{opacity:0;transform:translateY(-35px) scale(1.2)}}
@media(prefers-reduced-motion:reduce){#vel-floating .vel-photo,.vel-large .vel-photo,.vel-photo:after,.vel-card.vel-reaction,.vel-card.vel-reaction:before{animation:none!important}}
`;document.head.appendChild(css);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',observe);else observe();
})();