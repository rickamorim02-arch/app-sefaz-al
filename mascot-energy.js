(()=>{'use strict';
const css=document.createElement('style');css.textContent=`
#mascot3d{--sefaz-energy:0;filter:drop-shadow(0 0 calc(var(--sefaz-energy)*1px) #9c83ff) drop-shadow(0 6px 5px #0008)!important}
#mascot3d .sefaz-energy-core{position:absolute;left:29px;top:55px;width:36px;height:34px;z-index:2;border-radius:50%;background:radial-gradient(circle,#fff,#ffe76c99 28%,#9c78ff55 53%,transparent 76%);opacity:calc(var(--sefaz-energy)/22);pointer-events:none;animation:sefaz-core-pulse 1.5s ease-in-out infinite alternate}
#mascot3d.sefaz-energy-hit .dog{animation:sefaz-energy-jump .55s ease-in-out 2 alternate!important}
#mascot3d .sefaz-energy-meter{position:absolute;bottom:-9px;left:5px;width:83px;height:7px;border-radius:8px;border:1px solid #e0caff;background:#14132c;overflow:hidden}
#mascot3d .sefaz-energy-fill{height:100%;width:0;background:linear-gradient(90deg,#8067ff,#6eeaff,#ffe76c);transition:width .45s}
.sefaz-energy-orb{position:fixed;z-index:2147483001;width:25px;height:25px;pointer-events:none;border-radius:50%;background:radial-gradient(circle at 32% 28%,#fff,#c7efff 28%,#8d70ff 65%,#5b33a8);box-shadow:0 0 19px 7px #a88bff99;transform:translate(-50%,-50%);transition:left .8s cubic-bezier(.2,.7,.25,1),top .8s cubic-bezier(.2,.7,.25,1),opacity .25s}
@keyframes sefaz-core-pulse{to{transform:scale(1.25);filter:brightness(1.6)}}
@keyframes sefaz-energy-jump{to{transform:translateY(-17px) rotateY(18deg)}}
@media(prefers-reduced-motion:reduce){#mascot3d .sefaz-energy-core{animation:none}}
`;document.head.append(css);
function read(k){try{const v=JSON.parse(localStorage.getItem(k)||'{}');return v&&typeof v==='object'?v:{}}catch{return{}}}
function total(){const marks=['sefaz-reading-checked-v1','sefaz-reading-second-v1','sefaz-reading-third-v1'].reduce((n,k)=>n+Object.values(read(k)).filter(Boolean).length,0);let shorts=0;try{const state=window.st;if(state?.ans)shorts=Object.keys(state.ans).length}catch{}return{marks,shorts,points:marks*5+shorts*3}}
function dog(){return document.getElementById('mascot3d')}
function update(){const d=dog();if(!d)return;const t=total(),level=Math.min(100,Math.round(100*(1-Math.exp(-t.points/500))));d.style.setProperty('--sefaz-energy',String(Math.round(2+level*.22)));let fill=d.querySelector('.sefaz-energy-fill');if(!fill){const core=document.createElement('div');core.className='sefaz-energy-core';d.append(core);const meter=document.createElement('div');meter.className='sefaz-energy-meter';meter.innerHTML='<div class="sefaz-energy-fill"></div>';d.append(meter);fill=meter.firstElementChild}fill.style.width=level+'%';d.title='Energia '+level+'% · '+t.shorts+' Shorts · '+t.marks+' marcações na Leitura'}
function animate(source){const d=dog();if(!d||d.classList.contains('off'))return;const end=d.getBoundingClientRect();const targetX=end.left+end.width*.49,targetY=end.top+end.height*.57;const start=source==='shorts'?document.querySelector('#feed .q:not(.hidden) .opt')||document.getElementById('feed'):document.querySelector('.readingLessonCheck:focus')||document.getElementById('reading');const rect=start?.getBoundingClientRect();const x=rect?Math.max(24,Math.min(innerWidth-24,rect.left+Math.min(rect.width*.5,180))):innerWidth*.5;const y=rect?Math.max(25,Math.min(innerHeight-25,rect.top+Math.min(rect.height*.5,180))):innerHeight*.5;for(let i=0;i<5;i++){const orb=document.createElement('span');orb.className='sefaz-energy-orb';orb.style.left=(x+(i-2)*12)+'px';orb.style.top=(y+(i%2)*12)+'px';document.body.append(orb);requestAnimationFrame(()=>requestAnimationFrame(()=>{orb.style.left=targetX+'px';orb.style.top=targetY+'px';orb.style.opacity='.2'}));setTimeout(()=>orb.remove(),1100+i*45)}d.classList.remove('sefaz-energy-hit');void d.offsetWidth;d.classList.add('sefaz-energy-hit');setTimeout(()=>d.classList.remove('sefaz-energy-hit'),1300)}
window.addEventListener('sefaz:mascot-energy',e=>{update();if(e.detail?.positive)animate(e.detail?.source)});
window.addEventListener('sefaz:navigate',update);window.addEventListener('storage',update);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',update);else update();
setTimeout(update,1800);
})();