/* Agentes IA: ponte local, somente leitura. */
(function () {
  const allowedOrigin = 'https://agentes-ia-sefaz.vercel.app';
  function data() {
    const raw = JSON.parse(localStorage.getItem('sefaz-al-shorts') || '{}');
    const ans = raw.ans || {};
    const questions = window.st && Array.isArray(window.st.qs) ? window.st.qs : [];
    const byId = new Map(questions.map(q => [String(q.id), q]));
    return Object.entries(ans).map(([id, selected]) => {
      const q = byId.get(String(id));
      if (!q) return null;
      return {id, subject: q.s || 'Geral', topic: q.t || 'Geral', correct: String(selected).trim().toUpperCase() === String(q.r || '').trim().charAt(0).toUpperCase()};
    }).filter(Boolean);
  }
  let authorized = false;
  let activeTimer = null;
  window.addEventListener('message', event => {
    if (event.origin !== allowedOrigin || !event.source || !event.data || event.data.type !== 'SEFAZ_BRIDGE_REQUEST_V1') return;
    if (!authorized) { if (!confirm('Permitir que o Agentes IA consulte seus acertos e erros dos Shorts nesta sessão?')) return; authorized = true; }
    if (activeTimer) { clearInterval(activeTimer); activeTimer = null; }
    const send = () => {
      if (event.source.closed) return;
      event.source.postMessage({type:'SEFAZ_BRIDGE_DATA_V1', rows:data()}, allowedOrigin);
    };
    send();
    activeTimer = setInterval(() => { if (event.source.closed) { clearInterval(activeTimer); activeTimer = null; } else send(); }, 5000);
  });
})();