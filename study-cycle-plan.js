(function(){
const PLAN=[
['Ciência de Dados','Teoria + Treino P3','02:00'],
['Reforma Tributária - 227','Teoria + Treino P3','02:00'],
['Auditoria Fiscal','Prática SPED + Treino P3','02:00'],
['Finanças Públicas','LRF/Orçamento + Treino P3','02:00'],
['Inteligência Artificial','','01:30'],
['Direito Tributário','','01:30'],
['Desenvolvimento de Sistemas','','01:30'],
['Legislação Tributária Estadual (LTE)','','01:30'],
['Ciência de Dados','Questões & Resolução Cebraspe','01:30'],
['Reforma Tributária','Análise da EC 132/CGIBS','01:30'],
['Estatística e Probabilidade','','01:30'],
['Economia','','01:30'],
['Infraestrutura de TIC e Segurança','','01:30'],
['Direito Constitucional','','01:00'],
['Contabilidade Pública','','01:30'],
['Direito Administrativo','','01:00'],
['Auditoria Fiscal','Cruzamento de Documentos','01:30'],
['Finanças Públicas','Questões Cebraspe','01:30'],
['Matemática Financeira','','01:00'],
['Legislação Tributária Estadual','Leis Específicas','01:00'],
['Contabilidade Geral','','01:00'],
['Reforma Tributária / Finanças','Elaboração P3','01:00']
];
const KEY='sefaz-al-cycle-plan-v1';
function state(){try{return JSON.parse(localStorage.getItem(KEY)||'{"pos":0,"done":{}}')}catch(e){return {pos:0,done:{}}}}
function save(s){localStorage.setItem(KEY,JSON.stringify(s))}
function renderPlan(){
 const host=document.getElementById('studyCyclePlan'); if(!host)return;
 const s=state(), pos=Math.max(0,Math.min(s.pos||0,PLAN.length-1));
 let totalMin=PLAN.reduce((a,p)=>{let [h,m]=p[2].split(':').map(Number);return a+h*60+m},0);
 host.innerHTML='<div class="card"><b>🔄 Ciclo oficial — 22 blocos</b><p>Avance por blocos, não por dias. Se interromper, retome do bloco em que parou.</p><p><b>Carga do ciclo:</b> '+Math.floor(totalMin/60)+'h'+String(totalMin%60).padStart(2,'0')+'</p></div>'+PLAN.map((p,i)=>{
  const active=i===pos,done=!!s.done[i];
  return '<div class="card" style="border-color:'+(active?'#ffd52e':'#24517c')+'"><div style="display:flex;justify-content:space-between;gap:8px"><b>Bloco '+String(i+1).padStart(2,'0')+' '+(active?'▶️':'')+'</b><b>'+p[2]+'</b></div><div style="margin-top:6px">'+p[0]+'</div>'+(p[1]?'<small style="color:#aabbd0">'+p[1]+'</small>':'')+'<div style="margin-top:8px">'+(done?'✅ Bloco concluído':'⬜ Pendente')+'</div>'+(active?'<button class="primary" style="margin-top:8px" onclick="window.completeStudyBlock()">Concluir bloco e avançar</button>':'')+'</div>';
 }).join('');
}
window.completeStudyBlock=function(){let s=state(),i=s.pos||0;s.done[i]=true;s.pos=(i+1)%PLAN.length;if(s.pos===0)s.done={};save(s);renderPlan();window.scrollTo(0,0)};
function inject(){
 const study=document.getElementById('study'); if(!study||document.getElementById('studyCyclePlan'))return false;
 const box=document.createElement('div');box.id='studyCyclePlan';
 const list=document.getElementById('studyList'); study.insertBefore(box,list);
 const title=study.querySelector('h2');if(title)title.textContent='📚 Ciclo de Estudos';
 const p=title&&title.nextElementSibling;if(p)p.textContent='Siga os 22 blocos do cronograma e use a lista de aulas abaixo para registrar o conteúdo já estudado.';
 renderPlan(); return true;
}
let n=0,t=setInterval(()=>{n++;if(inject()||n>100)clearInterval(t)},50);
})();