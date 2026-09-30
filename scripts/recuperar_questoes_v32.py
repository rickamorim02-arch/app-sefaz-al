import json,re,copy,collections
from pathlib import Path
p=Path('questoes.json'); d=json.loads(p.read_text(encoding='utf-8')); old=d['questions']; TARGET=6000
# Remove apenas caudas editoriais claramente anexadas a alternativas; não reescreve conceitos.
cut=re.compile(r'\s+(?:Comentários?|Comentário|Gabarito\s*[:\-]|\d+\s+SEFAZ-AL\s*\()',re.I)
visual=re.compile(r'\b(figura|gráfico|imagem|quadro acima|texto acima|dados acima|informações acima)\b',re.I)
scores={'original_material_question':110,'literal_pdf_extraction':105,'strict_explanation_extraction':86,'validated_explanation_statement':82,'validated_pdf_theory_statement':76}
def clean(s):
 s=' '.join(str(s).split()); m=cut.search(s); return s[:m.start()].rstrip(' .;') if m else s
cand=[]; rej=[]; seen=set(); recovered=0
for pos,orig in enumerate(old):
 q=copy.deepcopy(orig); text=' '.join(str(q.get('q','')).split()); typ=q.get('derived_type',''); raw=q.get('o') or []; opts=[clean(x) for x in raw]; reasons=[]
 if opts!=raw: recovered+=1
 q['o']=opts; ans=str(q.get('r','')).strip()
 if typ not in scores: reasons.append('tipo')
 if not 35<=len(text)<=1600: reasons.append('enunciado')
 if not 2<=len(opts)<=5 or any(len(x)<3 for x in opts): reasons.append('alternativas')
 if ans not in [chr(65+i) for i in range(len(opts))]: reasons.append('gabarito')
 if visual.search(text): reasons.append('visual')
 if not q.get('source_package') or not q.get('source_pdf'): reasons.append('rastreabilidade')
 norm=re.sub(r'\W+',' ',text.lower()).strip()
 if norm in seen: reasons.append('duplicata')
 if reasons: rej.append({'id':q.get('id'),'reasons':reasons}); continue
 seen.add(norm); score=scores[typ]+(10 if typ in ('original_material_question','literal_pdf_extraction') else 0)
 if re.search(r'\b(CEBRASPE|CESPE|FCC|FGV|VUNESP)\b',text,re.I): score+=5
 cand.append((score,-pos,q))
cand.sort(reverse=True,key=lambda x:(x[0],x[1])); real=[x for x in cand if x[2].get('derived_type') in ('original_material_question','literal_pdf_extraction')]; derived=[x for x in cand if x not in real]; kept=[x[2] for x in (real+derived)[:TARGET]]
if len(kept)<TARGET: raise SystemExit(f'Somente {len(kept)} itens válidos; preservando banco atual.')
d['questions']=kept; d['total']=TARGET; d['bank_version']=32; d['updated_at']='2026-09-30'; d['generation_rule']='v32: prioridade a questões originais/literais; limpeza somente de ruído editorial separável; derivações rastreáveis completam a meta. Sem reescrita conceitual nesta etapa.'
p.write_text(json.dumps(d,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
r={'before':len(old),'valid_candidates':len(cand),'recovered_editorial_noise':recovered,'after':len(kept),'by_type':dict(collections.Counter(q.get('derived_type') for q in kept)),'by_package':dict(collections.Counter(q.get('source_package') for q in kept)),'rejected':len(rej)}
Path('audit-question-bank-report.json').write_text(json.dumps(r,ensure_ascii=False,indent=2),encoding='utf-8'); print(json.dumps(r,ensure_ascii=False,indent=2))