/* Sons para Estudo — sintese local via Web Audio, sem arquivos externos. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const MODES=[
{id:'brown',name:'Brown Noise',use:'Questões e concentração prolongada',kind:'noise'},
{id:'white',name:'White Noise',use:'Questões em ambientes barulhentos',kind:'noise'},
{id:'rain',name:'Chuva suave',use:'Leitura de PDFs e legislação',kind:'noise'},
{id:'piano',name:'Piano instrumental',use:'Revisão e leitura moderada',kind:'music'},
{id:'lofi',name:'Lo-fi instrumental',use:'Questões e revisões',kind:'music'},
{id:'ambient',name:'Ambient suave',use:'Leitura prolongada',kind:'music'}
];
let ctx=null,master=null,nodes=[],timer=null,interval=null,current=null,pausedByMic=false,endsAt=0,seconds=0;
const saved=(()=>{try{return JSON.parse(localStorage.getItem('sefazStudySoundV1')||'{}')}catch{return{}}})();
const persist=()=>{try{localStorage.setItem('sefazStudySoundV1',JSON.stringify({volume:parseFloat($('studyVolume')?.value||'20'),mode:current||saved.mode||'brown'}))}catch{}};
function clearNodes(){if(interval){clearInterval(interval);interval=null}for(const n of nodes){try{n.stop?.()}catch{}try{n.disconnect?.()}catch{}}nodes=[]}
function stop(reset=true){clearNodes();if(master)master.gain.setTargetAtTime(0,ctx.currentTime,.025);if(reset)current=null;draw()}
function add(n){nodes.push(n);return n}
function bufferNoise(kind){
 const rate=ctx.sampleRate,b=ctx.createBuffer(1,rate*4,rate),a=b.getChannelData(0);let last=0;
 for(let i=0;i<a.length;i++){let w=Math.random()*2-1;if(kind==='brown'){last=(last+.018*w)/1.00015;a[i]=Math.max(-1,Math.min(1,last*3.2))}else if(kind==='rain'){last=.985*last+.015*w;a[i]=(w-last)*.20}else a[i]=w*.27}
 return b
}
function noise(kind){let src=add(ctx.createBufferSource());src.buffer=bufferNoise(kind);src.loop=true;
 let filter=add(ctx.createBiquadFilter());filter.type=kind==='rain'?'lowpass':'lowpass';filter.frequency.value=kind==='rain'?2100:kind==='brown'?850:12000;
 src.connect(filter);filter.connect(master);src.start()}
function note(freq,start,dur,voice='sine',gain=.08){
 const osc=add(ctx.createOscillator()),env=add(ctx.createGain());
 osc.type=voice;osc.frequency.setValueAtTime(freq,start);env.gain.setValueAtTime(.0001,start);
 env.gain.exponentialRampToValueAtTime(gain,start+.025);
 env.gain.exponentialRampToValueAtTime(.0001,start+dur);
 osc.connect(env);env.connect(master);osc.start(start);osc.stop(start+dur+.04)
}
function music(kind){
 const tones=kind==='piano'?[261.63,329.63,392,523.25,440,392,329.63,293.66]:kind==='lofi'?[174.61,220,261.63,329.63,261.63,220,196,174.61]:[130.81,164.81,196,261.63];
 let step=0;const schedule=()=>{
 if(!ctx||!current||current!==kind)return;
 const now=ctx.currentTime+.03;
 if(kind==='ambient'){tones.forEach((f,i)=>note(f,now+i*.1,4.7,'sine',.018));}
 else {for(let i=0;i<4;i++){const f=tones[(step+i)%tones.length];note(f,now+i*(kind==='piano'?.57:.43),kind==='piano'?1.2:.65,kind==='piano'?'sine':'triangle',kind==='piano'?.052:.04)}step=(step+4)%tones.length}
 };
 schedule();interval=setInterval(schedule,kind==='ambient'?4400:kind==='piano'?2300:1750)
}
async function play(id,auto=false){
 if(window.sefazLivroRecording){pausedByMic=true;return}
 try{
 if(!ctx){ctx=new (window.AudioContext||window.webkitAudioContext)();master=ctx.createGain();master.connect(ctx.destination)}
 await ctx.resume();clearNodes();master.gain.cancelScheduledValues(ctx.currentTime);master.gain.setValueAtTime(0,ctx.currentTime);
 master.gain.setTargetAtTime((parseFloat($('studyVolume').value)||0)/100,ctx.currentTime,.05);
 current=id;pausedByMic=false;
 if(['brown','white','rain'].includes(id))noise(id);else music(id);
 persist();draw();
 }catch(e){$('studySoundStatus').textContent='Não foi possível iniciar o áudio: '+e.message}
}
function draw(){const status=$('studySoundStatus');if(!status)return;
 const mode=MODES.find(m=>m.id===current);
 status.textContent=pausedByMic?'Som pausado durante a gravação do Livro.':mode?'Tocando: '+mode.name:'Nenhum som tocando.';
 document.querySelectorAll('[data-study-sound]').forEach(b=>{const active=b.dataset.studySound===current;b.textContent=active?'⏸ Pausar':'▶ Tocar';b.setAttribute('aria-pressed',String(active))});
 $('studyStop').disabled=!current&&!pausedByMic;
}
function pauseForRecording(){if(current){saved.pausedMode=current;pausedByMic=true;stop(false);draw()}}
function resumeAfterRecording(){if(pausedByMic){pausedByMic=false;const id=saved.pausedMode||current;current=null;if(id)play(id,true);else draw()}}
function init(){
 const root=$('studySoundList');if(!root)return;
 root.innerHTML=MODES.map(m=>'<div class="card study-sound-row"><div><strong>'+m.name+'</strong><p class="muted">'+m.use+'</p></div><button type="button" data-study-sound="'+m.id+'">▶ Tocar</button></div>').join('');
 root.querySelectorAll('[data-study-sound]').forEach(b=>b.onclick=()=>{if(current===b.dataset.studySound){stop();pausedByMic=false}else play(b.dataset.studySound)});
 $('studyVolume').value=Number.isFinite(+saved.volume)?saved.volume:20;
 $('studyVolume').oninput=()=>{if(master&&ctx)master.gain.setTargetAtTime(+$('studyVolume').value/100,ctx.currentTime,.03);persist()};
 $('studyStop').onclick=()=>{pausedByMic=false;stop()};
 $('studyTimer').onchange=()=>{clearTimeout(timer);timer=null;const min=+$('studyTimer').value;if(min){timer=setTimeout(()=>{stop();$('studySoundStatus').textContent='Temporizador concluído.';$('studyTimer').value='0'},min*60000)}};
 window.addEventListener('sefaz-livro-recording-start',pauseForRecording);
 window.addEventListener('sefaz-livro-recording-end',resumeAfterRecording);
 window.addEventListener('pagehide',()=>{clearNodes();if(ctx)ctx.close().catch(()=>{})});
 draw()
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
