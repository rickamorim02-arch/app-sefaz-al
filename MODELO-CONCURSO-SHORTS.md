# Concurso Shorts — Modelo Mestre V1

Este branch preserva uma cópia funcional da arquitetura do aplicativo Concurso Shorts no estado consolidado em 03/10/2026.

## Regra principal
Ao criar um aplicativo para outro concurso, NÃO redesenhar nem reescrever a estrutura do sistema. Preservar interface, navegação, Shorts, Ciclo de Estudos, timer, Leitura, Dicionário, Anotações, Matérias, Desempenho, relatório de erros, backup, responsividade celular/tablet e funcionamento offline.

O conteúdo do novo concurso deve ser substituído nos arquivos de dados e configurações, mantendo o motor intacto sempre que possível.

## Conteúdo variável
- nome do concurso e órgão;
- disciplinas e aulas;
- banco de questões e comentários;
- resumos da aba Leitura;
- conceitos do Dicionário;
- plano/ciclo de estudos quando necessário.

## Estrutura que deve ser preservada
- feed vertical Shorts;
- correção e comentários das questões;
- filtros somente no Shorts;
- Ciclo de Estudos e cronômetro;
- Leitura por disciplina e aula;
- Dicionário offline;
- Anotações;
- Matérias e Desempenho em Mais;
- relatório de erros;
- backup local;
- PWA e Service Worker;
- preparação para uso offline;
- layout responsivo para celular e tablet.

## Procedimento para novo concurso
1. Copiar este modelo para um novo repositório/branch.
2. Receber os ZIPs/PDFs do novo concurso.
3. Ler os materiais fornecidos e usar esses materiais como fonte do conteúdo.
4. Extrair as questões existentes e seus comentários quando presentes; não inventar validações ou explicações quando o material já as fornece.
5. Adaptar apenas o tamanho/apresentação das questões quando necessário para o formato Shorts, sem alterar seu sentido.
6. Gerar o banco de questões do novo concurso no mesmo esquema usado pelo motor.
7. Gerar `reading-data.json` com os resumos/conteúdos organizados por disciplina e aula.
8. Reconstruir o Dicionário a partir do conteúdo efetivamente disponível nos materiais.
9. Atualizar identificação/configuração do concurso.
10. Atualizar a versão do cache offline e testar em modo avião.
11. Testar celular e tablet.
12. Fazer auditoria final para confirmar que não existem resíduos do concurso anterior.

## Critério de fidelidade
Se os materiais não contiverem determinado conteúdo, não preencher silenciosamente com conhecimento geral. O conteúdo acadêmico deve permanecer rastreável aos materiais fornecidos, salvo quando o usuário pedir explicitamente pesquisa ou complementação externa.

## Preservação
O branch `modelo-concurso-shorts-v1` é uma referência do motor. Não deve ser usado para experimentos destrutivos. Novos concursos devem nascer de uma cópia dele.