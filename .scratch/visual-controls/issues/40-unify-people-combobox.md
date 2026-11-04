# 40 — Unificar os seletores de responsáveis e Sprint

**What to build:** um UPeopleCombobox com aparência consistente de Responsáveis e modos responsibles/sprint, reutilizando consulta, filtro, busca, lista e avatares.

**Blocked by:** nenhum. Executor Gemini.

**Status:** completed

- [x] Consolidar os dois seletores com modo explícito e callbacks tipados para cada contrato. isSprint pode ser usado somente se conservar a clareza e segurança dos contratos.
- [x] Preservar seleção múltipla, escopo por parceiros, cache por identidade, Shift e estados de carregamento/desabilitado. Não consultar pessoas fora do escopo atual.
- [x] No modo responsáveis, seleção comum mantém o popover aberto e devolve a lista de responsáveis.
- [x] No modo Sprint, selecionar alguém fora dos responsáveis adiciona a pessoa às duas listas; remover da Sprint mantém a responsabilidade. Shift torna somente a Sprint exclusiva, preservando os demais responsáveis. Manter o fechamento atual após seleção.
- [x] Devolver as duas listas da Sprint juntas e preservar sua gravação conjunta pelo consumidor. Não emitir duas escritas independentes nem substituir dados locais por resposta antiga.
- [x] Adotar a apresentação de Responsáveis nos dois modos, com identificação acessível e ícone próprio de Sprint. Respeitar variant/size dos consumidores e a geometria do rodapé.
- [x] Migrar os dois consumidores operacionais e os playgrounds. Remover os componentes antigos somente após conferir todas as referências. Diálogos de lote conservam seu fluxo próprio.
- [x] Conferir modo responsável e Sprint, pessoa já responsável e pessoa nova, remoção, Shift, troca de parceiro/sessão, teclado, desabilitado, claro/escuro e painel compacto. Demonstrar que seleção de Sprint não apaga responsáveis existentes.

Referência em docs/audits/2026-11-04-component-consolidation-studies.md. Começar CURRENT/AGENTS, conferir Git e preservar mudanças externas. Formatar e executar checks proporcionais; documentar verificação real, pendências visuais e passagem ao V41. Não publicar por consequência deste ticket.
