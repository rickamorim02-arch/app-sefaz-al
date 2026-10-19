// Vercel Serverless Function. Set OPENAI_API_KEY in Vercel environment; never in browser.
const ALLOWED = new Set(['https://rickamorim02-arch.github.io','https://sefaz-al-estudos.vercel.app']);
module.exports = async function handler(req,res){
 const origin=req.headers.origin||'';
 if(ALLOWED.has(origin)){res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');}
 res.setHeader('Cache-Control','no-store');
 if(req.method==='OPTIONS'){res.setHeader('Access-Control-Allow-Methods','POST, OPTIONS');res.setHeader('Access-Control-Allow-Headers','Content-Type');return res.status(204).end();}
 if(req.method!=='POST')return res.status(405).json({error:'Método não permitido'});
 if(origin&&!ALLOWED.has(origin))return res.status(403).json({error:'Origem não autorizada'});
 if(!process.env.OPENAI_API_KEY)return res.status(503).json({error:'Correção por IA não configurada no servidor (OPENAI_API_KEY ausente).'});
 const {image,question,modelAnswer,keyPoints,topic}=req.body||{};
 if(typeof image!=='string'||!/^data:image\/(png|jpeg);base64,[a-zA-Z0-9+/=]+$/.test(image)||image.length>4000000)return res.status(400).json({error:'Imagem inválida ou muito grande (limite ~3 MB).'});
 if(typeof question!=='string'||!question.trim()||question.length>12000)return res.status(400).json({error:'Enunciado inválido'});
 const system='Você é corretor pedagógico de discursivas de concurso SEFAZ-AL. Leia o manuscrito diretamente da imagem. Não invente palavras ilegíveis; informe incerteza. Compare estritamente ao enunciado, espelho e pontos fornecidos. Dê nota estimada 0 a 10, não oficial. Responda APENAS JSON válido com chaves: transcricao (string), trechos_ilegíveis (array de strings), nota (number), pontos_atendidos (array de strings), pontos_faltantes (array de strings), comentarios (string), sugestoes (array de strings), confianca_leitura (string: alta, media, baixa). Não revele informações além da avaliação.';
 const user='Tema: '+String(topic||'').slice(0,300)+'\nEnunciado: '+question+'\nEspelho: '+String(modelAnswer||'').slice(0,14000)+'\nPontos essenciais: '+JSON.stringify(keyPoints||[]).slice(0,4000)+'\nAnalise a resposta manuscrita na imagem e devolva o JSON.';
 try{
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),55000);
  let response;
  try{response=await fetch('https://api.openai.com/v1/responses',{method:'POST',signal:controller.signal,headers:{Authorization:'Bearer '+process.env.OPENAI_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.OPENAI_CORRECTION_MODEL||'gpt-4.1-mini',max_output_tokens:1800,input:[{role:'system',content:[{type:'input_text',text:system}]},{role:'user',content:[{type:'input_text',text:user},{type:'input_image',image_url:image}]}]})});}finally{clearTimeout(timer)}
  const payload=await response.json();if(!response.ok)return res.status(502).json({error:'Serviço de IA indisponível ('+response.status+').'});
  const text=(payload.output||[]).flatMap(x=>x.content||[]).filter(x=>x.type==='output_text').map(x=>x.text).join('').trim();
  let parsed;try{parsed=JSON.parse(text.replace(/^\x60\x60\x60(?:json)?\s*/i,'').replace(/\s*\x60\x60\x60$/,''))}catch(_){return res.status(502).json({error:'A IA não retornou uma avaliação estruturada. Tente novamente.'})}
  return res.status(200).json({result:parsed});
 }catch(e){return res.status(502).json({error:'Falha ao processar a folha manuscrita. Tente novamente.'})}
};
