(function(){
/* Ciclo integrado P1/P2/P3. As quatro matérias da discursiva recebem recorrência adicional e blocos próprios de treino P3. */
const PLAN=[
['Ciência de Dados','20 itens objetiva + P3 • prioridade máxima','01:30',['Inteligência Artificial e Ciência de Dados']],
['Direito Tributário','10 itens objetiva • material denso','01:20',['Direito Tributário']],
['Reforma Tributária','15 itens objetiva + P3 • prioridade máxima','01:30',['Reforma (EC nº 1322023 e LC nº 2142025)','Reforma (LC nº 2272026)']],
['Estatística e Probabilidade','10 itens objetiva','01:15',['Estatística e Probabilidade']],
['Auditoria Fiscal','15 itens objetiva + P3 • prioridade máxima','01:30',['Auditoria Fiscal']],
['Contabilidade Pública','10 itens objetiva • material muito denso','01:20',['Contabilidade Pública']],
['Finanças Públicas','10 itens objetiva + P3 • prioridade máxima','01:30',['Finanças Públicas (Orçamento + LRF)']],
['Legislação Tributária Estadual','10 itens objetiva • LTE 1 + LTE 2','01:20',['LTE 1','LTE 2']],
['P3 — Ciência de Dados','Treino discursivo técnico • até 30 linhas','01:00',[], 'disc'],
['Inteligência Artificial','10 itens objetiva • pacote IA/CD','01:20',['Inteligência Artificial e Ciência de Dados']],
['Economia','10 itens objetiva • material denso','01:20',['Economia + Finanças Públicas']],
['Ciência de Dados','Revisão/questões + consolidação para P3','01:30',['Inteligência Artificial e Ciência de Dados']],
['Desenvolvimento de Sistemas','10 itens objetiva • inclui Engenharia de Software','01:20',['Desenvolvimento de Sistemas','Engenharia de Software']],
['Reforma Tributária','Revisão/questões + consolidação para P3','01:30',['Reforma (EC nº 1322023 e LC nº 2142025)','Reforma (LC nº 2272026)']],
['Infraestrutura de TIC e Segurança','10 itens objetiva • Segurança/Governança/Forense','01:20',['Segurança da Informação e Redes','Governança de TI','Forense Computacional']],
['P3 — Auditoria Fiscal','Treino discursivo técnico • até 30 linhas','01:00',[], 'disc'],
['Auditoria Fiscal','Revisão/questões + consolidação para P3','01:30',['Auditoria Fiscal']],
['Contabilidade Geral','5 itens objetiva • material denso','01:10',['Contabilidade Geral']],
['Finanças Públicas','Revisão/questões + consolidação para P3','01:30',['Finanças Públicas (Orçamento + LRF)']],
['Direito Administrativo','5 itens objetiva • material muito denso','01:15',['Direito Administrativo']],
['Ciência de Dados','Terceira passagem • peso objetivo + discursiva','01:30',['Inteligência Artificial e Ciência de Dados']],
['P3 — Finanças Públicas','Treino discursivo técnico • até 30 linhas','01:00',[], 'disc'],
['Direito Constitucional','5 itens objetiva','01:05',['Direito Constitucional']],
['Reforma Tributária','Terceira passagem • peso objetivo + discursiva','01:30',['Reforma (EC nº 1322023 e LC nº 2142025)','Reforma (LC nº 2272026)']],
['Matemática Financeira','5 itens objetiva','01:00',['Matemática Financeira']],
['Auditoria Fiscal','Terceira passagem • peso objetivo + discursiva','01:30',['Auditoria Fiscal']],
['Contabilidade Pública','Segunda passagem','01:20',['Contabilidade Pública']],
['Direito Tributário','Segunda passagem','01:20',['Direito Tributário']],
['P3 — Reforma Tributária','Treino discursivo técnico • até 30 linhas','01:00',[], 'disc'],
['Finanças Públicas','Terceira passagem • peso objetivo + discursiva','01:30',['Finanças Públicas (Orçamento + LRF)']],
['Estatística e Probabilidade','Segunda passagem','01:15',['Estatística e Probabilidade']],
['Economia','Segunda passagem','01:20',['Economia + Finanças Públicas']],
['Inteligência Artificial','Segunda passagem','01:20',['Inteligência Artificial e Ciência de Dados']],
['Desenvolvimento de Sistemas','Segunda passagem','01:20',['Desenvolvimento de Sistemas','Engenharia de Software']],
['Legislação Tributária Estadual','Segunda passagem','01:20',['LTE 1','LTE 2']],
['Infraestrutura de TIC e Segurança','Segunda passagem','01:20',['Segurança da Informação e Redes','Governança de TI','Forense Computacional']],
['Ciência de Dados','Quarta passagem • fechamento do ciclo','01:30',['Inteligência Artificial e Ciência de Dados']],
['P3 — Simulado integrado','4 discursivas: CD + Auditoria + Finanças + Reforma • até 30 linhas cada','02:30',[], 'disc4']
];
const KEY='sefaz-al-cycle-p3-v1',SK='sefaz-al-study-v1';
function st(){try{return JSON.parse(localStorage.getItem(KEY)||'{"pos":0,"done":{}}')}catch(e){return {pos:0,done:{}}}}
function sp(s){localStorage.setItem(KEY,JSON.stringify(s))}
function lp(){try{return JSON.parse(localStorage.getItem(SK)||'{}')}catch(e){return {}}}
function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
function catalog(){return window.SEFAZ_STUDY||[]}
window.selectCycleLesson=function(si,li,ev){if(ev){ev.preventDefault();ev.stopPropagation()}let x=lp(),k=si+'-'+li,v=Number(x[k]||0);x[k]=(v+1)%3;localStorage.setItem(SK,JSON.stringify(x));render();return false};
function rows(names){let gs=catalog(),x=lp(),r=[];names.forEach(name=>{let si=gs.findIndex(g=>g.subject===name);if(si<0)return;gs[si].lessons.forEach((l,li)=>{let v=Number(x[si+'-'+li]||0),lab=v===2?'✅ Concluída':v===1?'🟡 Estudando':'⬜ Não iniciada';r.push('<button type="button" class="studyLesson s'+v+'" data-si="'+si+'" data-li="'+li+'"><span>'+esc(l)+'</span><small>'+lab+'</small></button>')})});return r.join('')}
function discBody(type){return '<div class="card" style="margin-top:10px"><b>✍️ Treino P3</b><p>'+(type==='disc4'?'Faça quatro respostas, uma por matéria, simulando a P3.':'Sorteie um tema da matéria no Treino Discursivo, escreva a resposta antes de consultar o modelo e limite-se a até 30 linhas.')+'</p><small>Após escrever: compare com a resposta-modelo, identifique omissões e registre os pontos que precisam de revisão.</small></div>'}
function render(){let h=document.getElementById('studyCyclePlan');if(!h)return;let open=[...h.querySelectorAll('details.cycleBlock')].map((d,i)=>d.open?i:-1).filter(i=>i>=0),s=st(),pos=s.pos||0;h.innerHTML='<div class="card"><b>🔄 Ciclo integrado objetiva + P3 — 38 blocos</b><p>Ciência de Dados, Auditoria Fiscal, Finanças Públicas e Reforma Tributária recebem recorrência extra porque também compõem a prova discursiva. Há quatro treinos P3 específicos e um simulado integrado ao fim do ciclo. As marcações das aulas permanecem entre ciclos.</p></div>'+PLAN.map((p,i)=>{let body=p[4]?discBody(p[4]):rows(p[3]);return '<details class="card cycleBlock" '+((open.includes(i)||i===pos)?'open':'')+'><summary><b>Bloco '+String(i+1).padStart(2,'0')+(i===pos?' ▶️':'')+' — '+esc(p[0])+'</b><span style="float:right">'+p[2]+'</span><br><small>'+esc(p[1])+'</small></summary><div class="cycleLessons">'+body+'</div><div>'+(s.done[i]?'✅ Bloco concluído':'⬜ Pendente')+'</div>'+(i===pos?'<button type="button" class="primary completeBlock">Concluir bloco e avançar</button>':'')+'</details>'}).join('');h.querySelectorAll('.studyLesson').forEach(b=>b.addEventListener('click',e=>window.selectCycleLesson(+b.dataset.si,+b.dataset.li,e)));let cb=h.querySelector('.completeBlock');if(cb)cb.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();window.completeStudyBlock()})}
window.renderStudyCyclePlan=render;
window.completeStudyBlock=function(){let s=st(),i=s.pos||0;s.done[i]=true;s.pos=(i+1)%PLAN.length;if(s.pos===0)s.done={};sp(s);render()};
function inject(){let study=document.getElementById('study');if(!study)return false;let box=document.getElementById('studyCyclePlan');if(!box){box=document.createElement('div');box.id='studyCyclePlan';let list=document.getElementById('studyList');study.insertBefore(box,list);if(list)list.style.display='none'}render();return true}
let n=0,t=setInterval(()=>{n++;if(inject()||n>100)clearInterval(t)},50);
})();