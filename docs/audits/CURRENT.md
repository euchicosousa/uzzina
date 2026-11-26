# UZZINA — estado atual

Piloto documental aplicado no checkout em 24/11/2026. O estado abaixo vem dos registros datados. [Plano do piloto](../plans/2026-11-24-estado-e-continuidade.md)

| Entrega | Ambiente | Última evidência | Pendência e responsável |
| --- | --- | --- | --- |
| Funções da Vercel | `main`, produção a confirmar após o push | **26/11/2026.** A administração usa uma função. IA geral e propostas de Planejamento compartilham outra. O worker antigo de estratégias saiu e a importação por link usa `import-from-link`. O pacote serverless contém sete funções. [Inventário em HTML](../../.scratch/vercel-functions/estudo-unificacao.html) | **Codex** confirma o deploy. **Proprietário** confere em Administração, Planejamento e Gaveta da ação → Essencial → Arquivos. |
| Formulários de Usuários e Clientes | Produção Vercel Ready | **26/11/2026.** Os quatro formulários de Novo e Editar seguem o padrão de Parceiros desde `4f0a8161`, incluído no deploy `701df5d8`. O proprietário aprovou. O aceite foi enviado a `origin/main` em `edd771cc`. | Encerrado. |
| Programar publicações na gaveta → Instagram → Publicação | Produção Vercel e Supabase | **26/11/2026.** Proprietário confirmou que duplicar uma ação não leva os agendamentos. Stories já tinham evidência de envio automático. | Proprietário: cenários adiados e agendamento de Reel. |
| Calendário de Publicações | Produção Vercel | **26/11/2026.** Proprietário conferiu e aprovou a tela Publicações. | Encerrado. |
| Importar arquivos por link em Ação → Essencial → Arquivos | Produção Vercel | **26/11/2026.** Proprietário testou imagem, vídeo de Reel e carrossel e aprovou. | Encerrado. |
| Publicar Reel pela gaveta | Incidente em produção; correção em main | **26/11/2026.** Mesmo vídeo: 13h20 falhou depois de criar o contêiner; 13h23 publicou. A função local registra etapa e código de falha. | Publicar a mudança e conferir a evidência em eventual nova falha. |
| Contador de arquivos sem vínculo | Correção em main | **26/11/2026.** Os dois arquivos dos prints foram excluídos e permaneceram no catálogo como backups de zero bytes; a API agora ignora esses registros e verifica a exclusão dos IDs antes de descontar o lote. | Proprietário confere depois da publicação. |
| Nome de arquivo na publicação do Instagram | main | **26/11/2026.** Modal e rótulos de arquivo adotam uma linha com reticências e extensão visível. | Proprietário confere a largura do modal com arquivo longo. |
| Prévia de mídia na publicação e progresso da importação | main | **26/11/2026.** Seleção local mostra imagem ou vídeo na fila; publicação exibe quadro dos vídeos salvos. Importar por link tem barra por item e contagem real no lote. | Proprietário confere prévias e barra durante a transferência. |
| Exclusão definitiva e pastas de ex-clientes no Cloudinary | `main`; produção a confirmar | **26/11/2026.** A aba Ex-clientes reúne Execute Tecnologia e Ana Arcanjo Odontologia. Em uso distingue arquivos de ação, perfis e logos. A exclusão por ID revalida os vínculos e exige confirmação explícita para remover original, derivados e backup. Typecheck, 13 testes focados e 7 verificações serverless passaram. | Proprietário revisa e confirma cada lote no painel. A consulta de produção foi somente leitura. |

Comece pela [fila de tickets](../../.scratch/README.md) para saber qual ação pode ser assumida. Ideias e verificações gerais estão no [TODO](../../TODO.md).

## Demais áreas e histórico

Consulte o [registro integral anterior ao piloto](2026-11-24-current-history.md), incluindo as [pendências registradas](2026-11-24-current-history.md#pendências-reais), o [registro recente](2026-11-24-current-history.md#registro-recente) e o [histórico mais antigo](2026-11-24-current-history.md#referências-e-histórico). O histórico conserva os títulos, as âncoras e a numeração de linhas do arquivo antes do piloto. Cada entrada descreve a situação da sua rodada. Os [contratos por área](../contracts/) descrevem o funcionamento.
