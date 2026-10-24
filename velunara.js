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
function record(i,kind,id){if(i<0||!id)return;let all=state(),v=all[i]||{shorts:0,boxes:0,lessons:0,seen:{}};v.seen=v.seen||{};let k=kind+':'+id;if(v.seen[k])return;v.seen[k]=1;v[kind]=(v[kind]||0)+1;all[i]=v;store(all);draw()}
function level(p){return Math.min(5,1+Math.floor(p.energy/100))}
function portrait(i){let color=palette[i];return '<span class="vel-portrait" style="--vel-color:'+color+'"><span class="vel-halo"></span><span class="vel-head"></span><span class="vel-hair"></span><span class="vel-body"></span><span class="vel-symbol">'+icons[i]+'</span></span>'}
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
.vel-halo{position:absolute;inset:3px;border:1px solid #ffffffaa;border-radius:50%}
.vel-head{position:absolute;top:13px;left:15px;width:15px;height:19px;background:#e9bd9a;border-radius:45%}
.vel-hair{position:absolute;top:8px;left:10px;width:25px;height:29px;border-radius:50% 50% 35% 35%;border-top:9px solid #302333;border-left:5px solid #302333;border-right:5px solid #302333}
.vel-body{position:absolute;bottom:-11px;left:4px;width:35px;height:34px;background:#ede0c6;border-radius:48% 48% 0 0}
.vel-symbol{position:absolute;bottom:2px;left:12px;font-size:17px}
.vel-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(185px,1fr));gap:10px}.vel-large .vel-portrait{width:54px;height:70px}.vel-large .vel-detail strong{font-size:14px}.vel-large .vel-detail small{font-size:11px}
@media(max-width:480px){#vel-floating{top:72px;right:6px;width:112px}#vel-floating .vel-portrait{width:32px;height:44px}#vel-floating .vel-detail strong{font-size:10px}}
`;document.head.appendChild(css);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',observe);else observe();
})();