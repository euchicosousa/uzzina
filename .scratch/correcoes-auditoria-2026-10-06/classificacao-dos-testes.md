# Classificação dos testes existentes e destino
Base: quatro arquivos tests/entrega*.test.ts, 55 casos. Classificação por grupo cobre os 55 casos, sem atribuir cobertura do app a funções recriadas dentro do teste.

## Resposta à dúvida sobre navegador
A maior parte dos testes questionados NÃO depende de navegador. O problema é que não chama a implementação do app. Uma promessa de rede pode ser atrasada artificialmente e ainda testar o salvamento real; uma fila criada apenas no teste valida somente aquela fila inventada.

**CÓDIGO PURO:** schema, política de autorização, handlers, payload, resultados de gravação.
**CÓDIGO COM DOM:** componente/hook real montado em jsdom, eventos e saída renderizada; é teste de código, não navegador real.
**BANCO REAL:** policies, grants, RPCs e transações executadas em banco de teste.
**NAVEGADOR REAL:** geometria, mobile, foco entre overlays, gestos reais e execução/interpretação final de HTML.
**PRODUÇÃO:** variáveis, deploy, domínio/cookie real, funções e configuração implantadas.

Um mesmo comportamento pode exigir mais de uma camada. Resultado em uma camada não encerra as demais.

## Entrega 1 — 17 casos
| Grupo | Casos | Destino |
|---|---:|---|
| Schemas reais | 9 | Manter; código puro. Isso inclui rejeição de datas/parceiros/título e defaults |
| “serialização para Supabase” | 1 | Parcial: chama schema, mas monta payload no próprio teste. Substituir por chamada de updateActionClient real no 08 |
| Título/criação/promessa/falha | 4 | Substituir por gaveta real no 09, código com DOM; foco/saída visual também 17 |
| finally/cancelamento do arraste | 2 | Substituir por useKanbanDnd real no 12; gesto físico também 17 |
| Responsáveis na troca de parceiro | 1 | Substituir por gaveta real no 09, DOM; não requer navegador para provar preservação |

## Entrega 2 — 12 casos
| Grupo | Casos | Destino |
|---|---:|---|
| sanitizeHtml real | 4 | Manter e ampliar no 01, usando jsdom com DOMPurify; exploração no parser real também 17 |
| Chaves públicas/internas reais | 1 | Manter; ampliar escopo de identidade no 13; não comprova RLS |
| Escopo de revisão com filter local | 1 | Substituir pelo handler de revisão real no 05; banco no 07 |
| Payload de IA com validador local | 3 | Substituir pelo handler real no 14; código puro com serviço externo falso |
| Hash e cliente ativo simulados | 2 | Substituir login/verificação reais no 02/06; banco no 07 |
| AdminGuard com função local | 1 | Substituir guard real montado no 16 e handlers administrativos reais no 06; autorização de banco no 07 |

## Entrega 3 — 6 casos
| Grupo | Casos | Destino |
|---|---:|---|
| Parceiro acessível/ausente em busca | 2 | Componente GlobalSearchCommand real no 16, DOM |
| Busca com respostas fora de ordem | 1 | Componente real e rede controlada no 16, DOM |
| Erro/vazio/loading/sucesso | 3 | Rotas/componentes reais e respostas externas preparadas no 16, DOM |

## Entrega 4 — 20 casos
| Grupo | Casos | Destino |
|---|---:|---|
| Parceiros reativos/permissão | 2 | Layout/contexto e QueryClient reais no 13; backend/RLS no 07 |
| Seleção/lote/rota | 4 | Provider/menu reais com recorte de IDs no 11; foco de input em DOM; visibilidade CSS no 17 |
| Mês, semanas, query key | 3 | Calendário real + captura da chamada HTTP no 16. Os testes atuais de date-fns provam biblioteca, não consulta do app |
| Pessoas ativas/arquivadas | 2 | fetchPeople/fetchAllPeople e admin reais no 16 |
| Duplicação | 1 | duplicateActionClient e hook reais no 10; não comparar dois objetos montados no teste |
| Preferências/fila | 2 | HeaderMenu real e persistência controlada no 15 |
| Alvo de atalho/rótulos acessíveis | 2 | Hook/combobox reais no 16; teclado, toque e leitor no 17 |
| Data/vazio de notificação | 1 | Header/popover reais no 16; posicionamento/fechamento real no 17 |
| Classificação social/feed | 1 | Manter função real; acrescentar gaveta de stories real no 16 |
| Rótulo de estratégia/fallback | 2 | Componente InstagramTab real no 16 |

## Regra de retirada
Não apagar toda a suíte por não haver navegador. Preservar casos úteis e substituir os simulados dentro do ticket correspondente, mantendo uma relação antigo → substituto. Casos puramente de geometria/gesto passam para o checklist 17 e saem da contagem de validação local. Se não existir teste válido naquela camada, escrever “pendente de navegador”, sem checkbox marcado nem função simulada para fabricar resultado.

O trabalho desta rodada cria documentos; nenhum teste existente foi apagado.

