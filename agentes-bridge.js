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
  window.addEventListener('message', event => {
    if (event.origin !== allowedOrigin || !event.source || !event.data || event.data.type !== 'SEFAZ_BRIDGE_REQUEST_V1') return;
    if (!confirm('Permitir que o Agentes IA consulte seus acertos e erros dos Shorts nesta sessão?')) return;
    const send = () => {
      if (event.source.closed) return;
      event.source.postMessage({type:'SEFAZ_BRIDGE_DATA_V1', rows:data()}, allowedOrigin);
    };
    send();
    const timer = setInterval(() => { if (event.source.closed) clearInterval(timer); else send(); }, 5000);
  });
})();