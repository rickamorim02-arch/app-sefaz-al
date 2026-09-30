(function(){
const PLAN=[
['Ciência de Dados','Teoria + Treino P3','02:00',['Inteligência Artificial e Ciência de Dados']],
['Reforma Tributária - 227','Teoria + Treino P3','02:00',['Reforma (LC nº 2272026)']],
['Auditoria Fiscal','Prática SPED + Treino P3','02:00',['Auditoria Fiscal']],
['Finanças Públicas','LRF/Orçamento + Treino P3','02:00',['Finanças Públicas (Orçamento + LRF)']],
['Inteligência Artificial','','01:30',['Inteligência Artificial e Ciência de Dados']],
['Direito Tributário','','01:30',['Direito Tributário']],
['Desenvolvimento de Sistemas','','01:30',['Desenvolvimento de Sistemas']],
['Legislação Tributária Estadual (LTE)','','01:30',['LTE 1','LTE 2']],
['Ciência de Dados','Questões & Resolução Cebraspe','01:30',['Inteligência Artificial e Ciência de Dados']],
['Reforma Tributária','Análise da EC 132/CGIBS','01:30',['Reforma (EC nº 1322023 e LC nº 2142025)']],
['Estatística e Probabilidade','','01:30',['Estatística e Probabilidade']],
['Economia','','01:30',['Economia + Finanças Públicas']],
['Infraestrutura de TIC e Segurança','','01:30',['Segurança da Informação e Redes','Governança de TI']],
['Direito Constitucional','','01:00',['Direito Constitucional']],
['Contabilidade Pública','','01:30',['Contabilidade Pública']],
['Direito Administrativo','','01:00',['Direito Administrativo']],
['Auditoria Fiscal','Cruzamento de Documentos','01:30',['Auditoria Fiscal']],
['Finanças Públicas','Questões Cebraspe','01:30',['Finanças Públicas (Orçamento + LRF)']],
['Matemática Financeira','','01:00',['Matemática Financeira']],
['Legislação Tributária Estadual','Leis Específicas','01:00',['LTE 1','LTE 2']],
['Contabilidade Geral','','01:00',['Contabilidade Geral']],
['Reforma Tributária / Finanças','Elaboração P3','01:00',['Reforma (EC nº 1322023 e LC nº 2142025)','Reforma (LC nº 2272026)','Finanças Públicas (Orçamento + LRF)']]
];
const KEY='sefaz-al-cycle-plan-v1', STUDYKEY='sefaz-al-study-v1';
function state(){try{return JSON.parse(localStorage.getItem(KEY)||'{"pos":0,"done":{}}')}catch(e){return {pos:0,done:{}}}}
function save(s){localStorage.setItem(KEY,JSON.stringify(s))}
function progress(){try{return JSON.parse(localStorage.getItem(STUDYKEY)||'{}')}catch(e){return {}}}
function groups(){return (typeof STUDY!=='undefined'?STUDY:(window.STUDY||[]))}
function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
function lessonRows(subjects){let gs=groups(),x=progress(),rows=[];subjects.forEach(name=>{let si=gs.findIndex(g=>g.subject===name);if(si<0)return;gs[si].lessons.forEach((l,li)=>{let v=Number(x[si+'-'+li]||0),lab=v===2?'✅ Concluída':v===1?'🟡 Estudando':'⬜ Não iniciada';rows.push('<button class="studyLesson s'+v+'" onclick="window.studyCycle('+si+','+li+');setTimeout(window.renderStudyCyclePlan,0)"><span>'+esc(l)+'</span><small>'+lab+'</small></button>')})});return rows.join('')||'<small>Nenhuma aula vinculada.</small>'}
function renderPlan(){const host=document.getElementById('studyCyclePlan');if(!host)return;const s=state(),pos=Math.max(0,Math.min(s.pos||0,PLAN.length-1));let totalMin=PLAN.reduce((a,p)=>{let [h,m]=p[2].split(':').map(Number);return a+h*60+m},0);host.innerHTML='<div class="card"><b>🔄 Ciclo oficial — 22 blocos</b><p>As aulas agora ficam dentro de cada bloco. Toque no bloco para abrir ou fechar.</p><p><b>Carga do ciclo:</b> '+Math.floor(totalMin/60)+'h'+String(totalMin%60).padStart(2,'0')+'</p></div>'+PLAN.map((p,i)=>{const active=i===pos,done=!!s.done[i];return '<details class="card cycleBlock" '+(active?'open':'')+' style="border-color:'+(active?'#ffd52e':'#24517c')+'"><summary style="cursor:pointer"><div style="display:flex;justify-content:space-between;gap:8px"><b>Bloco '+String(i+1).padStart(2,'0')+' '+(active?'▶️':'')+'</b><b>'+p[2]+'</b></div><div>'+esc(p[0])+'</div>'+(p[1]?'<small>'+esc(p[1])+'</small>':'')+'</summary><div style="margin-top:10px">'+lessonRows(p[3])+'</div><div style="margin-top:8px">'+(done?'✅ Bloco concluído':'⬜ Pendente')+'</div>'+(active?'<button class="primary" style="margin-top:8px" onclick="event.preventDefault();window.completeStudyBlock()">Concluir bloco e avançar</button>':'')+'</details>'}).join('')}
window.renderStudyCyclePlan=renderPlan;
window.completeStudyBlock=function(){let s=state(),i=s.pos||0;s.done[i]=true;s.pos=(i+1)%PLAN.length;if(s.pos===0)s.done={};save(s);renderPlan();window.scrollTo(0,0)};
function inject(){const study=document.getElementById('study');if(!study)return false;let box=document.getElementById('studyCyclePlan');if(!box){box=document.createElement('div');box.id='studyCyclePlan';let list=document.getElementById('studyList');study.insertBefore(box,list);if(list)list.style.display='none';let title=study.querySelector('h2');if(title)title.textContent='📚 Ciclo de Estudos';let p=title&&title.nextElementSibling;if(p)p.textContent='Siga os 22 blocos do cronograma. A relação de aulas está dentro de cada bloco.'}renderPlan();return true}
let n=0,t=setInterval(()=>{n++;if(inject()||n>100)clearInterval(t)},50);
})();