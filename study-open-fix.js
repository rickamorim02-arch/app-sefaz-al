(function(){
  const KEY='sefaz-al-study-open-groups-v1';
  function loadOpen(){try{return JSON.parse(sessionStorage.getItem(KEY)||'[]')}catch(e){return []}}
  function saveOpen(){
    const open=[];
    document.querySelectorAll('#studyList details.studyGroup').forEach((d,i)=>{if(d.open)open.push(i)});
    sessionStorage.setItem(KEY,JSON.stringify(open));
  }
  function restoreOpen(){
    const open=loadOpen();
    document.querySelectorAll('#studyList details.studyGroup').forEach((d,i)=>{d.open=open.includes(i)});
  }
  function patch(){
    if(typeof window.studyCycle!=='function'||typeof window.openStudy!=='function')return false;
    if(window.__studyOpenFix)return true;
    window.__studyOpenFix=true;
    const oldCycle=window.studyCycle;
    window.studyCycle=function(si,li){saveOpen();oldCycle(si,li);requestAnimationFrame(restoreOpen)};
    const root=document.getElementById('studyList');
    if(root){
      root.addEventListener('toggle',function(e){if(e.target&&e.target.matches('details.studyGroup'))saveOpen()},true);
      const mo=new MutationObserver(()=>requestAnimationFrame(restoreOpen));
      mo.observe(root,{childList:true});
    }
    return true;
  }
  let tries=0;const t=setInterval(()=>{tries++;if(patch()||tries>100)clearInterval(t)},50);
})();