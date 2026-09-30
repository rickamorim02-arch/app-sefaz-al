(function(){
/* Novo ciclo: cada bloco representa 5 itens do edital. A ordem intercala matérias e a densidade dos PDFs orienta o avanço das aulas dentro de cada disciplina. */
const PLAN=[
['Ciência de Dados','20 itens • material denso','01:30',['Inteligência Artificial e Ciência de Dados']],
['Reforma Tributária','15 itens • material muito denso','01:30',['Reforma (EC nº 1322023 e LC nº 2142025)','Reforma (LC nº 2272026)']],
['Auditoria Fiscal','15 itens • material concentrado','01:20',['Auditoria Fiscal']],
['Direito Tributário','10 itens • material denso','01:20',['Direito Tributário']],
['Contabilidade Pública','10 itens • material muito denso','01:20',['Contabilidade Pública']],
['Ciência de Dados','20 itens • recorrência 2/4','01:30',['Inteligência Artificial e Ciência de Dados']],
['Finanças Públicas','10 itens • material denso','01:20',['Finanças Públicas (Orçamento + LRF)']],
['Legislação Tributária Estadual','10 itens • LTE 1 + LTE 2','01:20',['LTE 1','LTE 2']],
['Estatística e Probabilidade','10 itens','01:15',['Estatística e Probabilidade']],
['Economia','10 itens • material denso','01:20',['Economia + Finanças Públicas']],
['Inteligência Artificial','10 itens • mesmo pacote IA/CD','01:20',['Inteligência Artificial e Ciência de Dados']],
['Desenvolvimento de Sistemas','10 itens • inclui Engenharia de Software','01:20',['Desenvolvimento de Sistemas','Engenharia de Software']],
['Infraestrutura de TIC e Segurança','10 itens • Segurança, Governança e Forense','01:20',['Segurança da Informação e Redes','Governança de TI','Forense Computacional']],
['Reforma Tributária','15 itens • recorrência 2/3','01:30',['Reforma (EC nº 1322023 e LC nº 2142025)','Reforma (LC nº 2272026)']],
['Auditoria Fiscal','15 itens • recorrência 2/3','01:20',['Auditoria Fiscal']],
['Ciência de Dados','20 itens • recorrência 3/4','01:30',['Inteligência Artificial e Ciência de Dados']],
['Contabilidade Geral','5 itens • material denso','01:10',['Contabilidade Geral']],
['Direito Administrativo','5 itens • material muito denso','01:15',['Direito Administrativo']],
['Contabilidade Pública','10 itens • recorrência 2/2','01:20',['Contabilidade Pública']],
['Direito Tributário','10 itens • recorrência 2/2','01:20',['Direito Tributário']],
['Finanças Públicas','10 itens • recorrência 2/2','01:20',['Finanças Públicas (Orçamento + LRF)']],
['Legislação Tributária Estadual','10 itens • recorrência 2/2','01:20',['LTE 1','LTE 2']],
['Economia','10 itens • recorrência 2/2','01:20',['Economia + Finanças Públicas']],
['Estatística e Probabilidade','10 itens • recorrência 2/2','01:15',['Estatística e Probabilidade']],
['Inteligência Artificial','10 itens • recorrência 2/2','01:20',['Inteligência Artificial e Ciência de Dados']],
['Desenvolvimento de Sistemas','10 itens • recorrência 2/2','01:20',['Desenvolvimento de Sistemas','Engenharia de Software']],
['Infraestrutura de TIC e Segurança','10 itens • recorrência 2/2','01:20',['Segurança da Informação e Redes','Governança de TI','Forense Computacional']],
['Reforma Tributária','15 itens • recorrência 3/3','01:30',['Reforma (EC nº 1322023 e LC nº 2142025)','Reforma (LC nº 2272026)']],
['Auditoria Fiscal','15 itens • recorrência 3/3','01:20',['Auditoria Fiscal']],
['Ciência de Dados','20 itens • recorrência 4/4','01:30',['Inteligência Artificial e Ciência de Dados']],
['Direito Constitucional','5 itens','01:05',['Direito Constitucional']],
['Matemática Financeira','5 itens','01:00',['Matemática Financeira']]
];
const KEY='sefaz-al-cycle-weighted-v1',SK='sefaz-al-study-v1';
function st(){try{return JSON.parse(localStorage.getItem(KEY)||'{"pos":0,"done":{}}')}catch(e){return {pos:0,done:{}}}}
function sp(s){localStorage.setItem(KEY,JSON.stringify(s))}
function lp(){try{return JSON.parse(localStorage.getItem(SK)||'{}')}catch(e){return {}}}
function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
function catalog(){return window.SEFAZ_STUDY||[]}
window.selectCycleLesson=function(si,li,ev){if(ev){ev.preventDefault();ev.stopPropagation()}let x=lp(),k=si+'-'+li,v=Number(x[k]||0);x[k]=(v+1)%3;localStorage.setItem(SK,JSON.stringify(x));render();return false};
function rows(names){let gs=catalog(),x=lp(),r=[];names.forEach(name=>{let si=gs.findIndex(g=>g.subject===name);if(si<0)return;gs[si].lessons.forEach((l,li)=>{let v=Number(x[si+'-'+li]||0),lab=v===2?'✅ Concluída':v===1?'🟡 Estudando':'⬜ Não iniciada';r.push('<button type="button" class="studyLesson s'+v+'" data-si="'+si+'" data-li="'+li+'"><span>'+esc(l)+'</span><small>'+lab+'</small></button>')})});return r.join('')||'<small>Aulas não carregadas.</small>'}
function render(){let h=document.getElementById('studyCyclePlan');if(!h)return;let open=[...h.querySelectorAll('details.cycleBlock')].map((d,i)=>d.open?i:-1).filter(i=>i>=0),s=st(),pos=s.pos||0;h.innerHTML='<div class="card"><b>🔄 Ciclo ponderado — 32 blocos</b><p>O cronograma anterior foi descartado. A frequência segue os 160 itens do edital: cada bloco equivale a 5 itens. A duração e o avanço das aulas consideram a densidade dos materiais. As aulas já concluídas permanecem marcadas nos ciclos seguintes.</p></div>'+PLAN.map((p,i)=>'<details class="card cycleBlock" '+((open.includes(i)||i===pos)?'open':'')+'><summary><b>Bloco '+String(i+1).padStart(2,'0')+(i===pos?' ▶️':'')+' — '+esc(p[0])+'</b><span style="float:right">'+p[2]+'</span><br><small>'+esc(p[1])+'</small></summary><div class="cycleLessons">'+rows(p[3])+'</div><div>'+(s.done[i]?'✅ Bloco concluído':'⬜ Pendente')+'</div>'+(i===pos?'<button type="button" class="primary completeBlock">Concluir bloco e avançar</button>':'')+'</details>').join('');h.querySelectorAll('.studyLesson').forEach(b=>b.addEventListener('click',e=>window.selectCycleLesson(+b.dataset.si,+b.dataset.li,e)));let cb=h.querySelector('.completeBlock');if(cb)cb.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();window.completeStudyBlock()})}
window.renderStudyCyclePlan=render;
window.completeStudyBlock=function(){let s=st(),i=s.pos||0;s.done[i]=true;s.pos=(i+1)%PLAN.length;if(s.pos===0)s.done={};sp(s);render()};
function inject(){let study=document.getElementById('study');if(!study)return false;let box=document.getElementById('studyCyclePlan');if(!box){box=document.createElement('div');box.id='studyCyclePlan';let list=document.getElementById('studyList');study.insertBefore(box,list);if(list)list.style.display='none'}render();return true}
let n=0,t=setInterval(()=>{n++;if(inject()||n>100)clearInterval(t)},50);
})();